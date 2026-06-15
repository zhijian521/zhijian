import Image from 'next/image';

interface ContentImageProps {
    alt: string;
    className?: string;
    priority?: boolean;
    sizes?: string;
    src: string;
    style?: React.CSSProperties;
}

function isRemoteImage(src: string): boolean {
    return /^https?:\/\//i.test(src);
}

/* 运行时上传的图片不走 next/image 优化，因为 next start 不服务运行时写入的 public/ 文件 */
function isUploadedPath(src: string): boolean {
    return src.startsWith('/uploads/');
}

/*== 公开内容图片：本地资源走 next/image，外链/上传图片回退原生 img。 ==*/
export function ContentImage({
    alt,
    className,
    priority = false,
    sizes = '100vw',
    src,
    style,
}: ContentImageProps) {
    if (isRemoteImage(src) || isUploadedPath(src)) {
        return (
            <img
                alt={alt}
                className={className}
                decoding='async'
                loading={priority ? 'eager' : 'lazy'}
                src={src}
                style={style}
            />
        );
    }

    return (
        <Image
            alt={alt}
            className={className}
            height={900}
            priority={priority}
            sizes={sizes}
            src={src}
            style={style}
            width={1600}
        />
    );
}
