import styles from './pill-select.module.css';

/*== PillSelect 药丸单选 — 连排扁平选项，选中项底部主色指示条 ==*/
interface PillSelectProps<T extends string> {
    /** 选项列表 */
    options: { value: T; label: string }[];
    /** 当前选中值 */
    value: T;
    /** 变更回调 */
    onChange: (value: T) => void;
    /** 选项名称，用于 radio name 属性 */
    name: string;
}

export function PillSelect<T extends string>({ options, value, onChange, name }: PillSelectProps<T>) {
    return (
        <div className={styles.group}>
            {options.map((opt) => (
                <button
                    className={`${styles.pill}${value === opt.value ? ` ${styles.pillActive}` : ''}`}
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    type='button'
                >
                    <input
                        checked={value === opt.value}
                        className={styles.input}
                        name={name}
                        onChange={() => onChange(opt.value)}
                        type='radio'
                        value={opt.value}
                    />
                    {opt.label}
                </button>
            ))}
        </div>
    );
}