"use client";

import { ErrorPage } from "@/components/site/error-page";

interface RouteErrorProps {
    unstable_retry: () => void;
}

/*== ERROR页面 ==*/
export default function RouteError({ unstable_retry }: RouteErrorProps) {
    return <ErrorPage onRetry={unstable_retry} />;
}
