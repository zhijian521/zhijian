import styles from './text-input.module.css';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** 栓签文字 */
    label?: string;
    /** 左侧图标，传入 SVG 元素 */
    icon?: React.ReactNode;
    /** 输入框尺寸：small 紧凑 / medium 中等 / default 默认 */
    inputSize?: 'small' | 'medium' | 'default';
}

const LABEL_CLASS: Record<string, string> = {
    small: 'labelSmall',
    medium: 'labelMedium',
    default: 'labelDefault',
};

const ICON_PADDING_CLASS: Record<string, string | undefined> = {
    small: 'hasIconSmall',
    medium: 'hasIconMedium',
    default: 'hasIcon',
};

/*== TextInput 文本输入框 — 后台通用，支持标签和图标 ==*/
export function TextInput({ label, icon, inputSize = 'default', className, id, ...props }: TextInputProps) {
    const labelClass = LABEL_CLASS[inputSize];
    const iconPadClass = ICON_PADDING_CLASS[inputSize];
    return (
        <div className={styles.fieldset}>
            {label ? (
                <label className={`${styles.label} ${styles[labelClass]}`} htmlFor={id}>
                    {label}
                </label>
            ) : null}
            <div className={styles.inputWrap}>
                {icon ? <span className={styles.iconSlot}>{icon}</span> : null}
                <input
                    className={`${styles.input} ${styles[inputSize]}${icon ? ` ${styles.hasIcon}` : ''}${iconPadClass && icon ? ` ${styles[iconPadClass]}` : ''}${className ? ` ${className}` : ''}`}
                    id={id}
                    {...props}
                />
            </div>
        </div>
    );
}