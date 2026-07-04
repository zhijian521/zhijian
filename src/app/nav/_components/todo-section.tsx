'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { PlusIcon, Trash2Icon } from '@/components/ui/icons';
import { getTodos, saveTodos, genId } from '@/lib/domain/nav-storage';
import type { TodoItem } from '@/lib/domain/nav-storage';

import styles from './todo-section.module.css';

/*== 四象限配置：important/urgent 两维度组合 ==*/
interface Quadrant {
    key: string;
    important: boolean;
    urgent: boolean;
    label: string;
    cls: string;
}

const QUADRANTS: Quadrant[] = [
    { key: 'q1', important: true, urgent: true, label: '重要紧急', cls: styles.q1 },
    { key: 'q2', important: false, urgent: true, label: '不重要紧急', cls: styles.q2 },
    { key: 'q3', important: true, urgent: false, label: '重要不紧急', cls: styles.q3 },
    { key: 'q4', important: false, urgent: false, label: '不重要不紧急', cls: styles.q4 },
];

/*-- textarea 自适应高度 --*/
function autoResize(el: HTMLTextAreaElement | null) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

/*-- 拖拽落点状态 --*/
interface DropTarget {
    dragId: string;
    qKey: string;
    overCardId: string | null;
}

export default function TodoSection({ isLoggedIn, dataVersion }: { isLoggedIn?: boolean; dataVersion?: number }) {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const todosRef = useRef(todos);
    todosRef.current = todos;
    const dropTargetRef = useRef(dropTarget);
    dropTargetRef.current = dropTarget;

    useEffect(() => {
        getTodos(isLoggedIn).then(setTodos);
    }, [isLoggedIn, dataVersion]);

    const persist = useCallback((updated: TodoItem[]) => {
        setTodos(updated);
        saveTodos(updated, isLoggedIn);
    }, [isLoggedIn]);

    function todosOf(q: Quadrant): TodoItem[] {
        return todos.filter((t) => t.important === q.important && t.urgent === q.urgent);
    }

    /*== 拖拽 ==*/
    const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        setDropTarget({ dragId: id, qKey: '', overCardId: null });
    }, []);

    const handleQDragOver = useCallback((e: React.DragEvent, q: Quadrant) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const dt = dropTargetRef.current;
        if (!dt) return;
        if (dt.qKey !== q.key || dt.overCardId !== null) {
            setDropTarget({ dragId: dt.dragId, qKey: q.key, overCardId: null });
        }
    }, []);

    const handleCardDragOver = useCallback((e: React.DragEvent, id: string, q: Quadrant) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        const dt = dropTargetRef.current;
        if (!dt) return;
        if (dt.qKey !== q.key || dt.overCardId !== id) {
            setDropTarget({ dragId: dt.dragId, qKey: q.key, overCardId: id });
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, q: Quadrant) => {
        e.preventDefault();
        const dt = dropTargetRef.current;
        if (!dt || !dt.qKey) {
            setDropTarget(null);
            return;
        }
        if (dt.dragId === dt.overCardId) {
            setDropTarget(null);
            return;
        }

        const list = todosRef.current;
        const dragged = list.find((t) => t.id === dt.dragId);
        if (!dragged) {
            setDropTarget(null);
            return;
        }

        const moved: TodoItem = { ...dragged, important: q.important, urgent: q.urgent };
        const without = list.filter((t) => t.id !== dt.dragId);

        let insertIdx = without.length;
        if (dt.overCardId) {
            const overIdx = without.findIndex((t) => t.id === dt.overCardId);
            if (overIdx !== -1) insertIdx = overIdx;
        } else {
            let lastQIdx = -1;
            for (let i = without.length - 1; i >= 0; i--) {
                const t = without[i];
                if (t.important === q.important && t.urgent === q.urgent) {
                    lastQIdx = i;
                    break;
                }
            }
            insertIdx = lastQIdx + 1;
        }

        const next = [...without];
        next.splice(insertIdx, 0, moved);
        persist(next);
        setDropTarget(null);
    }, [persist]);

    const handleDragEnd = useCallback(() => {
        setDropTarget(null);
    }, []);

    /*-- 象限标题新增：直接插入默认项并进入编辑 --*/
    function handleAddInQuadrant(q: Quadrant) {
        const newItem: TodoItem = {
            id: genId(),
            text: '',
            done: false,
            important: q.important,
            urgent: q.urgent,
            date: null,
            createdAt: Date.now(),
        };
        /*-- 插到该象限第一项之前；象限为空则追加末尾 --*/
        const firstIdx = todos.findIndex((t) => t.important === q.important && t.urgent === q.urgent);
        const next = [...todos];
        next.splice(firstIdx === -1 ? next.length : firstIdx, 0, newItem);
        persist(next);
        setEditingId(newItem.id);
    }

    function handleToggle(id: string) {
        persist(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    }

    function handleDelete(id: string) {
        persist(todos.filter((t) => t.id !== id));
        if (editingId === id) setEditingId(null);
    }

    function handleUpdateText(id: string, value: string) {
        persist(todos.map((t) => (t.id === id ? { ...t, text: value } : t)));
    }

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h2 className={styles.title}>备忘录</h2>
            </div>

            <div className={styles.matrix}>
                {QUADRANTS.map((q) => {
                    const items = todosOf(q);
                    const isOver = dropTarget?.qKey === q.key;
                    return (
                        <div key={q.key} className={`${styles.quadrant} ${q.cls} ${isOver ? styles.dragOver : ''}`} onDragOver={(e) => handleQDragOver(e, q)} onDrop={(e) => handleDrop(e, q)}>
                            <div className={styles.qHeader}>
                                <span className={styles.qDot} />
                                <span className={styles.qTitle}>{q.label}</span>
                                <span className={styles.qCount}>{items.length}</span>
                                <button aria-label="新增" className={styles.qAdd} onClick={() => handleAddInQuadrant(q)} type="button">
                                    <PlusIcon style={{ width: '0.875rem', height: '0.875rem' }} />
                                </button>
                            </div>
                            <div className={styles.qList}>
                                {items.map((t) => {
                                    const isDragging = dropTarget?.dragId === t.id;
                                    const isEditing = editingId === t.id;
                                    return (
                                        <div
                                            key={t.id}
                                            className={`${styles.card} ${t.done ? styles.cardDone : ''} ${isDragging ? styles.cardDragging : ''} ${isEditing ? styles.cardEditing : ''}`}
                                            draggable={!isEditing}
                                            onDragStart={(e) => handleDragStart(e, t.id)}
                                            onDragOver={(e) => handleCardDragOver(e, t.id, q)}
                                            onDrop={(e) => {
                                                e.stopPropagation();
                                                handleDrop(e, q);
                                            }}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => {
                                                if (!isEditing) setEditingId(t.id);
                                            }}
                                        >
                                            <input checked={t.done} className={styles.cardCheckbox} onChange={() => handleToggle(t.id)} onClick={(e) => e.stopPropagation()} type="checkbox" />
                                            {isEditing ? (
                                                <textarea
                                                    autoFocus
                                                    className={styles.editArea}
                                                    onChange={(e) => {
                                                        handleUpdateText(t.id, e.target.value);
                                                        autoResize(e.currentTarget);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            setEditingId(null);
                                                        }
                                                        if (e.key === 'Escape') setEditingId(null);
                                                    }}
                                                    onBlur={() => setEditingId(null)}
                                                    placeholder="待办内容..."
                                                    ref={autoResize}
                                                    rows={1}
                                                    value={t.text}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <div className={`${styles.cardText} ${t.done ? styles.cardTextDone : ''}`}>{t.text || '（空）'}</div>
                                            )}
                                            <button
                                                aria-label="删除"
                                                className={styles.cardDelete}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(t.id);
                                                }}
                                                type="button"
                                            >
                                                <Trash2Icon className={styles.cardDeleteIcon} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
