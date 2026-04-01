<template>
    <div class="flex flex-col">
        <LayoutHeader></LayoutHeader>
        <div class="flex flex-1">
            <!-- <div>
                <div class="flex flex-col">
                    <RouterLink to="/home">首页</RouterLink>
                    <RouterLink to="/about">关于</RouterLink>
                </div>
            </div> -->
            <RouterView class="flex-1"></RouterView>
        </div>
    </div>
</template>

<script setup lang="ts">

import LayoutHeader from './components/LayoutHeader.vue'

</script>