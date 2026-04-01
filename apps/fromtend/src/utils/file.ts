
// 工具函数 - 判断是否是图片
export function isImage(filename: string) {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
}