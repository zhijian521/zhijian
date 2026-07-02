'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { PlusIcon, Trash2Icon } from '@/components/ui/icons';
import { getNotes, saveNotes, genId } from '@/lib/nav-storage';
import type { NoteItem } from '@/lib/nav-storage';
import { reorder, type DragState } from './drag-utils';

import styles from './note-section.module.css';

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function NoteSection({ isLoggedIn, dataVersion }: { isLoggedIn?: boolean; dataVersion?: number }) {
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [dragState, setDragState] = useState<DragState | null>(null);

    /*-- 用 ref 持有最新值，避免闭包陷阱 --*/
    const notesRef = useRef(notes);
    notesRef.current = notes;
    const dragStateRef = useRef(dragState);
    dragStateRef.current = dragState;
    const justDraggedRef = useRef(false);

    useEffect(() => {
        getNotes(isLoggedIn).then(loaded => {
            setNotes(loaded);
            if (loaded.length > 0) {
                setActiveId(loaded[0].id);
                setEditTitle(loaded[0].title);
                setEditContent(loaded[0].content);
            }
        });
    }, [isLoggedIn, dataVersion]);

    function persist(updated: NoteItem[]) {
        setNotes(updated);
        saveNotes(updated, isLoggedIn);
    }

    /*== 拖拽 — 用 ref 读取最新值，回调稳定不重建 ==*/
    const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        setDragState({ dragId: id, overId: null, position: null });
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const position = e.clientY < midY ? 'before' : 'after';
        setDragState(prev => prev ? { ...prev, overId: id, position } : prev);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, id: string) => {
        e.preventDefault();
        const ds = dragStateRef.current;
        if (!ds || ds.dragId === id || !ds.position) return;
        persist(reorder(notesRef.current, ds.dragId, id, ds.position as 'before' | 'after'));
        setDragState(null);
        justDraggedRef.current = true;
        setTimeout(() => { justDraggedRef.current = false; }, 0);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDragState(null);
    }, []);

    function handleSelect(id: string) {
        if (justDraggedRef.current) return;
        setActiveId(id);
        const note = notes.find(n => n.id === id);
        if (note) {
            setEditTitle(note.title);
            setEditContent(note.content);
        }
    }

    function handleCreate() {
        const newItem: NoteItem = {
            id: genId(),
            title: '',
            content: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        persist([newItem, ...notes]);
        setActiveId(newItem.id);
        setEditTitle('');
        setEditContent('');
    }

    function handleDelete(id: string) {
        const updated = notes.filter(n => n.id !== id);
        persist(updated);
        if (activeId === id) {
            if (updated.length > 0) {
                setActiveId(updated[0].id);
                setEditTitle(updated[0].title);
                setEditContent(updated[0].content);
            } else {
                setActiveId(null);
                setEditTitle('');
                setEditContent('');
            }
        }
    }

    function handleSave() {
        if (!activeId) return;
        const now = Date.now();
        persist(notes.map(n =>
            n.id === activeId
                ? { ...n, title: editTitle.trim() || '无标题', content: editContent, updatedAt: now }
                : n
        ));
    }

    /*-- 失焦自动保存 --*/
    function handleBlur() {
        if (!activeId) return;
        const note = notes.find(n => n.id === activeId);
        if (!note) return;
        if (note.title !== (editTitle.trim() || '无标题') || note.content !== editContent) {
            handleSave();
        }
    }

    const activeNote = notes.find(n => n.id === activeId);

    return (
        <div className={styles.panel}>
            {/*-- 左侧列表 --*/}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.title}>笔记</h2>
                    <button className={styles.addBtn} onClick={handleCreate} type="button">
                        <PlusIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                    </button>
                </div>
                <ul className={styles.list}>
                    {notes.map((n) => {
                        const isDragOver = dragState?.overId === n.id && dragState?.position;
                        const dragCls = isDragOver === 'before' ? styles.dragOverBefore : isDragOver === 'after' ? styles.dragOverAfter : '';
                        return (
                            <li
                                key={n.id}
                                className={`${styles.noteItem} ${n.id === activeId ? styles.noteItemActive : ''} ${dragCls}`}
                                draggable
                                onClick={() => handleSelect(n.id)}
                                onDragStart={(e) => handleDragStart(e, n.id)}
                                onDragOver={(e) => handleDragOver(e, n.id)}
                                onDrop={(e) => handleDrop(e, n.id)}
                                onDragEnd={handleDragEnd}
                            >
                            <div className={styles.noteInfo}>
                                <p className={styles.noteTitle}>{n.title || '无标题'}</p>
                                <p className={styles.noteDate}>{formatDate(n.updatedAt)}</p>
                            </div>
                            <button
                                aria-label="删除"
                                className={styles.noteDelete}
                                onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                                type="button"
                            >
                                <Trash2Icon className={styles.noteDeleteIcon} />
                            </button>
                        </li>
                        );
                    })}
                </ul>
            </div>

            {/*-- 右侧详情 --*/}
            <div className={styles.detail}>
                {activeNote ? (
                    <>
                        <input
                            className={styles.detailTitle}
                            onBlur={handleBlur}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="标题"
                            type="text"
                            value={editTitle}
                        />
                        <textarea
                            className={styles.detailBody}
                            onBlur={handleBlur}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="开始写作（Markdown）..."
                            value={editContent}
                        />
                    </>
                ) : (
                    <p className={styles.empty}>选择或新建一篇笔记</p>
                )}
            </div>
        </div>
    );
}
