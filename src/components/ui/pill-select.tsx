/*============================================================================
  pill-select — 药丸单选

  连排扁平选项组，选中项底部主色指示条。
  内部使用隐藏 radio input 保留语义，small / medium / default 三尺寸。
============================================================================*/

/*== 样式导入 ==*/
import { cn } from '@/lib/core/utils';
import styles from './pill-select.module.css';

/*== 类型定义 ==*/
interface PillSelectProps<T extends string> {
    /*-- 选项列表 --*/
    options: { value: T; label: string }[];
    /*-- 当前选中值 --*/
    value: T;
    /*-- 变更回调 --*/
    onChange: (value: T) => void;
    /*-- 选项名称，用于 radio name 属性 --*/
    name: string;
    /*-- 尺寸：small 紧凑 / medium 中等 / default 默认 --*/
    size?: 'small' | 'medium' | 'default';
}

const SIZE_CLASS: Record<string, string | undefined> = {
    small: 'small',
    medium: 'medium',
    // default 不需要额外 class，.pill 基础样式即为 default 尺寸
};

/*== PillSelect 药丸单选 — 连排扁平选项，选中项底部主色指示条 ==*/
export function PillSelect<T extends string>({ options, value, onChange, name, size = 'medium' }: PillSelectProps<T>) {
    const sizeClass = SIZE_CLASS[size];
    return (
        <div className={cn(styles.group, sizeClass && styles[sizeClass])}>
            {options.map((opt) => (
                <button
                    className={cn(styles.pill, value === opt.value && styles.pillActive)}
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    type="button"
                >
                    <input
                        checked={value === opt.value}
                        className={styles.input}
                        name={name}
                        readOnly
                        type="radio"
                        value={opt.value}
                    />
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
