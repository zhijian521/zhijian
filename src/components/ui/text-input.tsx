/*============================================================================
  text-input — 文本输入框

  后台通用输入框，支持标签（label）和左侧图标。
  small / medium / default 三尺寸，图标自动适配内边距。
============================================================================*/

/*== 样式导入 ==*/
import { cn } from '@/lib/core/utils';
import styles from './text-input.module.css';

/*== 类型定义 ==*/
export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /*-- 标签文字 --*/
    label?: string;
    /*-- 左侧图标，传入 SVG 元素 --*/
    icon?: React.ReactNode;
    /*-- 输入框尺寸：small 紧凑 / medium 中等 / default 默认 --*/
    inputSize?: 'small' | 'medium' | 'default';
}

const LABEL_CLASS: Record<string, string> = {
    small: 'labelSmall',
    medium: 'labelMedium',
};

const ICON_PADDING_CLASS: Record<string, string> = {
    small: 'hasIcon',
    medium: 'hasIcon',
    default: 'hasIcon',
};

/*== TextInput 文本输入框 — 后台通用，支持标签和图标 ==*/
export function TextInput({ label, icon, inputSize = 'medium', className, id, ...props }: TextInputProps) {
    const labelClass = LABEL_CLASS[inputSize];
    const iconPadClass = icon ? ICON_PADDING_CLASS[inputSize] : undefined;
    const sizeClass = inputSize !== 'default' ? styles[inputSize] : undefined;
    return (
        <div className={styles.fieldset}>
            {label ? (
                <label className={cn(styles.label, labelClass && styles[labelClass])} htmlFor={id}>
                    {label}
                </label>
            ) : null}
            <div className={styles.inputWrap}>
                {icon ? <span className={styles.iconSlot}>{icon}</span> : null}
                <input
                    className={cn(styles.input, sizeClass, iconPadClass && styles[iconPadClass], className)}
                    id={id}
                    {...props}
                />
            </div>
        </div>
    );
}
