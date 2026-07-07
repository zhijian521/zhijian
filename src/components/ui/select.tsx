'use client';

import React from 'react';
import styles from './select.module.css';

/*== Select 下拉选择 — 自建下拉面板，匹配文人书斋风格 ==*/
interface SelectProps<T extends string> {
    /** 选项列表 */
    options: { value: T; label: string }[];
    /** 当前选中值 */
    value: T;
    /** 变更回调 */
    onChange: (value: T) => void;
    /** 占位文字（无选中项时显示） */
    placeholder?: string;
    /** 尺寸：small 紧凑 / medium 中等 / default 默认 */
    size?: 'small' | 'medium' | 'default';
    /** 是否禁用 */
    disabled?: boolean;
    /** 附加类名 */
    className?: string;
}

const SIZE_CLASS: Record<string, string | undefined> = {
    small: 'small',
    medium: 'medium',
    // default 不需要额外 class，.trigger 基础样式即为 default 尺寸
};

export function Select<T extends string>({
    options,
    value,
    onChange,
    placeholder,
    size = 'medium',
    disabled = false,
    className,
}: SelectProps<T>) {
    const [open, setOpen] = React.useState(false);
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);

    const selected = options.find((o) => o.value === value);
    const sizeClass = SIZE_CLASS[size];

    /* 点击外部关闭 */
    React.useEffect(() => {
        if (!open) return;
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    /* Escape 关闭 */
    React.useEffect(() => {
        if (!open) return;
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setOpen(false);
                triggerRef.current?.focus();
            }
        }
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open]);

    function handleToggle() {
        if (disabled) return;
        setOpen((prev) => !prev);
    }

    function handleSelect(val: T) {
        onChange(val);
        setOpen(false);
        triggerRef.current?.focus();
    }

    return (
        <div
            className={`${styles.wrapper}${sizeClass ? ` ${styles[sizeClass]}` : ''}${className ? ` ${className}` : ''}`}
            ref={wrapperRef}
        >
            <button
                className={`${styles.trigger}${open ? ` ${styles.triggerOpen}` : ''}${disabled ? ` ${styles.triggerDisabled}` : ''}`}
                onClick={handleToggle}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleToggle();
                    }
                }}
                ref={triggerRef}
                type="button"
                disabled={disabled}
            >
                <span className={`${styles.triggerText}${!selected ? ` ${styles.triggerPlaceholder}` : ''}`}>
                    {selected ? selected.label : placeholder || '请选择'}
                </span>
                <span className={`${styles.chevron}${open ? ` ${styles.chevronOpen}` : ''}`}>
                    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" width="12" height="12">
                        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </button>

            {open && options.length > 0 && (
                <div className={styles.panel}>
                    {options.map((opt) => (
                        <button
                            className={`${styles.option}${opt.value === value ? ` ${styles.optionActive}` : ''}`}
                            key={opt.value}
                            onClick={() => handleSelect(opt.value)}
                            type="button"
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
