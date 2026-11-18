/*============================================================================
  text-input — 文本输入框

  通用输入框，支持单行/多行、标签（label）和左侧图标。
  small / medium / default 三尺寸，图标自动适配内边距。
============================================================================*/

/*== 样式导入 ==*/
import { cn } from '@/lib/core/utils';
import styles from './text-input.module.css';

/*== 类型定义 ==*/
interface TextInputBaseProps {
    /*-- 标签文字 --*/
    label?: string;
    /*-- 左侧图标，传入 SVG 元素 --*/
    icon?: React.ReactNode;
    /*-- 输入框尺寸：small 紧凑 / medium 中等 / default 默认 --*/
    inputSize?: 'small' | 'medium' | 'default';
}

type SingleLineTextInputProps = TextInputBaseProps &
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
        multiline?: false;
    };

type MultilineTextInputProps = TextInputBaseProps &
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> & {
        multiline: true;
    };

export type TextInputProps = SingleLineTextInputProps | MultilineTextInputProps;

const LABEL_CLASS: Record<string, string> = {
    small: 'labelSmall',
    medium: 'labelMedium',
};

const ICON_PADDING_CLASS: Record<string, string> = {
    small: 'hasIcon',
    medium: 'hasIcon',
    default: 'hasIcon',
};

/*== TextInput 文本输入框 — 单/多行输入，支持标签和图标 ==*/
export function TextInput(props: TextInputProps) {
    const { label, icon, inputSize = 'medium', className, id } = props;
    const labelClass = LABEL_CLASS[inputSize];
    const iconPadClass = icon ? ICON_PADDING_CLASS[inputSize] : undefined;
    const sizeClass = inputSize !== 'default' ? styles[inputSize] : undefined;
    const controlClassName = cn(styles.input, sizeClass, iconPadClass && styles[iconPadClass], className);

    let control: React.ReactNode;
    if (props.multiline) {
        const {
            label: _label,
            icon: _icon,
            inputSize: _inputSize,
            className: _className,
            multiline,
            ...textareaProps
        } = props;
        control = <textarea className={controlClassName} id={id} {...textareaProps} />;
    } else {
        const {
            label: _label,
            icon: _icon,
            inputSize: _inputSize,
            className: _className,
            multiline,
            ...inputProps
        } = props;
        control = <input className={controlClassName} id={id} {...inputProps} />;
    }

    return (
        <div className={styles.fieldset}>
            {label ? (
                <label className={cn(styles.label, labelClass && styles[labelClass])} htmlFor={id}>
                    {label}
                </label>
            ) : null}
            <div className={styles.inputWrap}>
                {icon ? <span className={styles.iconSlot}>{icon}</span> : null}
                {control}
            </div>
        </div>
    );
}
