<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="brand">
          <img src="../assets/logo.png" alt="SalesDash Logo" class="brand__logo-img" />
          <h1 class="brand__name">SalesDash</h1>
        </div>
        <p class="subtitle">Entra para gestionar tus informes comerciales</p>

        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="admin@test.com"
              required 
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              placeholder="••••••••"
              required 
            />
          </div>

          <div v-if="error" class="login-error">
            {{ error }}
          </div>

          <button type="submit" class="btn-login" :disabled="loading">
            {{ loading ? 'Iniciando sesión...' : 'Entrar al Dashboard' }}
          </button>
        </form>

        <div class="login-footer">
          ¿No tienes acceso? <a href="#">Contacta con el administrador</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: ''
    }
  },
  computed: {
    ...mapState(['loading', 'error'])
  },
  methods: {
    ...mapActions(['login']),
    async handleSubmit() {
      try {
        const user = await this.login({
          email: this.email,
          password: this.password
        })
        
        if (user.role === 'gerente') {
          this.$router.push('/dashboard').catch(() => {})
        } else {
          this.$router.push('/vendedor/panel').catch(() => {})
        }
      } catch (err) {
        // Error manejado en Vuex state
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/variables';

.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $bg-page;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    background: rgba($primary, 0.05);
    filter: blur(100px);
    border-radius: 50%;
    top: -150px;
    right: -150px;
  }
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  z-index: 10;
}

.login-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 3rem 2.5rem;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 2rem;

  &__logo-img {
    width: 48px;
    height: 48px;
    margin-bottom: 0.5rem;
    object-fit: contain;
  }

  &__name {
    font-size: 26px;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: -0.03em;
  }
}

.subtitle {
  text-align: center;
  color: $text-secondary;
  font-size: 15px;
  margin-bottom: 2.5rem;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
  }

  input {
    background: $bg-muted;
    border: 1px solid rgba(0, 0, 0, 0.05);
    padding: 14px 18px;
    border-radius: 12px;
    color: $text-primary;
    font-family: inherit;
    font-size: 15px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &::placeholder {
      color: $text-muted;
    }

    &:hover {
      background: darken($bg-muted, 2%);
      border-color: rgba(0, 0, 0, 0.1);
    }

    &:focus {
      outline: none;
      border-color: $primary;
      background: white;
      box-shadow: 0 0 0 4px rgba($primary, 0.1);
    }
  }
}

.login-error {
  background: $danger-light;
  color: $danger;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  text-align: center;
  border: 1px solid rgba($danger, 0.1);
  font-weight: 500;
}

.btn-login {
  background: $primary;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    background: darken($primary, 5%);
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba($primary, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.login-footer {
  margin-top: 2.5rem;
  text-align: center;
  font-size: 14px;
  color: $text-muted;

  a {
    color: $primary;
    text-decoration: none;
    font-weight: 600;
    &:hover { text-decoration: underline; }
  }
}
</style>
