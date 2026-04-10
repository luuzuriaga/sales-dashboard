<template>
  <div class="vendedores">
    <div class="page-header">
      <div>
        <h1>Vendedores</h1>
        <p>Equipo de ventas — datos del servidor vía API REST</p>
      </div>
      <FilterBar />
    </div>

    <!-- Loading / Error states -->
    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <p>Cargando datos del servidor...</p>
    </div>

    <div v-else-if="error" class="state-box state-box--error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="cargarVendedores">Reintentar</button>
    </div>

    <template v-else>
      <!-- Buscar / filtrar -->
      <div class="toolbar">
        <input
          v-model="busqueda"
          type="text"
          class="search-input"
          placeholder="Buscar vendedor..."
        />
        <select v-model="filtroEstado" class="select-input">
          <option value="">Todos los estados</option>
          <option value="green">En meta</option>
          <option value="amber">Cerca</option>
          <option value="red">Bajo meta</option>
        </select>
      </div>

      <!-- Tarjetas de vendedores -->
      <div class="cards-grid">
        <div
          v-for="v in vendedoresFiltrados"
          :key="v.id"
          class="vendor-card card"
        >
          <div class="vendor-card__header">
            <div class="vendor-card__avatar">{{ iniciales(v.name) }}</div>
            <div>
              <div class="vendor-card__name">{{ v.name }}</div>
              <div class="vendor-card__region">{{ v.region }}</div>
            </div>
            <span class="badge ml-auto" :class="`badge--${v.estado}`">
              {{ estadoLabel(v.estado) }}
            </span>
          </div>

          <div class="vendor-card__stats">
            <div class="vendor-stat">
              <span class="vendor-stat__label">Ventas</span>
              <span class="vendor-stat__val">{{ formatMoney(v.ventas) }}</span>
            </div>
            <div class="vendor-stat">
              <span class="vendor-stat__label">Meta</span>
              <span class="vendor-stat__val">{{ formatMoney(v.meta) }}</span>
            </div>
            <div class="vendor-stat">
              <span class="vendor-stat__label">Cumplimiento</span>
              <span class="vendor-stat__val vendor-stat__val--mono">{{ v.pct }}%</span>
            </div>
          </div>

          <div class="vendor-card__progress">
            <div class="progress-track">
              <div
                class="progress-fill"
                :class="`progress-fill--${v.estado}`"
                :style="{ width: Math.min(v.pct, 100) + '%' }"
              ></div>
            </div>
          </div>

          <!-- Datos extra desde la API real -->
          <div v-if="apiDataMap[v.id]" class="vendor-card__api">
            <span class="vendor-api-label">Contacto (API):</span>
            <span class="vendor-api-val">{{ apiDataMap[v.id].email }}</span>
          </div>
        </div>
      </div>

      <p v-if="vendedoresFiltrados.length === 0" class="empty-msg">
        No se encontraron vendedores con ese criterio.
      </p>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import FilterBar from '@/components/FilterBar.vue'

export default {
  name: 'VendedoresView',
  components: { FilterBar },

  data() {
    return {
      busqueda: '',
      filtroEstado: '',
      apiDataMap: {}   // datos reales de la API indexados por id
    }
  },

  computed: {
    ...mapState(['loading', 'error', 'users']),
    ...mapGetters(['vendedoresConEstado']),

    vendedoresFiltrados() {
      return this.vendedoresConEstado.filter(v => {
        const matchBusqueda = v.name.toLowerCase().includes(this.busqueda.toLowerCase())
          || v.region.toLowerCase().includes(this.busqueda.toLowerCase())
        const matchEstado = !this.filtroEstado || v.estado === this.filtroEstado
        return matchBusqueda && matchEstado
      })
    }
  },

  watch: {
    // Cuando llegan los users de la API, mapearlos por id de vendedor
    users(newUsers) {
      this.vendedoresConEstado.forEach((v, i) => {
        if (newUsers[i]) {
          this.$set(this.apiDataMap, v.id, newUsers[i])
        }
      })
    }
  },

  created() {
    this.cargarVendedores()
  },

  methods: {
    cargarVendedores() {
      this.$store.dispatch('fetchUsers')
    },

    formatMoney(n) {
      return 'S/ ' + n.toLocaleString('es-PE')
    },

    iniciales(nombre) {
      return nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
    },

    estadoLabel(estado) {
      return { green: 'En meta', amber: 'Cerca', red: 'Bajo meta' }[estado]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/variables';

.vendedores { max-width: 1100px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.75rem;

  h1 { font-size: 22px; }
  p  { font-size: 13px; color: $text-secondary; margin-top: 2px; }
}

// Loading / Error
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 4rem 2rem;
  color: $text-secondary;
  font-size: 14px;

  &--error { color: $danger; }
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid $border-color;
  border-top-color: $primary;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.retry-btn {
  padding: 7px 20px;
  background: $primary;
  color: #fff;
  border: none;
  border-radius: $radius-md;
  font-family: $font-sans;
  font-size: 13px;
  cursor: pointer;

  &:hover { opacity: 0.85; }
}

// Toolbar
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.search-input,
.select-input {
  padding: 8px 14px;
  border: 0.5px solid $border-strong;
  border-radius: $radius-md;
  font-family: $font-sans;
  font-size: 13px;
  background: $bg-card;
  color: $text-primary;
  outline: none;

  &:focus { border-color: $primary; }
}

.search-input { flex: 1; min-width: 180px; }

// Tarjetas
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.vendor-card {
  display: flex;
  flex-direction: column;
  gap: 14px;

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #E6F1FB;
    color: $primary;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    flex-shrink: 0;
  }

  &__name   { font-size: 14px; font-weight: 500; color: $text-primary; }
  &__region { font-size: 12px; color: $text-secondary; }

  &__stats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
  }

  &__progress { }

  &__api {
    font-size: 11px;
    color: $text-muted;
    border-top: 0.5px solid $border-color;
    padding-top: 10px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
}

.ml-auto { margin-left: auto; }

.vendor-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;

  &__label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em; color: $text-muted; }
  &__val   { font-size: 13px; font-weight: 500; color: $text-primary; }
  &__val--mono { font-family: $font-mono; }
}

.vendor-api-label { color: $text-muted; font-weight: 500; }
.vendor-api-val   { color: $primary; }

.progress-track {
  height: 6px;
  background: $bg-muted;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;

  &--green { background: $success; }
  &--amber { background: $warning; }
  &--red   { background: $danger;  }
}

.empty-msg {
  text-align: center;
  color: $text-secondary;
  padding: 3rem;
  font-size: 14px;
}
</style>
