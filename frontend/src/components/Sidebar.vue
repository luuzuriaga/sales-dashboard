<template>
  <aside class="sidebar">
    <div class="sidebar__brand">
      <img src="../assets/logo.png" alt="SalesDash Logo" class="sidebar__logo-img" />
      <span class="sidebar__name">SalesDash</span>
    </div>

    <nav class="sidebar__nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="sidebar__link"
        active-class="sidebar__link--active"
      >
        <span class="sidebar__icon">{{ item.icon }}</span>
        <span class="sidebar__label">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar__footer">
      <div class="sidebar__user">
        <div class="sidebar__avatar">{{ initials }}</div>
        <div class="sidebar__user-info">
          <div class="sidebar__user-name">{{ userName }}</div>
          <div class="sidebar__user-role">{{ userRole }}</div>
        </div>
      </div>
      <button class="sidebar__logout" @click="handleLogout">
        <span class="sidebar__icon">⏻</span>
        <span>Cerrar Sesión</span>
      </button>
    </div>
  </aside>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'SalesSidebar',
  computed: {
    ...mapGetters(['userName', 'userRole']),
    navItems() {
      if (this.userRole === 'gerente') {
        return [
          { path: '/dashboard',  icon: '◈', label: 'Dashboard'  },
          { path: '/reportes',   icon: '◉', label: 'Reportes'   },
          { path: '/vendedores', icon: '◎', label: 'Vendedores' }
        ]
      } else {
        return [
          { path: '/vendedor/panel', icon: '◈', label: 'Mi Panel' }
        ]
      }
    },
    initials() {
      return this.userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    }
  },
  methods: {
    ...mapActions(['logout']),
    handleLogout() {
      this.logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/variables';

.sidebar {
  width: $sidebar-width;
  min-height: 100vh;
  background: $bg-sidebar;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  flex-shrink: 0;

  @media (max-width: $mobile) {
    display: none;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 2.5rem;
    padding: 0 0.5rem;
  }

  &__logo-img {
    width: 28px;
    height: 28px;
    object-fit: contain;
    flex-shrink: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    letter-spacing: -0.01em;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: $radius-md;
    color: rgba(255, 255, 255, 0.5);
    text-decoration: none;
    font-size: 14px;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: rgba(255, 255, 255, 0.07);
      color: rgba(255, 255, 255, 0.85);
    }

    &--active {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }
  }

  &__icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
  }

  &__footer {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 1rem;
    margin-top: 1rem;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: $primary;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
    flex-shrink: 0;
  }

  &__user-name {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 500;
  }

  &__user-role {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    text-transform: capitalize;
  }

  &__logout {
    width: 100%;
    margin-top: 1rem;
    padding: 8px 12px;
    background: transparent;
    border: 0.5px solid rgba(255, 255, 255, 0.1);
    border-radius: $radius-md;
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba($danger, 0.1);
      color: lighten($danger, 10%);
      border-color: rgba($danger, 0.2);
    }
  }
}
</style>
