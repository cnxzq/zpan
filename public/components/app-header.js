import { defineComponent } from 'vue';
import Breadcrumbs from '@/components/breadcrumbs';

export default defineComponent({
  name: 'AppHeader',
  components: {
    Breadcrumbs,
  },
  props: {
    loggedIn: {
      type: Boolean,
      default: false,
    },
    currentPath: {
      type: String,
      default: '',
    },
    layout: {
      type: String,
      default: 'grid',
    },
    instanceName: {
      type: String,
      default: 'ZPan',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['layout-change', 'open-upload', 'logout', 'navigate', 'go-to-users'],
  setup() {
    return {};
  },
  template: `
    <div v-if="loggedIn" class="header">
      <h1>{{ instanceName }}</h1>
      <div class="toolbar">
        <Breadcrumbs :path="currentPath" @navigate="$emit('navigate')" />
        <div class="actions">
          <div class="layout-toggle">
            <button :class="{ active: layout === 'grid' }" @click="$emit('layout-change', 'grid')">📷 Grid</button>
            <button :class="{ active: layout === 'list' }" @click="$emit('layout-change', 'list')">📋 List</button>
          </div>
          <button v-if="isAdmin" class="user-link-btn" @click="$emit('go-to-users')">👥 用户管理</button>
          <button class="upload-btn" @click="$emit('open-upload')">📤 上传文件</button>
          <button class="logout-btn" @click="$emit('logout')">🚪 退出</button>
        </div>
      </div>
    </div>
  `,
});
