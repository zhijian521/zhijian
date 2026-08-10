/*============================================================================
  bookmark-dialog - 书签编辑弹窗

  统一处理书签、文件夹的新增、编辑与删除。
============================================================================*/

"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getNavHttpUrl } from "@/features/nav/lib/urls";
import type { NavBookmarkEditorState, NavBookmarkEditorValues } from "@/types/nav";

import styles from "./bookmark-dialog.module.css";

interface BookmarkDialogProps {
    editorState: NavBookmarkEditorState;
    onClose: () => void;
    onSubmit: (values: NavBookmarkEditorValues) => void;
}

function getDialogContent(editorState: NavBookmarkEditorState) {
    switch (editorState.type) {
        case "create-bookmark":
            return {
                initialName: "",
                initialUrl: "",
                isDelete: false,
                showUrl: true,
                title: editorState.folderId ? "文件夹内新增书签" : "新增书签",
            };
        case "create-folder":
            return { initialName: "", initialUrl: "", isDelete: false, showUrl: false, title: "新增文件夹" };
        case "edit-bookmark":
            return {
                initialName: editorState.bookmark.name,
                initialUrl: editorState.bookmark.url,
                isDelete: false,
                showUrl: true,
                title: "编辑书签",
            };
        case "edit-folder":
            return { initialName: editorState.folder.name, initialUrl: "", isDelete: false, showUrl: false, title: "编辑文件夹" };
        case "delete":
            return { initialName: "", initialUrl: "", isDelete: true, showUrl: false, title: "确认删除" };
    }
}

export function BookmarkDialog({ editorState, onClose, onSubmit }: BookmarkDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const urlInputRef = useRef<HTMLInputElement>(null);
    const titleId = useId();
    const [urlError, setUrlError] = useState<string | null>(null);
    const content = getDialogContent(editorState);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        dialog.showModal();
        return () => dialog.close();
    }, []);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        let url = "";

        if (content.showUrl) {
            url = getNavHttpUrl(String(formData.get("url") ?? "")) ?? "";
            if (!url) {
                setUrlError("请输入有效的 HTTP(S) 网址，例如 https://example.com。");
                urlInputRef.current?.focus();
                return;
            }
        }

        onSubmit({
            name: String(formData.get("name") ?? ""),
            url,
        });
    }

    return (
        <dialog
            aria-labelledby={titleId}
            className={styles.dialog}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            ref={dialogRef}
        >
            <form noValidate onSubmit={handleSubmit}>
                <h2 id={titleId}>{content.title}</h2>
                {content.isDelete ? (
                    <p>
                        确定删除“{editorState.type === "delete" ? editorState.bookmark.name : ""}”吗？
                        {editorState.type === "delete" && "children" in editorState.bookmark ? "文件夹内的书签也会一并删除。" : ""}
                    </p>
                ) : (
                    <div className={styles.fields}>
                        <label>
                            名称
                            <Input autoFocus defaultValue={content.initialName} name="name" type="text" />
                        </label>
                        {content.showUrl ? (
                            <label>
                                URL
                                <Input
                                    aria-describedby={urlError ? "bookmark-url-error" : undefined}
                                    aria-invalid={Boolean(urlError)}
                                    autoComplete="url"
                                    defaultValue={content.initialUrl}
                                    inputMode="url"
                                    name="url"
                                    onChange={() => setUrlError(null)}
                                    placeholder="https://example.com"
                                    ref={urlInputRef}
                                    required
                                    type="url"
                                />
                                {urlError ? (
                                    <span className={styles.error} id="bookmark-url-error" role="alert">
                                        {urlError}
                                    </span>
                                ) : null}
                            </label>
                        ) : null}
                    </div>
                )}
                <div className={styles.actions}>
                    <Button autoFocus={content.isDelete} onClick={onClose}>
                        取消
                    </Button>
                    <Button type="submit" variant="primary">
                        {content.isDelete ? "删除" : "保存"}
                    </Button>
                </div>
            </form>
        </dialog>
    );
}
