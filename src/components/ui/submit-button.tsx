import styles from './submit-button.module.css';

export interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

/*== SubmitButton 提交按钮 — 朱砂红主按钮，全站通用 ==*/
export function SubmitButton({ className, children, ...props }: SubmitButtonProps) {
    return (
        <button
            className={`${styles.button}${className ? ` ${className}` : ''}`}
            type="submit"
            {...props}
        >
            {children}
        </button>
    );
}