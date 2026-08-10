"use client";

/*============================================================================
  blog filters - 博客筛选

  使用 URL 链接承载筛选状态，桌面端显示固定左侧栏，移动端收纳进弹窗。
============================================================================*/

import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { IconButton } from "@/components/ui/icon-button";
import type { BlogFilterOption } from "@/features/blog/lib/filters";

import styles from "./blog-filters.module.css";

interface BlogFiltersProps {
    categories: BlogFilterOption[];
    tags: BlogFilterOption[];
}

interface BlogFilterOptionsProps {
    categories: BlogFilterOption[];
    onSelect?: () => void;
    tags: BlogFilterOption[];
}

export function BlogFilters({ categories, tags }: BlogFiltersProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const dialogId = useId();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const hasCategories = categories.length > 1;
    const hasTags = tags.length > 0;

    useEffect(() => {
        const desktopMediaQuery = window.matchMedia("(min-width: 48rem)");

        function closeDialogOnDesktop(event: MediaQueryListEvent) {
            if (event.matches && dialogRef.current?.open) {
                // 桌面端改用侧栏，避免隐藏中的原生弹窗继续保持模态状态。
                dialogRef.current.close();
            }
        }

        desktopMediaQuery.addEventListener("change", closeDialogOnDesktop);

        return () => desktopMediaQuery.removeEventListener("change", closeDialogOnDesktop);
    }, []);

    if (!hasCategories && !hasTags) {
        return null;
    }

    function openDialog() {
        dialogRef.current?.showModal();
        setIsDialogOpen(true);
    }

    function closeDialog() {
        const dialog = dialogRef.current;

        if (dialog?.open) {
            dialog.close();
            return;
        }

        setIsDialogOpen(false);
    }

    return (
        <>
            <Button
                aria-controls={dialogId}
                aria-expanded={isDialogOpen}
                className={styles.mobileTrigger}
                onClick={openDialog}
            >
                筛选
            </Button>

            <aside aria-label="文章筛选" className={styles.sidebar}>
                <BlogFilterOptions categories={categories} tags={tags} />
            </aside>

            <dialog
                aria-labelledby={`${dialogId}-title`}
                className={styles.dialog}
                id={dialogId}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        closeDialog();
                    }
                }}
                onClose={() => setIsDialogOpen(false)}
                ref={dialogRef}
            >
                <header className={styles.dialogHeader}>
                    <h2 className={styles.dialogTitle} id={`${dialogId}-title`}>
                        筛选
                    </h2>
                    <IconButton asButton icon="x" label="关闭筛选" onClick={closeDialog} />
                </header>
                <div className={styles.dialogBody}>
                    <BlogFilterOptions categories={categories} onSelect={closeDialog} tags={tags} />
                </div>
            </dialog>
        </>
    );
}

function BlogFilterOptions({ categories, onSelect, tags }: BlogFilterOptionsProps) {
    const hasCategories = categories.length > 1;
    const hasTags = tags.length > 0;

    return (
        <>
            {hasCategories ? (
                <section className={styles.section}>
                    <h2 className={styles.title}>分类</h2>
                    <div className={styles.categories}>
                        {categories.map((category) => (
                            <CategoryFilterLink key={category.href} onSelect={onSelect} option={category} />
                        ))}
                    </div>
                </section>
            ) : null}

            {hasTags ? (
                <section className={styles.section}>
                    <h2 className={styles.title}>标签</h2>
                    <div className={styles.tags}>
                        {tags.map((tag) => <TagFilterLink key={tag.href} onSelect={onSelect} option={tag} />)}
                    </div>
                </section>
            ) : null}
        </>
    );
}

interface FilterLinkProps {
    onSelect?: () => void;
    option: BlogFilterOption;
}

/*== 分类与标签保留独立入口，后续可分别调整选中态而不扩大通用按钮职责 ==*/
function CategoryFilterLink({ onSelect, option }: FilterLinkProps) {
    return (
        <ButtonLink
            aria-current={option.isActive ? "page" : undefined}
            className={styles.categoryButton}
            href={option.href}
            onClick={onSelect}
            variant="primary"
        >
            {option.label}
        </ButtonLink>
    );
}

function TagFilterLink({ onSelect, option }: FilterLinkProps) {
    return (
        <ButtonLink aria-current={option.isActive ? "page" : undefined} className={styles.tagButton} href={option.href} onClick={onSelect}>
            {option.label}
        </ButtonLink>
    );
}
