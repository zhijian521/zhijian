'use client';

import { useState, useEffect } from 'react';

import { PlusIcon, Trash2Icon } from '@/components/ui/icons';
import Dialog from '@/components/ui/dialog';
import { getNotes, saveNotes } from '@/lib/nav-storage';
import type { NoteItem } from '@/lib/nav-storage';

import styles from './note-section.module.css';

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function NoteSection() {
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [editing, setEditing] = useState<NoteItem | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        setNotes(getNotes());
    }, []);

    function persist(updated: NoteItem[]) {
        setNotes(updated);
        saveNotes(updated);
    }

    function handleCreate() {
        const newItem: NoteItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            title: '',
            content: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setEditing(newItem);
        setEditTitle('');
        setEditContent('');
    }

    function handleOpen(note: NoteItem) {
        setEditing(note);
        setEditTitle(note.title);
        setEditContent(note.content);
    }

    function handleSave() {
        if (!editing) return;
        const now = Date.now();
        const updated: NoteItem = {
            ...editing,
            title: editTitle.trim() || '无标题',
            content: editContent,
            updatedAt: now,
        };
        const existing = notes.find(n => n.id === updated.id);
        if (existing) {
            persist(notes.map(n => n.id === updated.id ? updated : n));
        } else {
            persist([updated, ...notes]);
        }
        setEditing(null);
    }

    function handleDelete(id: string) {
        persist(notes.filter(n => n.id !== id));
    }

    return (
        <div className={styles.panel}>
            <h2 className={styles.title}>笔记</h2>
            {notes.length === 0 ? (
                <p className={styles.empty}>暂无笔记</p>
            ) : (
                <ul className={styles.list}>
                    {notes.map((n) => (
                        <li key={n.id} className={styles.noteItem} onClick={() => handleOpen(n)}>
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
            )}
            <button className={styles.addBtn} onClick={handleCreate} type="button">
                <PlusIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                新建笔记
            </button>

            {/*-- 编辑弹窗 --*/}
            <Dialog
                onClose={() => setEditing(null)}
                open={editing !== null}
                title="编辑笔记"
                maxWidth="40rem"
            >
                <input
                    className={styles.editorTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="标题"
                    type="text"
                    value={editTitle}
                />
                <textarea
                    className={styles.editorBody}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="开始写作（Markdown）..."
                    value={editContent}
                />
                <div className={styles.editorActions}>
                    <button className={styles.cancelBtn} onClick={() => setEditing(null)} type="button">
                        取消
                    </button>
                    <button className={styles.saveBtn} onClick={handleSave} type="button">
                        保存
                    </button>
                </div>
            </Dialog>
        </div>
    );
}
