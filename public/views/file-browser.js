/**
 * File Browser Component
 * 文件浏览主页面组件
 */
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { formatSize } from '@/util'

// 图片扩展名常量,避免重复创建数组
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico']);

// 工具函数 - 判断是否是图片
function isImage(filename) {
  // 输入验证:确保是字符串且不为空
  if (!filename || typeof filename !== 'string') {
    return false;
  }

  // 获取文件扩展名并转为小写
  const ext = filename.split('.').pop()?.toLowerCase();
  // 检查扩展名是否存在且在图片扩展名集合中
  return !!ext && IMAGE_EXTENSIONS.has(ext);
}

// 组件 - 文件列表项（网格布局）
const FileGridItem = defineComponent({
  name: 'FileGridItem',
  props: {
    file: {
      type: Object,
      required: true,
    },
    currentPath: {
      type: String,
      default: '',
    },
    baseUrl: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const isImageFile = (filename) => isImage(filename);
    const fileLink = (file) => {
      const path = props.currentPath ? `${props.currentPath}/${file.name}` : file.name;
      if (file.isDirectory) {
        return props.baseUrl + '/#/' + encodeURIComponent(path);
      }
      return props.baseUrl + '/raw/' + path;
    };
    const thumbnailUrl = (file) => {
      const path = props.currentPath ? `${props.currentPath}/${file.name}` : file.name;
      return props.baseUrl + '/api/thumbnail?path=' + encodeURIComponent(path);
    };

    return {
      isImage: isImageFile,
      fileLink,
      thumbnailUrl,
      formatSize,
    };
  },
  template: `
    <div class="file-item">
      <a :href="fileLink(file)">
        <div class="thumbnail">
          <div v-if="file.isDirectory" class="folder-icon">📁</div>
          <img
            v-else-if="isImage(file.name)"
            :src="thumbnailUrl(file)"
            :alt="file.name"
          >
          <div v-else class="folder-icon">{{ file.isDirectory ? '📁' : '📄' }}</div>
        </div>
        <div class="file-info">
          <div class="name">{{ file.name }}</div>
          <div class="size">{{ formatSize(file.size) }}</div>
        </div>
      </a>
    </div>
  `,
});

// 组件 - 文件列表项（列表布局）
const FileListItem = defineComponent({
  name: 'FileListItem',
  props: {
    file: {
      type: Object,
      required: true,
    },
    currentPath: {
      type: String,
      default: '',
    },
    baseUrl: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const fileLink = (file) => {
      const path = props.currentPath ? `${props.currentPath}/${file.name}` : file.name;
      if (file.isDirectory) {
        return props.baseUrl + '/#/' + encodeURIComponent(path);
      }
      return props.baseUrl + '/raw/' + path;
    };

    return {
      fileLink,
      formatSize,
      formatDate,
    };
  },
  template: `
    <div class="file-item">
      <span class="icon">
        <span>{{ file.isDirectory ? '📁' : '📄' }}</span>
      </span>
      <span class="name">
        <a :href="fileLink(file)">{{ file.name }}</a>
      </span>
      <span class="size">{{ formatSize(file.size) }}</span>
      <span class="date">{{ formatDate(file.mtimeMs) }}</span>
    </div>
  `,
});

// 组件 - 文件列表
const FileList = defineComponent({
  name: 'FileList',
  components: {
    FileGridItem,
    FileListItem,
  },
  props: {
    files: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: '',
    },
    layout: {
      type: String,
      default: 'grid',
    },
    currentPath: {
      type: String,
      default: '',
    },
    baseUrl: {
      type: String,
      default: '',
    },
  },
  emits: ['navigate'],
  setup(props, { emit }) {
    function handleNavigate(parts) {
      emit('navigate', parts);
    }

    return {
      handleNavigate,
    };
  },
  template: `
    <div :class="['file-list', layout]">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">加载失败: {{ error }}</div>
      <div v-else-if="files.length === 0" class="empty">目录为空</div>
      <template v-else-if="layout === 'grid'">
        <FileGridItem
          v-for="file in files"
          :key="file.name"
          :file="file"
          :current-path="currentPath"
          :base-url="baseUrl"
        />
      </template>
      <template v-else-if="layout === 'list'">
        <FileListItem
          v-for="file in files"
          :key="file.name"
          :file="file"
          :current-path="currentPath"
          :base-url="baseUrl"
        />
      </template>
      <template v-else>错误的 layout 值: {{ layout }}</template>
    </div>
  `,
});

export default defineComponent({
  name: 'FileBrowser',
  components: {
    FileList,
  },
  props: {
    loggedIn: {
      type: Boolean,
      default: false,
    },
    layout: {
      type: String,
      default: 'grid',
    },
    baseUrl: {
      type: String,
      default: '',
    },
  },
  emits: ['navigate', 'load-directory'],
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();

    const files = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const currentDir = computed(() => {
      return decodeURIComponent(route.params.dir || '');
    });

    // 加载目录
    async function loadDirectory() {
      if (!props.loggedIn) return;

      loading.value = true;
      error.value = null;

      try {
        const apiUrl = props.baseUrl + `/api/list?dir=${encodeURIComponent(currentDir.value)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('网络错误');
        }
        files.value = await response.json();
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    }

    function handleNavigate(parts) {
      const path = parts.join('/');
      router.push('/' + encodeURIComponent(path));
    }

    // 监听路由变化
    watch(() => route.params.dir, () => {
      if (props.loggedIn) {
        loadDirectory();
      }
    });

    // 监听登录状态变化 - 登录完成后触发加载
    watch(() => props.loggedIn, (newVal) => {
      if (newVal) {
        loadDirectory();
      }
    });

    onMounted(() => {
      if (props.loggedIn) {
        loadDirectory();
      }
    });

    return {
      currentDir,
      files,
      loading,
      error,
      handleNavigate,
      loadDirectory,
    };
  },
  template: `
    <template v-if="loggedIn">
      <FileList
        :files="files"
        :loading="loading"
        :error="error"
        :layout="layout"
        :current-path="currentDir"
        :base-url="baseUrl + '/raw'"
        @navigate="handleNavigate"
      />
    </template>
    <div v-else-if="!loggedIn" class="not-logged-in">
      <p>请先登录</p>
    </div>
  `,
});
