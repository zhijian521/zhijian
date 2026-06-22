'use client';

import { useState, useEffect } from 'react';

import { PlusIcon, Trash2Icon } from '@/components/ui/icons';
import Dialog from '@/components/ui/dialog';
import { getTodos, saveTodos, genId } from '@/lib/nav-storage';
import type { TodoItem } from '@/lib/nav-storage';

import styles from './todo-section.module.css';

/*-- 优先级 --*/
type Priority = 'urgent' | 'important' | 'normal';

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
    urgent: { label: '紧急', className: styles.priorityUrgent },
    important: { label: '重要', className: styles.priorityImportant },
    normal: { label: '一般', className: styles.priorityNormal },
};

/*-- textarea 自适应高度 --*/
function autoResize(el: HTMLTextAreaElement | null) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

export default function TodoSection() {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    /*-- 新增表单 --*/
    const [formText, setFormText] = useState('');
    const [formPriority, setFormPriority] = useState<Priority>('normal');
    const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));

    useEffect(() => {
        setTodos(getTodos());
    }, []);

    function persist(updated: TodoItem[]) {
        setTodos(updated);
        saveTodos(updated);
    }

    function handleAdd() {
        const text = formText.trim();
        if (!text) return;
        const newItem: TodoItem = {
            id: genId(),
            text,
            done: false,
            priority: formPriority,
            date: formDate || null,
            createdAt: Date.now(),
        };
        persist([newItem, ...todos]);
        setFormText('');
        setFormPriority('normal');
        setFormDate(new Date().toISOString().slice(0, 10));
        setShowAdd(false);
    }

    function handleToggle(id: string) {
        persist(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
    }

    function handleDelete(id: string) {
        persist(todos.filter(t => t.id !== id));
    }

    function handleUpdate(id: string, field: 'text' | 'priority' | 'date', value: string) {
        persist(todos.map(t => {
            if (t.id !== id) return t;
            if (field === 'text') return { ...t, text: value };
            if (field === 'priority') return { ...t, priority: value as Priority };
            if (field === 'date') return { ...t, date: value || null };
            return t;
        }));
    }

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h2 className={styles.title}>备忘录</h2>
                <button className={styles.addBtn} onClick={() => setShowAdd(true)} type="button">
                    <PlusIcon style={{ width: '0.875rem', height: '0.875rem' }} />
                    新增
                </button>
            </div>

            {todos.length === 0 ? (
                <p className={styles.empty}>暂无待办</p>
            ) : (
                <div className={styles.cardGrid}>
                    {todos.map((t) => {
                        const p = PRIORITY_CONFIG[t.priority as Priority] ?? PRIORITY_CONFIG.normal;
                        return (
                            <div key={t.id} className={`${styles.card} ${t.done ? styles.cardDone : ''}`}>
                                <div className={styles.cardHeader}>
                                    <input
                                        checked={t.done}
                                        className={styles.cardCheckbox}
                                        onChange={() => handleToggle(t.id)}
                                        type="checkbox"
                                    />
                                    <button
                                        className={`${styles.priorityTag} ${p.className}`}
                                        onClick={() => {
                                            const next: Priority = t.priority === 'urgent' ? 'important' : t.priority === 'important' ? 'normal' : 'urgent';
                                            handleUpdate(t.id, 'priority', next);
                                        }}
                                        type="button"
                                    >
                                        {p.label}
                                    </button>
                                    <button
                                        aria-label="删除"
                                        className={styles.cardDelete}
                                        onClick={() => handleDelete(t.id)}
                                        type="button"
                                    >
                                        <Trash2Icon className={styles.cardDeleteIcon} />
                                    </button>
                                </div>
                                <textarea
                                    className={styles.cardText}
                                    onChange={(e) => { handleUpdate(t.id, 'text', e.target.value); autoResize(e.currentTarget); }}
                                    placeholder="待办内容..."
                                    ref={autoResize}
                                    rows={1}
                                    value={t.text}
                                />
                                <input
                                    className={styles.cardDate}
                                    onChange={(e) => handleUpdate(t.id, 'date', e.target.value)}
                                    type="date"
                                    value={t.date ?? ''}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/*-- 新增弹窗 --*/}
            <Dialog onClose={() => setShowAdd(false)} open={showAdd} title="新增备忘录">
                <label className={styles.fieldLabel}>
                    内容
                    <input
                        className={styles.fieldInput}
                        onChange={(e) => setFormText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                        placeholder="待办内容..."
                        type="text"
                        value={formText}
                    />
                </label>
                <label className={styles.fieldLabel}>
                    类型
                    <select
                        className={styles.fieldInput}
                        onChange={(e) => setFormPriority(e.target.value as Priority)}
                        value={formPriority}
                    >
                        <option value="urgent">紧急</option>
                        <option value="important">重要</option>
                        <option value="normal">一般</option>
                    </select>
                </label>
                <label className={styles.fieldLabel}>
                    日期
                    <input
                        className={styles.fieldInput}
                        onChange={(e) => setFormDate(e.target.value)}
                        type="date"
                        value={formDate}
                    />
                </label>
                <div className={styles.dialogActions}>
                    <button className={styles.cancelBtn} onClick={() => setShowAdd(false)} type="button">
                        取消
                    </button>
                    <button className={styles.confirmBtn} onClick={handleAdd} type="button">
                        保存
                    </button>
                </div>
            </Dialog>
        </div>
    );
}
