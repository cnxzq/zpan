import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { uploadFiles } from '@/api/upload';

export const useUploadStore = defineStore('upload', () => {
  const showUploadModal = ref(false);
  const selectedFiles = ref([]);
  const uploading = ref(false);
  const uploadError = ref('');
  const uploadSuccess = ref(false);
  const uploadedFiles = ref([]);

  const route = useRoute();
  const router = useRouter();

  function openUploadModal() {
    showUploadModal.value = true;
    selectedFiles.value = [];
    uploadError.value = '';
    uploadSuccess.value = false;
    uploadedFiles.value = [];
  }

  function closeUploadModal() {
    showUploadModal.value = false;
    selectedFiles.value = [];
  }

  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    selectedFiles.value.push(...files);
    // 清空输入以便重复选择相同文件
    e.target.value = '';
  }

  function removeFile(index) {
    selectedFiles.value.splice(index, 1);
  }

  async function handleUpload(currentDir) {
    uploading.value = true;
    uploadError.value = '';
    uploadSuccess.value = false;
    uploadedFiles.value = [];

    try {
      const data = await uploadFiles(currentDir, selectedFiles.value);

      if (data.success) {
        uploadSuccess.value = true;
        uploadedFiles.value = data.files;
        // 1.5秒后关闭
        setTimeout(() => {
          closeUploadModal();
          // Force reload current route to refresh file list
          const currentPath = route.path;
          router.replace(currentPath);
        }, 1500);
      } else {
        uploadError.value = data.error || '上传失败';
      }
    } catch (err) {
      uploadError.value = err.message;
    } finally {
      uploading.value = false;
    }
  }

  return {
    showUploadModal,
    selectedFiles,
    uploading,
    uploadError,
    uploadSuccess,
    uploadedFiles,
    openUploadModal,
    closeUploadModal,
    handleFileSelect,
    removeFile,
    handleUpload,
  };
});
