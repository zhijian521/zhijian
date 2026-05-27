/*== 后台骨架屏：异步加载子页面时保持侧边栏可见。 ==*/
export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
                <div className="h-2 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-2 w-32 animate-pulse rounded bg-gray-100" />
            </div>
        </div>
    );
}
