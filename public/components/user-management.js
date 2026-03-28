/**
 * User Management Component
 * 用户管理组件 - 仅管理员可见
 */
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'UserManagement',
  props: {
    isAdmin: {
      type: Boolean,
      default: false,
    },
    baseUrl: {
      type: String,
      default: '',
    },
  },
  emits: ['back'],
  setup(props, { emit }) {
    const users = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const showModal = ref(false);
    const isEditing = ref(false);
    const saving = ref(false);
    const modalError = ref('');
    const currentUser = ref({
      username: '',
      password: '',
      role: 'user',
      permission: 'read',
      rootDir: '',
    });
    const originalUsername = ref('');

    const apiUrl = (path) => props.baseUrl + '/api/admin/users' + (path ? '/' + path : '');

    async function loadUsers() {
      if (!props.isAdmin) return;

      loading.value = true;
      error.value = null;

      try {
        const res = await fetch(apiUrl(''));
        if (!res.ok) throw new Error('加载失败');
        users.value = await res.json();
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    }

    function openCreateModal() {
      currentUser.value = {
        username: '',
        password: '',
        role: 'user',
        permission: 'read',
        rootDir: '',
      };
      originalUsername.value = '';
      modalError.value = '';
      isEditing.value = false;
      showModal.value = true;
    }

    function openEditModal(user) {
      currentUser.value = {
        username: user.username,
        password: '',
        role: user.role,
        permission: user.permission,
        rootDir: user.rootDir,
      };
      originalUsername.value = user.username;
      modalError.value = '';
      isEditing.value = true;
      showModal.value = true;
    }

    function closeModal() {
      showModal.value = false;
    }

    async function handleSave() {
      if (!currentUser.value.username.trim()) {
        modalError.value = '用户名不能为空';
        return;
      }
      if (!isEditing.value && !currentUser.value.password) {
        modalError.value = '密码不能为空';
        return;
      }
      if (currentUser.value.rootDir === undefined || currentUser.value.rootDir === null) {
        currentUser.value.rootDir = '';
      }

      saving.value = true;
      modalError.value = '';

      try {
        let res;
        if (isEditing.value) {
          // Update
          res = await fetch(apiUrl(encodeURIComponent(originalUsername.value)), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentUser.value),
          });
        } else {
          // Create
          res = await fetch(apiUrl(''), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentUser.value),
          });
        }

        const data = await res.json();
        if (data.success) {
          closeModal();
          loadUsers();
        } else {
          modalError.value = data.error || '保存失败';
        }
      } catch (err) {
        modalError.value = err.message;
      } finally {
        saving.value = false;
      }
    }

    async function handleDelete(username) {
      if (!confirm(`确定要删除用户 "${username}" 吗？此操作不可撤销。`)) {
        return;
      }

      try {
        const res = await fetch(apiUrl(encodeURIComponent(username)), {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          loadUsers();
        } else {
          alert(data.error || '删除失败');
        }
      } catch (err) {
        alert(err.message);
      }
    }

    function handleOverlayClick(e) {
      if (e.target.classList.contains('modal-overlay')) {
        closeModal();
      }
    }

    function goBack() {
      emit('back');
    }

    onMounted(() => {
      loadUsers();
    });

    return {
      users,
      loading,
      error,
      showModal,
      isEditing,
      saving,
      modalError,
      currentUser,
      originalUsername,
      openCreateModal,
      openEditModal,
      closeModal,
      handleSave,
      handleDelete,
      handleOverlayClick,
      goBack,
    };
  },
  template: `
    <div class="user-management">
      <div class="user-management-header">
        <h2>用户管理</h2>
        <div style="display: flex; gap: 10px;">
          <button class="user-link-btn" @click="goBack">← 返回文件列表</button>
          <button class="btn-add-user" @click="openCreateModal">+ 新增用户</button>
        </div>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">加载失败: {{ error }}</div>
      <div v-else-if="users.length === 0" class="users-empty">暂无用户</div>
      <table v-else class="user-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>角色</th>
            <th>权限</th>
            <th>根目录</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.username">
            <td>{{ user.username }}</td>
            <td>
              <span :class="['role-badge', user.role === 'admin' ? 'role-admin' : 'role-user']">
                {{ user.role === 'admin' ? '管理员' : '普通用户' }}
              </span>
            </td>
            <td>
              <span :class="['role-badge', user.permission === 'read' ? 'permission-read' : 'permission-write']">
                {{ user.permission === 'read' ? '只读' : '读写' }}
              </span>
            </td>
            <td>{{ user.rootDir || '.' }}</td>
            <td>
              <div class="user-management-actions">
                <button class="btn-action" @click="openEditModal(user)">编辑</button>
                <button class="btn-action btn-delete" @click="handleDelete(user.username)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Create/Edit Modal -->
      <div v-if="showModal" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal">
          <h2>{{ isEditing ? '编辑用户' : '新增用户' }}</h2>
          <div v-if="modalError" class="error-text">{{ modalError }}</div>

          <div class="form-group">
            <label>用户名</label>
            <input v-model="currentUser.username" type="text" placeholder="请输入用户名"
              :disabled="isEditing">
          </div>

          <div class="form-group">
            <label>{{ isEditing ? '新密码 (留空保持原密码)' : '密码' }}</label>
            <input v-model="currentUser.password" type="password"
              placeholder="{{ isEditing ? '留空保持原密码' : '请输入密码' }}">
          </div>

          <div class="form-group">
            <label>角色</label>
            <select v-model="currentUser.role">
              <option value="admin">管理员</option>
              <option value="user">普通用户</option>
            </select>
          </div>

          <div class="form-group">
            <label>权限</label>
            <select v-model="currentUser.permission">
              <option value="read">只读</option>
              <option value="write">读写</option>
            </select>
          </div>

          <div class="form-group">
            <label>用户根目录 (相对主目录)</label>
            <input v-model="currentUser.rootDir" type="text" placeholder="例如: users/alice"
            >
            <small style="color: #666;">留空表示使用根目录</small>
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="closeModal">取消</button>
            <button class="btn-primary" @click="handleSave" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
});
