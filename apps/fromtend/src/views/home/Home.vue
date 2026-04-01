<template>
    <div>
        <ZFileList :files="files" :loading="loading" :error="error" :layout="appStore.layout"
            :current-path="appStore.currentDir" @item-click="handleFileItemClick" :base-url="baseUrl" />
    </div>
</template>

<script setup lang="ts">
import type { FileItem } from '@/components/ZFileList/contaitic';
import { useAppStore } from '@/store/app';


const appStore = useAppStore();
const htmlBaseUrl = location.pathname.split('/').slice(0, -1).join('/')

const route = useRoute();
// const router = useRouter();

const files = ref([]);
const loading = ref(true);
const error = ref('');
const loggedIn = ref(false);
const checkingAuth = ref(true);
const baseUrl = ref(htmlBaseUrl);
const instanceName = ref('ZPan');

// 当前目录从路由参数获取
appStore.currentDir = decodeURIComponent(route.query.dir as string || '')

// 登录弹窗状态
const showLoginModal = ref(false);
const loginError = ref('');

// // 上传弹窗状态
// const showUploadModal = ref(false);
// const selectedFiles = ref<File[]>([]);
// const uploading = ref(false);
// const uploadError = ref('');
// const uploadSuccess = ref(false);
// const uploadedFiles = ref([]);

watch(() => appStore.currentDir, () => {
    loadDirectory()
})

// 构建完整 API URL
const apiUrl = (path: string) => baseUrl.value + path;

// 加载公共配置
async function loadConfig() {
    try {
        const res = await fetch(apiUrl('/api/config'));
        const data = await res.json();
        baseUrl.value = data.baseUrl || '';
        instanceName.value = data.name || 'ZPan';
    } catch (err) {
        console.error('Failed to load config:', err);
        baseUrl.value = '';
    }
}

// 检查认证状态
async function checkAuth() {
    try {
        const res = await fetch(apiUrl('/api/auth/status'));
        const data = await res.json();
        loggedIn.value = data.loggedIn;
    } catch (err) {
        console.error(err);
    } finally {
        checkingAuth.value = false;
        if (loggedIn.value) {
            loadDirectory();
        } else {
            openLoginModal();
        }
    }
}

// 加载目录
async function loadDirectory() {
    if (!loggedIn.value) return;

    loading.value = true;
    error.value = '';

    try {
        const response = await fetch(apiUrl(`/api/list?dir=${encodeURIComponent(appStore.currentDir)}`));
        if (!response.ok) {
            throw new Error('网络错误');
        }
        files.value = await response.json();
    } catch (err: any) {
        error.value = err.message;
    } finally {
        loading.value = false;
    }
}

// 打开登录弹窗
function openLoginModal() {
    showLoginModal.value = true;
    loginError.value = '';
}


// // 打开上传弹窗
// function openUploadModal() {
//     showUploadModal.value = true;
//     selectedFiles.value = [];
//     uploadError.value = '';
//     uploadSuccess.value = false;
//     uploadedFiles.value = [];
// }

// // 关闭上传弹窗
// function closeUploadModal() {
//     showUploadModal.value = false;
//     selectedFiles.value = [];
// }

// // 文件选择
// function handleFileSelect(e: any) {
//     const files = Array.from(e.target.files) as File[];
//     selectedFiles.value.push(...files);
//     // 清空输入以便重复选择相同文件
//     e.target.value = '';
// }

// // 移除文件
// function removeFile(index: number) {
//     selectedFiles.value.splice(index, 1);
// }

// // 上传文件
// async function handleUpload() {
//     uploading.value = true;
//     uploadError.value = '';
//     uploadSuccess.value = false;
//     uploadedFiles.value = [];

//     const formData = new FormData();
//     formData.append('dir', appStore.currentDir);
//     selectedFiles.value.forEach(file => {
//         formData.append('file', file);
//     });

//     try {
//         const res = await fetch(apiUrl('/api/upload'), {
//             method: 'POST',
//             body: formData,
//         });
//         const data = await res.json();

//         if (data.success) {
//             uploadSuccess.value = true;
//             uploadedFiles.value = data.files;
//             // 重新加载目录
//             loadDirectory();
//             // 1.5秒后关闭
//             setTimeout(() => {
//                 closeUploadModal();
//             }, 1500);
//         } else {
//             uploadError.value = data.error || '上传失败';
//         }
//     } catch (err: any) {
//         uploadError.value = err.message;
//     } finally {
//         uploading.value = false;
//     }
// }


// 监听路由变化
watch(() => route.params.dir, () => {
    if (loggedIn.value) {
        loadDirectory();
    }
});

onMounted(async () => {
    await loadConfig();
    checkAuth();
});

const handleFileItemClick = async (file: FileItem) => {
    const path = appStore.currentDir ? `${appStore.currentDir}/${file.name}` : file.name
    if (file.isDirectory) {
        appStore.setCurrentDir(encodeURIComponent(path))
        await loadDirectory();
    }
}
</script>