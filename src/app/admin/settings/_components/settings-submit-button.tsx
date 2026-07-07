'use client';

import { useState } from 'react';

import { SubmitButton } from '@/components/ui/submit-button';
import { toast } from '@/components/ui/toast';
import type { SubmitResult } from '@/lib/domain/seo-submit';

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
                <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', lineHeight: 1.75 }}>
                    <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>共 {result.totalUrls} 个 URL</p>
                    <p
                        style={{
                            margin: 0,
                            color: result.indexNow.success ? 'var(--primary)' : 'var(--muted-foreground)',
                        }}
                    >
                        IndexNow：
                        {result.indexNow.success
                            ? `成功 ${result.indexNow.count} 条`
                            : `失败 — ${result.indexNow.message}`}
                    </p>
                    <p
                        style={{
                            margin: 0,
                            color: result.baidu.success ? 'var(--primary)' : 'var(--muted-foreground)',
                        }}
                    >
                        百度：
                        {result.baidu.success ? `成功 ${result.baidu.count} 条` : `失败 — ${result.baidu.message}`}
                    </p>
                </div>
            ) : null}
        </div>
    );
}
