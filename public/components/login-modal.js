/**
 * Login Modal Component
 * 登录弹窗组件
 */
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'LoginModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'login'],
  setup(props, { emit }) {
    const username = ref('');
    const password = ref('');

    const handleLogin = () => {
      emit('login', {
        username: username.value,
        password: password.value,
      });
    };

    const handleClose = () => {
      emit('close');
    };

    return {
      username,
      password,
      handleLogin,
      handleClose,
    };
  },
  template: `
    <div v-if="show" class="modal-overlay">
      <div class="modal">
        <h2>登录 ZPan</h2>
        <div v-if="error" class="error-text">{{ error }}</div>
        <div class="form-group">
          <label>用户名</label>
          <input v-model="username" type="text" placeholder="请输入用户名">
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="请输入密码">
        </div>
        <div class="modal-actions">
          <button class="btn-primary" @click="handleLogin" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
      </div>
    </div>
  `,
});
