import styles from './text-input.module.css';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** 标签文字 */
    label?: string;
    /** 左侧图标，传入 SVG 元素 */
    icon?: React.ReactNode;
}

/*== TextInput 文本输入框 — 后台通用，支持标签和图标 ==*/
export function TextInput({ label, icon, className, id, ...props }: TextInputProps) {
    return (
        <div className={styles.fieldset}>
            {label ? (
                <label className={styles.label} htmlFor={id}>
                    {label}
                </label>
            ) : null}
            <div className={styles.inputWrap}>
                {icon ? <span className={styles.iconSlot}>{icon}</span> : null}
                <input
                    className={`${styles.input}${icon ? ` ${styles.hasIcon}` : ''}${className ? ` ${className}` : ''}`}
                    id={id}
                    {...props}
                />
            </div>
        </div>
    );
}