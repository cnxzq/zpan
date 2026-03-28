import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { checkAuthStatus, login as loginRequest, logout as logoutRequest } from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
  const loggedIn = ref(false);
  const checkingAuth = ref(true);
  const isAdmin = ref(false);
  const showLoginModal = ref(false);
  const loginError = ref('');
  const loggingIn = ref(false);

  const router = useRouter();

  function openLoginModal() {
    showLoginModal.value = true;
    loginError.value = '';
  }

  function closeLoginModal() {
    showLoginModal.value = false;
    loginError.value = '';
  }

  async function checkAuth() {
    try {
      const data = await checkAuthStatus();
      loggedIn.value = data.loggedIn;
      isAdmin.value = data.role === 'admin';
    } catch (err) {
      console.error(err);
    } finally {
      checkingAuth.value = false;
      if (!loggedIn.value) {
        openLoginModal();
      }
    }
  }

  async function login(username, password, route) {
    loggingIn.value = true;
    loginError.value = '';

    try {
      const data = await loginRequest(username, password);

      if (data.success) {
        loggedIn.value = true;
        isAdmin.value = data.role === 'admin';
        closeLoginModal();
        if (route.path !== '/') {
          router.push('/');
        }
      } else {
        loginError.value = '用户名或密码错误';
      }
    } catch (err) {
      loginError.value = err.message;
    } finally {
      loggingIn.value = false;
    }
  }

  async function logout() {
    try {
      await logoutRequest();
      loggedIn.value = false;
      isAdmin.value = false;
      router.push('/');
      openLoginModal();
    } catch (err) {
      console.error(err);
    }
  }

  function goToUsers() {
    router.push('/users');
  }

  return {
    loggedIn,
    checkingAuth,
    isAdmin,
    showLoginModal,
    loginError,
    loggingIn,
    checkAuth,
    login,
    logout,
    openLoginModal,
    closeLoginModal,
    goToUsers,
  };
});
