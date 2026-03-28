/**
 * User Management Page Component
 * 用户管理页面组件
 */
import { defineComponent, defineAsyncComponent } from 'vue';

const UserManagement = defineAsyncComponent(() =>
  import('../components/user-management.js')
);

export default defineComponent({
  name: 'UserManagementPage',
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
    function goBack() {
      emit('back');
    }

    return {
      props,
      goBack,
    };
  },
  template: `
    <UserManagement
      :is-admin="isAdmin"
      :base-url="baseUrl"
      @back="goBack"
    />
  `,
});
