import styles from './text-input.module.css';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** 栓签文字 */
    label?: string;
    /** 左侧图标，传入 SVG 元素 */
    icon?: React.ReactNode;
    /** 输入框尺寸：default 默认 / small 紧凑 */
    inputSize?: 'default' | 'small';
}

/*== TextInput 文本输入框 — 后台通用，支持标签和图标 ==*/
export function TextInput({ label, icon, inputSize = 'default', className, id, ...props }: TextInputProps) {
    return (
        <div className={styles.fieldset}>
            {label ? (
                <label className={`${styles.label}${inputSize === 'small' ? ` ${styles.labelSmall}` : ''}`} htmlFor={id}>
                    {label}
                </label>
            ) : null}
            <div className={styles.inputWrap}>
                {icon ? <span className={styles.iconSlot}>{icon}</span> : null}
                <input
                    className={`${styles.input} ${styles[inputSize]}${icon ? ` ${styles.hasIcon}` : ''}${inputSize === 'small' && icon ? ` ${styles.hasIconSmall}` : ''}${className ? ` ${className}` : ''}`}
                    id={id}
                    {...props}
                />
            </div>
        </div>
    );
}