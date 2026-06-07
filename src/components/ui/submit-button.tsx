import styles from './submit-button.module.css';

export interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** 按钮尺寸：small 紧凑 / medium 中等 / default 默认 */
    size?: 'small' | 'medium' | 'default';
}

/*== SubmitButton 提交按钮 — 朱砂红主按钮，全站通用 ==*/
export function SubmitButton({ size = 'default', className, children, ...props }: SubmitButtonProps) {
    return (
        <button
            className={`${styles.button} ${styles[size]}${className ? ` ${className}` : ''}`}
            type="submit"
            {...props}
        >
            {children}
        </button>
    );
}