'use client';

/*============================================================================
  settings-submit-button — 搜索引擎提交控件

  触发站点 URL 的 IndexNow 与百度提交，
  并展示提交进度、数量和各渠道结果。
============================================================================*/

import { useState } from 'react';

import { SubmitButton } from '@/components/ui/submit-button';
import { toast } from '@/components/ui/toast';
import type { SubmitResult } from '@/lib/domain/seo-submit';

import styles from './settings-submit-button.module.css';

interface SubmitResponse {
    totalUrls: number;
    indexNow: SubmitResult;
    baidu: SubmitResult;
}

/*== 搜索引擎提交按钮 — Client Component ==*/
export function SettingsSubmitButton() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<SubmitResponse | null>(null);

    async function handleSubmit() {
        setIsSubmitting(true);
        setResult(null);

        try {
            const res = await fetch('/api/admin/seo/submit', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || '提交失败');
                return;
            }

            setResult(data.data);
            toast.success(`已提交 ${data.data.totalUrls} 个 URL`);
        } catch {
            toast.error('提交失败，请检查网络连接');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <SubmitButton disabled={isSubmitting} onClick={handleSubmit}>
                {isSubmitting ? '提交中...' : '提交到搜索引擎'}
            </SubmitButton>

            {result ? (
                <div className={styles.result}>
                    <p className={styles.resultLine}>共 {result.totalUrls} 个 URL</p>
                    <p className={`${styles.resultLine} ${result.indexNow.success ? styles.resultSuccess : ''}`}>
                        IndexNow：
                        {result.indexNow.success
                            ? `成功 ${result.indexNow.count} 条`
                            : `失败 — ${result.indexNow.message}`}
                    </p>
                    <p className={`${styles.resultLine} ${result.baidu.success ? styles.resultSuccess : ''}`}>
                        百度：
                        {result.baidu.success ? `成功 ${result.baidu.count} 条` : `失败 — ${result.baidu.message}`}
                    </p>
                </div>
            ) : null}
        </div>
    );
}
