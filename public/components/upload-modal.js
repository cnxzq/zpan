
import { defineComponent, ref, onMounted } from 'vue';
import { formatSize } from '@/util'

// 组件 - 上传弹窗
export default defineComponent({
    name: 'UploadModal',
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        currentDir: {
            type: String,
            default: '',
        },
        selectedFiles: {
            type: Array,
            default: () => [],
        },
        uploading: {
            type: Boolean,
            default: false,
        },
        error: {
            type: String,
            default: '',
        },
        success: {
            type: Boolean,
            default: false,
        },
        uploadedCount: {
            type: Number,
            default: 0,
        },
    },
    emits: ['close', 'file-select', 'remove-file', 'upload'],
    setup(props, { emit }) {
        const fileInput = ref(null);

        const handleClick = () => {
            fileInput.value?.click();
        };

        const handleChange = (e) => {
            emit('file-select', e);
        };

        const handleRemove = (index) => {
            emit('remove-file', index);
        };

        const handleClose = () => {
            emit('close');
        };

        const handleUpload = () => {
            emit('upload');
        };

        const handleOverlayClick = (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                emit('close');
            }
        };

        return {
            fileInput,
            handleClick,
            handleChange,
            handleRemove,
            handleClose,
            handleUpload,
            handleOverlayClick,
            formatSize,
        };
    },
    template: `
        <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
          <div class="modal">
            <h2>上传文件</h2>
            <p v-if="currentDir" style="margin-bottom: 10px; color: #666; font-size: 14px;">
              当前目录: {{ currentDir || '/' }}
            </p>
            <div class="upload-file-select" @click="handleClick">
              点击选择文件或拖放文件到这里
              <input ref="fileInput" type="file" multiple @change="handleChange">
            </div>
            <div v-if="selectedFiles.length > 0" class="upload-file-list">
              <div
                class="upload-file-item"
                v-for="(file, index) in selectedFiles"
                :key="index"
              >
                <span class="upload-file-item-name">{{ file.name }} ({{ formatSize(file.size) }})</span>
                <span class="upload-file-item-remove" @click="handleRemove(index)">×</span>
              </div>
            </div>
            <div v-if="success" class="upload-success">
              ✅ 成功上传 {{ uploadedCount }} 个文件
            </div>
            <div v-if="error" class="error-text">{{ error }}</div>
            <div class="modal-actions">
              <button class="btn-cancel" @click="handleClose">取消</button>
              <button class="btn-primary" @click="handleUpload" :disabled="uploading || selectedFiles.length === 0">
                {{ uploading ? '上传中...' : '开始上传' }}
              </button>
            </div>
          </div>
        </div>
      `,
});
