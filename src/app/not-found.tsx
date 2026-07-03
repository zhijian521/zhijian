import { StatusPage } from '@/components/ui/status-page';

/*== 404 页面：路由未匹配时展示。 ==*/
export default function NotFound() {
    return <StatusPage code={404} title="页面已随风而逝，了无踪迹" subtitle="云深不知处，归径在心间。" />;
}
