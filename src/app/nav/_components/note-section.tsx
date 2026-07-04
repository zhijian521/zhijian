'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ArticleView } from '@/components/site/article-view';
import { PlusIcon, Trash2Icon } from '@/components/ui/icons';
import type { NoteItem } from '@/lib/domain/nav-storage';
import { genId, getNotes, saveNotes } from '@/lib/domain/nav-storage';

import { reorder, type DragState } from './drag-utils';
import NoteMarkdownEditor from './note-markdown-editor';

import styles from './note-section.module.css';

type ViewMode = 'edit' | 'preview';

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getDisplayTitle(title: string): string {
    return title.trim() || '无标题';
}

export default function NoteSection({ isLoggedIn, dataVersion }: { isLoggedIn?: boolean; dataVersion?: number }) {
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('edit');
    const [dragState, setDragState] = useState<DragState | null>(null);

    const notesRef = useRef(notes);
    notesRef.current = notes;

    const activeIdRef = useRef(activeId);
    activeIdRef.current = activeId;

    const editTitleRef = useRef(editTitle);
    editTitleRef.current = editTitle;

    const editContentRef = useRef(editContent);
    editContentRef.current = editContent;

    const dragStateRef = useRef(dragState);
    dragStateRef.current = dragState;

    const justDraggedRef = useRef(false);

    useEffect(() => {
        getNotes(isLoggedIn).then((loaded) => {
            setNotes(loaded);
            if (loaded.length === 0) {
                setActiveId(null);
                setEditTitle('');
                setEditContent('');
                setViewMode('edit');
                return;
            }

            const firstNote = loaded[0];
            setActiveId(firstNote.id);
            setEditTitle(firstNote.title);
            setEditContent(firstNote.content);
            setViewMode('edit');
        });
    }, [isLoggedIn, dataVersion]);

    const persist = useCallback(
        (updated: NoteItem[]) => {
            setNotes(updated);
            saveNotes(updated, isLoggedIn);
        },
        [isLoggedIn]
    );

    const persistActiveDraft = useCallback(
        (sourceNotes: NoteItem[] = notesRef.current): NoteItem[] => {
            const currentActiveId = activeIdRef.current;
            if (!currentActiveId) return sourceNotes;

            const currentTitle = getDisplayTitle(editTitleRef.current);
            const currentContent = editContentRef.current;
            let hasChanged = false;

            const updated = sourceNotes.map((note) => {
                if (note.id !== currentActiveId) return note;
                if (note.title === currentTitle && note.content === currentContent) return note;

                hasChanged = true;
                return {
                    ...note,
                    title: currentTitle,
                    content: currentContent,
                    updatedAt: Date.now(),
                };
            });

            if (hasChanged) {
                persist(updated);
                return updated;
            }

            return sourceNotes;
        },
        [persist]
    );

    const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        setDragState({ dragId: id, overId: null, position: null });
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
        setDragState((prev) => (prev ? { ...prev, overId: id, position } : prev));
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, id: string) => {
            e.preventDefault();
            const currentDragState = dragStateRef.current;
            if (!currentDragState || currentDragState.dragId === id || !currentDragState.position) return;

            persist(reorder(notesRef.current, currentDragState.dragId, id, currentDragState.position as 'before' | 'after'));
            setDragState(null);
            justDraggedRef.current = true;
            setTimeout(() => {
                justDraggedRef.current = false;
            }, 0);
        },
        [persist]
    );

    const handleDragEnd = useCallback(() => {
        setDragState(null);
    }, []);

    function handleSelect(id: string) {
        if (justDraggedRef.current) return;

        const updatedNotes = persistActiveDraft();
        const nextNote = updatedNotes.find((note) => note.id === id);
        if (!nextNote) return;

        setActiveId(id);
        setEditTitle(nextNote.title);
        setEditContent(nextNote.content);
    }

    function handleCreate() {
        const updatedNotes = persistActiveDraft();
        const newItem: NoteItem = {
            id: genId(),
            title: '',
            content: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        const nextNotes = [newItem, ...updatedNotes];

        persist(nextNotes);
        setActiveId(newItem.id);
        setEditTitle('');
        setEditContent('');
        setViewMode('edit');
    }

    function handleDelete(id: string) {
        const updatedNotes = persistActiveDraft();
        const nextNotes = updatedNotes.filter((note) => note.id !== id);
        persist(nextNotes);

        if (activeIdRef.current !== id) return;

        const nextActive = nextNotes[0];
        if (!nextActive) {
            setActiveId(null);
            setEditTitle('');
            setEditContent('');
            setViewMode('edit');
            return;
        }

        setActiveId(nextActive.id);
        setEditTitle(nextActive.title);
        setEditContent(nextActive.content);
    }

    function handleViewModeChange(mode: ViewMode) {
        persistActiveDraft();
        setViewMode(mode);
    }

    function handleDraftBlur() {
        persistActiveDraft();
    }

    const activeNote = notes.find((note) => note.id === activeId);
    const updatedLabel = activeNote ? formatDate(activeNote.updatedAt) : '';

    return (
        <div className={styles.panel}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.title}>笔记</h2>
                    <button className={styles.addBtn} onClick={handleCreate} type="button">
                        <PlusIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                    </button>
                </div>

                <ul className={styles.list}>
                    {notes.map((note) => {
                        const dragPosition = dragState?.overId === note.id ? dragState.position : null;
                        const dragClass = dragPosition === 'before' ? styles.dragOverBefore : dragPosition === 'after' ? styles.dragOverAfter : '';

                        return (
                            <li
                                key={note.id}
                                className={`${styles.noteItem} ${note.id === activeId ? styles.noteItemActive : ''} ${dragClass}`}
                                draggable
                                onClick={() => handleSelect(note.id)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, note.id)}
                                onDragStart={(e) => handleDragStart(e, note.id)}
                                onDrop={(e) => handleDrop(e, note.id)}
                            >
                                <div className={styles.noteInfo}>
                                    <p className={styles.noteTitle}>{getDisplayTitle(note.title)}</p>
                                    <p className={styles.noteDate}>{formatDate(note.updatedAt)}</p>
                                </div>
                                <button
                                    aria-label="删除笔记"
                                    className={styles.noteDelete}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(note.id);
                                    }}
                                    type="button"
                                >
                                    <Trash2Icon className={styles.noteDeleteIcon} />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </aside>

            <section className={styles.detail}>
                {activeNote ? (
                    <>
                        <div className={styles.detailHeader}>
                            <div className={styles.detailHeaderMain}>
                                {viewMode === 'edit' ? (
                                    <input
                                        className={styles.detailTitle}
                                        onBlur={handleDraftBlur}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        placeholder="笔记标题"
                                        type="text"
                                        value={editTitle}
                                    />
                                ) : null}
                                <p className={`${styles.detailMeta} ${viewMode === 'preview' ? styles.detailMetaPreview : ''}`}>上次更新 {updatedLabel}</p>
                            </div>

                            <div className={styles.viewTabs}>
                                <button className={`${styles.viewTab} ${viewMode === 'edit' ? styles.viewTabActive : ''}`} onClick={() => handleViewModeChange('edit')} type="button">
                                    编辑
                                </button>
                                <button className={`${styles.viewTab} ${viewMode === 'preview' ? styles.viewTabActive : ''}`} onClick={() => handleViewModeChange('preview')} type="button">
                                    预览
                                </button>
                            </div>
                        </div>

                        <div className={styles.detailContent}>
                            {viewMode === 'edit' ? (
                                <NoteMarkdownEditor content={editContent} onBlur={handleDraftBlur} onContentChange={setEditContent} />
                            ) : (
                                <div className={styles.previewPane}>
                                    <ArticleView content={editContent} fullWidth />
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyText}>还没有笔记，先新建一篇开始写。</p>
                        <button className={styles.emptyAction} onClick={handleCreate} type="button">
                            新建笔记
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
