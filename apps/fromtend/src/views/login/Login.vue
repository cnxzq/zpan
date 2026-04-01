<template>
    <LoginModal @login="e=>loginHandle(e)"></LoginModal>
</template>

<script setup lang="ts">

import LoginModal from './LoginModal.vue'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore();

const getRedirct = ()=>{
    let redirect = router.currentRoute.value.query.redirect as string
    if(redirect){
        redirect = decodeURIComponent(redirect)
    }else{
        redirect = '/home'
    }
    return redirect;
}

const toRedirct = ()=>{
    router.replace({
        path:getRedirct()
    })
}

onMounted(()=>{
    if(authStore.loggedIn){
        toRedirct();
    }
})

const loginHandle = async (opt:{
    username: string;
    password: string;
})=>{
  const succes = await authStore.login({
    username: opt.username,
    password: opt.password
  })

  if(succes){
    toRedirct();
  }
}

</script>