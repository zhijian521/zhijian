'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { MarkdownArticle } from '@/components/site/markdown-article';
import { PlusIcon, Trash2Icon, ArrowUpIcon, SparklesIcon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import type { ChatConversation, ChatMessage } from '@/lib/domain/nav-storage';
import { genId, getChatConversations, saveChatConversations, getAiModel, setAiModel } from '@/lib/domain/nav-storage';

import styles from './ai-section.module.css';

interface AiSectionProps {
    isLoggedIn?: boolean;
    dataVersion?: number;
    loading: boolean;
    onRequireLogin: () => void;
    initialQuery: string;
    onConsumedInitialQuery: () => void;
}

function formatTime(ts: number): string {
    return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function titleFromMessage(text: string): string {
    const t = text.trim().replace(/\s+/g, ' ');
    return t ? t.slice(0, 24) : '新对话';
}

export default function AiSection({ isLoggedIn, dataVersion, loading, onRequireLogin, initialQuery, onConsumedInitialQuery }: AiSectionProps) {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [streamingText, setStreamingText] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [models, setModels] = useState<string[]>([]);
    const [model, setModel] = useState('');
    const [modelOpen, setModelOpen] = useState(false);

    const conversationsRef = useRef(conversations);
    conversationsRef.current = conversations;
    const activeIdRef = useRef(activeId);
    activeIdRef.current = activeId;
    const streamingRef = useRef(streaming);
    streamingRef.current = streaming;
    const abortRef = useRef<AbortController | null>(null);
    const modelRef = useRef(model);
    modelRef.current = model;

    const messagesRef = useRef<HTMLDivElement>(null);
    const modelDropdownRef = useRef<HTMLDivElement>(null);

    /*-- 加载历史 --*/
    useEffect(() => {
        getChatConversations(isLoggedIn).then((loaded) => {
            setConversations(loaded);
            setActiveId(loaded.length > 0 ? loaded[0].id : null);
        });
    }, [isLoggedIn, dataVersion]);

    /*-- 初始化模型偏好 + 拉取可用模型列表 --*/
    useEffect(() => {
        setModel(getAiModel());
        if (!isLoggedIn) return;
        let cancelled = false;
        fetch('/api/ai/models')
            .then((res) => (res.ok ? res.json() : null))
            .then((json) => {
                if (cancelled || !json?.data) return;
                const list = json.data as string[];
                setModels(list);
                /*-- 列表返回后若本地无偏好，默认选第一个 --*/
                if (!getAiModel() && list.length > 0) {
                    setModel(list[0]);
                    setAiModel(list[0]);
                }
            })
            .catch(() => {
                /* 拉取失败不影响对话，发送时后端用默认模型 */
            });
        return () => {
            cancelled = true;
        };
    }, [isLoggedIn]);

    /*-- 点外面关闭模型下拉 --*/
    useEffect(() => {
        if (!modelOpen) return;
        function handleClick(e: MouseEvent) {
            if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
                setModelOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [modelOpen]);

    /*-- 滚动到底部 --*/
    const scrollToBottom = useCallback(() => {
        const el = messagesRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [activeId, streamingText, scrollToBottom]);

    const persist = useCallback(
        (updated: ChatConversation[]) => {
            setConversations(updated);
            saveChatConversations(updated, isLoggedIn);
        },
        [isLoggedIn]
    );

    const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

    /*-- 发送一条消息 --*/
    const send = useCallback(
        async (text: string) => {
            const content = text.trim();
            if (!content || streamingRef.current) return;

            /*-- 未登录拦截 --*/
            if (!isLoggedIn) {
                onRequireLogin();
                return;
            }

            /*-- 确保有会话；没有则新建 --*/
            let convId = activeIdRef.current;
            let baseConvs = conversationsRef.current;
            const now = Date.now();
            const userMsg: ChatMessage = { id: genId(), role: 'user', content, createdAt: now };

            if (!convId) {
                const newConv: ChatConversation = {
                    id: genId(),
                    title: titleFromMessage(content),
                    messages: [userMsg],
                    createdAt: now,
                    updatedAt: now,
                };
                convId = newConv.id;
                baseConvs = [newConv, ...baseConvs];
                setActiveId(convId);
            } else {
                baseConvs = baseConvs.map((c) => {
                    if (c.id !== convId) return c;
                    const isFirst = c.messages.length === 0;
                    return {
                        ...c,
                        title: isFirst ? titleFromMessage(content) : c.title,
                        messages: [...c.messages, userMsg],
                        updatedAt: now,
                    };
                });
            }

            persist(baseConvs);
            setInput('');
            setStreaming(true);
            setStreamingText('');

            /*-- 构造发给 API 的 messages（仅 role/content，不带本地 id） --*/
            const activeConv = baseConvs.find((c) => c.id === convId);
            const apiMessages = activeConv ? activeConv.messages.map((m) => ({ role: m.role, content: m.content })) : [];

            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const res = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: apiMessages,
                        model: modelRef.current || undefined,
                    }),
                    signal: controller.signal,
                });

                if (!res.ok) {
                    const json = await res.json().catch(() => null);
                    throw new Error(json?.message || `AI 请求失败（${res.status}）`);
                }

                /*-- 读取 SSE 流 --*/
                const reader = res.body?.getReader();
                if (!reader) throw new Error('AI 响应流不可读。');

                const decoder = new TextDecoder();
                let buffer = '';
                let acc = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });

                    let nl: number;
                    while ((nl = buffer.indexOf('\n')) !== -1) {
                        const line = buffer.slice(0, nl).trim();
                        buffer = buffer.slice(nl + 1);
                        if (!line.startsWith('data:')) continue;
                        const payload = line.slice(5).trim();
                        if (payload === '[DONE]') continue;

                        let json: { content?: string; error?: string };
                        try {
                            json = JSON.parse(payload);
                        } catch {
                            /*-- 单行解析失败静默跳过，不中断整条流（与服务端一致） --*/
                            continue;
                        }

                        if (json.error) {
                            throw new Error(json.error);
                        }
                        if (typeof json.content === 'string') {
                            acc += json.content;
                            setStreamingText(acc);
                        }
                    }
                }

                /*-- 落定 assistant 消息 --*/
                const assistantMsg: ChatMessage = {
                    id: genId(),
                    role: 'assistant',
                    content: acc || '（无回复）',
                    createdAt: Date.now(),
                };
                const finalConvs = conversationsRef.current.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() } : c));
                persist(finalConvs);
            } catch (e) {
                if ((e as Error).name === 'AbortError') return;
                toast.error(e instanceof Error ? e.message : 'AI 对话出错，请稍后重试。');
            } finally {
                setStreaming(false);
                setStreamingText('');
                abortRef.current = null;
            }
        },
        [isLoggedIn, onRequireLogin, persist]
    );

    /*-- 搜索栏带入的初始 query：登录态下自动发送，未登录则交给 onRequireLogin 流程，不清空 --*/
    useEffect(() => {
        if (initialQuery && !streaming && isLoggedIn) {
            send(initialQuery);
            onConsumedInitialQuery();
        }
    }, [initialQuery, send, streaming, isLoggedIn, onConsumedInitialQuery]);

    /*-- 登录态/数据版本变化或卸载时，中断进行中的流，避免 finally 写入与列表重置竞态 --*/
    useEffect(() => {
        return () => {
            abortRef.current?.abort();
        };
    }, [isLoggedIn, dataVersion]);

    function handleCreateConversation() {
        if (streaming) return;
        const now = Date.now();
        const newConv: ChatConversation = {
            id: genId(),
            title: '新对话',
            messages: [],
            createdAt: now,
            updatedAt: now,
        };
        persist([newConv, ...conversationsRef.current]);
        setActiveId(newConv.id);
        setInput('');
    }

    function handleSelect(id: string) {
        if (streaming) return;
        setActiveId(id);
    }

    function handleConfirmDelete() {
        if (!confirmDeleteId) return;
        /*-- 流式中途禁止删除正在回复的会话，避免回复落空 --*/
        if (streaming && confirmDeleteId === activeIdRef.current) {
            toast.error('AI 正在回复，请稍后再删除。');
            setConfirmDeleteId(null);
            return;
        }
        const next = conversationsRef.current.filter((c) => c.id !== confirmDeleteId);
        persist(next);
        if (activeIdRef.current === confirmDeleteId) {
            setActiveId(next.length > 0 ? next[0].id : null);
        }
        setConfirmDeleteId(null);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send(input);
        }
    }

    function handleModelChange(m: string) {
        setModel(m);
        setAiModel(m);
        setModelOpen(false);
    }

    /*-- 未登录态 --*/
    if (!loading && !isLoggedIn) {
        return (
            <div className={styles.panel}>
                <div className={styles.emptyState}>
                    <SparklesIcon style={{ width: '2rem', height: '2rem', color: 'var(--primary)' }} />
                    <p className={styles.emptyText}>登录后即可使用 AI 对话。</p>
                    <button className={styles.emptyAction} onClick={onRequireLogin} type="button">
                        登录
                    </button>
                </div>
            </div>
        );
    }

    const messages = activeConversation?.messages ?? [];

    return (
        <div className={styles.panel}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.title}>对话</h2>
                    <button aria-label="新建对话" className={styles.addBtn} onClick={handleCreateConversation} type="button">
                        <PlusIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                    </button>
                </div>

                <ul className={styles.list}>
                    {conversations.map((c) => (
                        <li key={c.id} className={`${styles.convItem} ${c.id === activeId ? styles.convItemActive : ''}`} onClick={() => handleSelect(c.id)}>
                            <div className={styles.convInfo}>
                                <p className={styles.convTitle}>{c.title || '新对话'}</p>
                                <p className={styles.convMeta}>{formatTime(c.updatedAt)}</p>
                            </div>
                            <button
                                aria-label="删除对话"
                                className={styles.convDelete}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(c.id);
                                }}
                                type="button"
                            >
                                <Trash2Icon className={styles.convDeleteIcon} />
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>

            <section className={styles.detail}>
                <div className={styles.detailHeader}>
                    <h3 className={styles.detailTitle}>{activeConversation?.title ?? 'AI 对话'}</h3>
                    <div className={styles.detailRight}>
                        {models.length > 0 ? (
                            <div ref={modelDropdownRef} className={styles.modelAnchor}>
                                <button className={styles.modelBtn} onClick={() => setModelOpen((v) => !v)} type="button">
                                    {model || '默认模型'}
                                </button>
                                {modelOpen ? (
                                    <div className={styles.modelDropdown}>
                                        {models.map((m) => (
                                            <button key={m} className={`${styles.modelOption} ${m === model ? styles.modelOptionActive : ''}`} onClick={() => handleModelChange(m)} type="button">
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                        <span className={styles.detailMeta}>{messages.length > 0 ? `${messages.length} 条消息` : ''}</span>
                    </div>
                </div>

                <div className={styles.messages} ref={messagesRef}>
                    {messages.length === 0 && !streaming ? (
                        <div className={styles.emptyState}>
                            <SparklesIcon style={{ width: '1.75rem', height: '1.75rem', color: 'var(--primary)' }} />
                            <p className={styles.emptyText}>输入问题，开始对话。</p>
                        </div>
                    ) : null}

                    {messages.map((m) => (
                        <div key={m.id} className={`${styles.msg} ${m.role === 'user' ? styles.msgUser : styles.msgAssistant}`}>
                            <div className={`${styles.bubble} ${m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}`}>
                                {m.role === 'assistant' ? (
                                    <div className={styles.bubbleAssistantContent}>
                                        <MarkdownArticle content={m.content} />
                                    </div>
                                ) : (
                                    m.content
                                )}
                            </div>
                        </div>
                    ))}

                    {streaming ? (
                        <div className={`${styles.msg} ${styles.msgAssistant}`}>
                            <div className={`${styles.bubble} ${styles.bubbleAssistant}`}>
                                <div className={styles.bubbleAssistantContent}>
                                    {streamingText ? <MarkdownArticle content={streamingText} /> : null}
                                    <span className={styles.cursor} />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className={styles.composer}>
                    <div className={styles.inputWrap}>
                        <textarea
                            className={styles.input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="输入消息，Enter 发送，Shift+Enter 换行..."
                            rows={1}
                            value={input}
                        />
                    </div>
                    <button aria-label="发送" className={styles.sendBtn} disabled={streaming || !input.trim()} onClick={() => send(input)} type="button">
                        <ArrowUpIcon className={styles.sendIcon} />
                    </button>
                </div>
            </section>

            <ConfirmDialog
                confirmLabel="删除"
                message="删除后无法恢复，确定删除这个对话吗？"
                onCancel={() => setConfirmDeleteId(null)}
                onConfirm={handleConfirmDelete}
                open={confirmDeleteId !== null}
                title="删除对话"
            />
        </div>
    );
}
