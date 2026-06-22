'use client';

import { useState, useEffect } from 'react';

import { PlusIcon, Trash2Icon } from '@/components/ui/icons';
import { getNotes, saveNotes, genId } from '@/lib/nav-storage';
import type { NoteItem } from '@/lib/nav-storage';

import styles from './note-section.module.css';

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function NoteSection() {
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        const loaded = getNotes();
        setNotes(loaded);
        if (loaded.length > 0) {
            setActiveId(loaded[0].id);
            setEditTitle(loaded[0].title);
            setEditContent(loaded[0].content);
        }
    }, []);

    function persist(updated: NoteItem[]) {
        setNotes(updated);
        saveNotes(updated);
    }

    function handleSelect(id: string) {
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
                    {notes.map((n) => (
                        <li
                            key={n.id}
                            className={`${styles.noteItem} ${n.id === activeId ? styles.noteItemActive : ''}`}
                            onClick={() => handleSelect(n.id)}
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
                    ))}
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
