'use client';

import { useState, useEffect } from 'react';

import { PlusIcon, Trash2Icon } from '@/components/ui/icons';
import { getTodos, saveTodos } from '@/lib/nav-storage';
import type { TodoItem } from '@/lib/nav-storage';

import styles from './todo-section.module.css';

export default function TodoSection() {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        setTodos(getTodos());
    }, []);

    function persist(updated: TodoItem[]) {
        setTodos(updated);
        saveTodos(updated);
    }

    function handleAdd() {
        const text = input.trim();
        if (!text) return;
        const newItem: TodoItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            text,
            done: false,
            createdAt: Date.now(),
        };
        persist([newItem, ...todos]);
        setInput('');
    }

    function handleToggle(id: string) {
        persist(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
    }

    function handleDelete(id: string) {
        persist(todos.filter(t => t.id !== id));
    }

    return (
        <div className={styles.panel}>
            <h2 className={styles.title}>备忘录</h2>
            <div className={styles.addRow}>
                <input
                    className={styles.addInput}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                    placeholder="添加待办..."
                    type="text"
                    value={input}
                />
                <button className={styles.addBtn} onClick={handleAdd} type="button">
                    <PlusIcon style={{ width: '0.875rem', height: '0.875rem' }} />
                </button>
            </div>
            {todos.length === 0 ? (
                <p className={styles.empty}>暂无待办</p>
            ) : (
                <ul className={styles.list}>
                    {todos.map((t) => (
                        <li key={t.id} className={styles.todoItem}>
                            <input
                                checked={t.done}
                                className={styles.todoCheckbox}
                                onChange={() => handleToggle(t.id)}
                                type="checkbox"
                            />
                            <span className={`${styles.todoText} ${t.done ? styles.todoTextDone : ''}`}>
                                {t.text}
                            </span>
                            <button
                                aria-label="删除"
                                className={styles.todoDelete}
                                onClick={() => handleDelete(t.id)}
                                type="button"
                            >
                                <Trash2Icon className={styles.todoDeleteIcon} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
