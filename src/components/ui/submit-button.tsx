import styles from './submit-button.module.css';

export interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** 按钮尺寸：small 紧凑 / medium 中等 / default 默认 */
    size?: 'small' | 'medium' | 'default';
}

const SIZE_CLASS: Record<string, string | undefined> = {
    small: 'small',
    medium: 'medium',
    // default 不需要额外 class，基础样式即为 default 尺寸
};

/*== SubmitButton 提交按钮 — 朱砂红主按钮，全站通用 ==*/
export function SubmitButton({ size = 'medium', className, children, ...props }: SubmitButtonProps) {
    const sizeClass = SIZE_CLASS[size];
    return (
        <button
            className={`${styles.button}${sizeClass ? ` ${styles[sizeClass]}` : ''}${className ? ` ${className}` : ''}`}
            type="submit"
            {...props}
        >
            {children}
        </button>
    );
}
