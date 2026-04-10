<template>
  <div id="app">
    <Sidebar v-if="$route.name !== 'Login'" />
    <main class="main-content" :class="{ 'main-content--full': $route.name === 'Login' }">
      <router-view />
    </main>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'

export default {
  name: 'App',
  components: { Sidebar }
}
</script>

<style lang="scss">
@import './styles/variables';
@import './styles/global';

#app {
  display: flex;
  min-height: 100vh;
  background-color: $bg-page;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  transition: padding 0.3s;

  &--full {
    padding: 0;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    &--full { padding: 0; }
  }
}
</style>
