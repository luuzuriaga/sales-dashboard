<template>
  <div class="seller-dashboard">
    <div class="page-header">
      <div class="page-header__left">
        <h1>Mi Panel de Ventas</h1>
        <p>Bienvenido de nuevo, {{ userName }} — {{ region }}</p>
      </div>
      <div class="page-header__right">
        <div class="date-badge">{{ today }}</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- KPIs Personales -->
      <div class="kpis-section">
        <div class="kpis-grid">
          <div class="kpi-mini-card">
            <span class="label">Mis Ventas</span>
            <span class="value">{{ formatMoney(misVentasTotal) }}</span>
            <div class="mini-progress">
              <div class="mini-progress__bar" :style="{ width: pctMeta + '%' }"></div>
            </div>
          </div>
          <div class="kpi-mini-card">
            <span class="label">Mi Meta</span>
            <span class="value">{{ formatMoney(miMeta) }}</span>
            <span class="subtext">Trimestre Actual</span>
          </div>
          <div class="kpi-mini-card">
            <span class="label">Cumplimiento</span>
            <span class="value highlight">{{ pctMeta }}%</span>
            <span class="status-indicator" :class="statusClass"></span>
          </div>
        </div>

        <!-- Formulario de Registro -->
        <div class="card registration-card">
          <h3 class="card-title">Registrar Nueva Venta</h3>
          <form @submit.prevent="handleRegisterSale" class="sale-form">
            <div class="form-row">
              <div class="form-group">
                <label>Cliente</label>
                <input v-model="form.cliente" type="text" placeholder="Nombre de la empresa" required />
              </div>
              <div class="form-group">
                <label>Monto (S/)</label>
                <input v-model.number="form.monto" type="number" placeholder="0.00" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Fecha</label>
                <input v-model="form.fecha" type="date" required />
              </div>
              <button class="btn-submit" :disabled="registering">
                <span v-if="registering">Procesando...</span>
                <span v-else>Guardar Venta</span>
              </button>
            </div>
          </form>
          <div v-if="message" :class="['message', `message--${messageType}`]">
            {{ message }}
          </div>
        </div>
      </div>

      <!-- Historial Reciente -->
      <div class="history-section">
        <div class="card history-card">
          <h3 class="card-title">Ventas Recientes</h3>
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
          </div>
          <div v-else-if="ventasRecientes.length === 0" class="empty-state">
            No has registrado ventas aún.
          </div>
          <div v-else class="sales-list">
            <div v-for="sale in ventasRecientes" :key="sale.id" class="sale-item">
              <div class="sale-item__info">
                <div class="client">{{ sale.cliente }}</div>
                <div class="date">{{ formatDate(sale.fecha) }}</div>
              </div>
              <div class="sale-item__amount">{{ formatMoney(sale.monto) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'VendedorDashboard',
  data() {
    return {
      form: {
        cliente: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0]
      },
      registering: false,
      message: '',
      messageType: 'success'
    }
  },
  computed: {
    ...mapState(['loading', 'users']),
    ...mapGetters(['userName']),
    today() {
      return new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
    },
    vendedor() {
      // Como solo hay un usuario en state.users para el vendedor, tomamos el primero
      return this.users[0] || {}
    },
    region() { return this.vendedor.region || '...' },
    misVentasTotal() { return this.vendedor.totalVentas || 0 },
    miMeta() { return this.vendedor.meta || 0 },
    pctMeta() {
      if (this.miMeta === 0) return 0
      return Math.round((this.misVentasTotal / this.miMeta) * 100)
    },
    statusClass() {
      if (this.pctMeta >= 100) return 'status--green'
      if (this.pctMeta >= 80) return 'status--amber'
      return 'status--red'
    },
    ventasRecientes() {
      // El backend devuelve los datos del perfil filtrados por usuario
      return this.vendedor.ventasRecientes || []
    }
  },
  async created() {
    await this.loadData()
  },
  methods: {
    ...mapActions(['fetchUsers', 'agregarVenta']),
    async loadData() {
      await this.fetchUsers()
    },
    formatMoney(n) {
      return 'S/ ' + (n || 0).toLocaleString('es-PE')
    },
    formatDate(d) {
      return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
    },
    async handleRegisterSale() {
      this.registering = true
      this.message = ''
      try {
        await this.agregarVenta(this.form)
        this.message = '¡Venta registrada con éxito!'
        this.messageType = 'success'
        this.form.cliente = ''
        this.form.monto = ''
        // Recargar datos
        await this.loadData()
      } catch (error) {
        this.message = 'Error al registrar la venta.'
        this.messageType = 'error'
      } finally {
        this.registering = false
        setTimeout(() => { if (this.message) this.message = '' }, 3000)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/variables';

.seller-dashboard {
  max-width: 1000px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;

  h1 { font-size: 24px; color: $text-primary; }
  p { font-size: 14px; color: $text-secondary; margin-top: 4px; }
}

.date-badge {
  background: white;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 13px;
  color: $text-secondary;
  border: 1px solid rgba(0,0,0,0.05);
  text-transform: capitalize;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.kpis-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-mini-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  position: relative;

  .label { font-size: 11px; text-transform: uppercase; color: $text-muted; letter-spacing: 0.05em; margin-bottom: 8px; }
  .value { font-size: 20px; font-weight: 700; color: $text-primary; }
  .highlight { color: $primary; }
  .subtext { font-size: 11px; color: $text-muted; margin-top: 4px; }
}

.mini-progress {
  height: 4px;
  background: $bg-muted;
  border-radius: 2px;
  margin-top: 12px;
  overflow: hidden;

  &__bar {
    height: 100%;
    background: $primary;
    border-radius: 2px;
    transition: width 0.5s ease;
  }
}

.status-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 10px;
  height: 10px;
  border-radius: 50%;

  &.status--green { background: $success; box-shadow: 0 0 8px rgba($success, 0.4); }
  &.status--amber { background: $warning; box-shadow: 0 0 8px rgba($warning, 0.4); }
  &.status--red   { background: $danger; box-shadow: 0 0 8px rgba($danger, 0.4); }
}

.registration-card {
  padding: 24px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: $text-primary;
}

.sale-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;

  .form-group { flex: 1; }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label { font-size: 13px; font-weight: 500; color: $text-secondary; }
  input {
    background: $bg-muted;
    border: 1px solid rgba(0,0,0,0.05);
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 14px;
    color: $text-primary;
    transition: all 0.2s;

    &:focus { outline: none; border-color: $primary; background: white; }
  }
}

.btn-submit {
  background: $primary;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  height: 44px;
  flex-shrink: 0;

  &:hover:not(:disabled) { background: darken($primary, 5%); transform: translateY(-1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.message {
  margin-top: 1rem;
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;

  &--success { background: $success-light; color: $success; }
  &--error   { background: $danger-light; color: $danger; }
}

.history-card {
  padding: 24px;
  height: 100%;
}

.sales-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sale-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: $bg-page;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.02);

  &__info {
    .client { font-size: 14px; font-weight: 500; color: $text-primary; }
    .date   { font-size: 12px; color: $text-muted; margin-top: 2px; }
  }

  &__amount {
    font-size: 15px;
    font-weight: 600;
    color: $primary;
    font-family: $font-mono;
  }
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: $text-muted;
  font-size: 13px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba($primary, 0.1);
  border-top-color: $primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
