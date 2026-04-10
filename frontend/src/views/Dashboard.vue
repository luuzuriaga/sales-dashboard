<template>
  <div class="dashboard" id="dashboard-content">
    <div class="page-header" data-html2canvas-ignore="false">
      <div class="page-header__left">
        <h1>Dashboard de Ventas</h1>
        <p>Resumen ejecutivo — {{ anio }}</p>
      </div>
      <div class="page-header__right">
        <FilterBar />
        <button class="btn-export" @click="exportToPDF" :disabled="loading">
          <span v-if="exporting">Generando...</span>
          <span v-else>Exportar PDF</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !vendedoresConEstado.length" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando datos del servidor...</p>
    </div>

    <template v-else>
      <!-- KPIs -->
      <transition-group name="fade-up" tag="div" class="kpis-grid">
        <KpiCard
          key="total"
          label="Ventas totales"
          :value="formatMoney(kpis.total)"
          :delta="deltasMap[trimestre].total"
          :delta-type="deltaTypeMap[trimestre].total"
        />
        <KpiCard
          key="orders"
          label="Pedidos"
          :value="kpis.orders.toString()"
          :delta="deltasMap[trimestre].orders"
          :delta-type="deltaTypeMap[trimestre].orders"
        />
        <KpiCard
          key="ticket"
          label="Ticket promedio"
          :value="formatMoney(kpis.ticket)"
          :delta="deltasMap[trimestre].ticket"
          :delta-type="deltaTypeMap[trimestre].ticket"
        />
        <KpiCard
          key="meta"
          label="Meta alcanzada"
          :value="kpis.metaPct + '%'"
          :delta="'Objetivo: S/ 183k'"
          delta-type="neutral"
        />
      </transition-group>

      <!-- Gráficos -->
      <div class="charts-grid">
        <SalesChart />

        <div class="card">
          <h3 class="card-label">Ventas por región</h3>
          <div class="region-bars">
            <div
              v-for="r in regiones"
              :key="r.name"
              class="region-row"
            >
              <span class="region-row__name">{{ r.name }}</span>
              <div class="region-row__track">
                <div
                  class="region-row__fill"
                  :style="{ width: r.pct + '%' }"
                ></div>
              </div>
              <span class="region-row__pct">{{ r.pct }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de vendedores -->
      <div class="card table-card">
        <h3 class="card-label">Detalle por vendedor</h3>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Región</th>
                <th>Ventas</th>
                <th>Meta</th>
                <th>Cumplimiento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in vendedoresConEstado" :key="v.id">
                <td class="td--name">{{ v.name }}</td>
                <td class="td--muted">{{ v.region }}</td>
                <td class="td--mono">{{ formatMoney(v.ventas) }}</td>
                <td class="td--muted">{{ formatMoney(v.meta) }}</td>
                <td>
                  <div class="progress-wrap">
                    <div class="progress-bar">
                      <div
                        class="progress-bar__fill"
                        :class="`progress-bar__fill--${v.estado}`"
                        :style="{ width: Math.min(v.pct, 100) + '%' }"
                      ></div>
                    </div>
                    <span class="progress-pct">{{ v.pct }}%</span>
                  </div>
                </td>
                <td>
                  <span class="badge" :class="`badge--${v.estado}`">
                    {{ estadoLabel(v.estado) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import FilterBar from '@/components/FilterBar.vue'
import KpiCard from '@/components/KpiCard.vue'
import SalesChart from '@/components/SalesChart.vue'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default {
  name: 'DashboardView',
  components: { FilterBar, KpiCard, SalesChart },

  data() {
    return {
      exporting: false,
      deltasMap: {
        Q1: { total: '+12% vs año anterior', orders: '+8%', ticket: '+4%' },
        Q2: { total: '+18% vs año anterior', orders: '+20%', ticket: '-2%' },
        Q3: { total: '-22% vs año anterior', orders: '-23%', ticket: '+1%' },
        Q4: { total: '+49% vs año anterior', orders: '+46%', ticket: '+2%' }
      },
      deltaTypeMap: {
        Q1: { total: 'up',   orders: 'up',   ticket: 'up'   },
        Q2: { total: 'up',   orders: 'up',   ticket: 'down' },
        Q3: { total: 'down', orders: 'down', ticket: 'up'   },
        Q4: { total: 'up',   orders: 'up',   ticket: 'up'   }
      }
    }
  },

  computed: {
    ...mapState(['trimestre', 'anio', 'loading']),
    ...mapGetters(['kpis', 'regiones', 'vendedoresConEstado'])
  },

  async created() {
    // Cargar todos los datos necesarios para el Gerente
    await Promise.all([
      this.$store.dispatch('fetchSalesData'),
      this.$store.dispatch('fetchUsers'),
      this.$store.dispatch('fetchReportData')
    ])
  },

  methods: {
    formatMoney(n) {
      if (!n) return 'S/ 0'
      return 'S/ ' + n.toLocaleString('es-PE')
    },
    estadoLabel(estado) {
      return { green: 'En meta', amber: 'Cerca', red: 'Bajo meta' }[estado]
    },
    async exportToPDF() {
      this.exporting = true
      try {
        const element = document.getElementById('dashboard-content')
        // Hide filter bar for PDF
        const filterBar = element.querySelector('.page-header__right')
        filterBar.style.display = 'none'

        const canvas = await html2canvas(element, { 
          scale: 2,
          useCORS: true,
          backgroundColor: '#0a0a0c' // Fondo oscuro del dashboard
        })
        
        filterBar.style.display = 'flex'

        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const imgProps = pdf.getImageProperties(imgData)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`Reporte_Ventas_${this.trimestre}.pdf`)
      } catch (error) {
        console.error('Error al exportar PDF:', error)
        alert('Hubo un error al generar el PDF.')
      } finally {
        this.exporting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/variables';

.dashboard { 
  max-width: 1100px; 
  padding-bottom: 2rem;
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.75rem;

  &__left h1 { font-size: 22px; }
  &__left p  { font-size: 13px; color: $text-secondary; margin-top: 2px; }

  &__right {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.btn-export {
  background: $primary;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  height: 36px;

  &:hover:not(:disabled) {
    background: darken($primary, 10%);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: $text-secondary;

  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba($primary, 0.2);
    border-top: 3px solid $primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.kpis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 1.5rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 1.5rem;

  @media (max-width: 700px) { grid-template-columns: 1fr; }
}

.card-label {
  font-size: 13px;
  font-weight: 500;
  color: $text-secondary;
  margin-bottom: 1rem;
}

// Barras de región
.region-bars { display: flex; flex-direction: column; gap: 10px; }

.region-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;

  &__name {
    width: 72px;
    color: $text-secondary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__track {
    flex: 1;
    height: 7px;
    background: $bg-muted;
    border-radius: 4px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: $primary;
    border-radius: 4px;
    transition: width 0.5s ease;
  }

  &__pct {
    width: 30px;
    text-align: right;
    font-family: $font-mono;
    font-size: 11px;
    color: $text-primary;
  }
}

// Tabla
.table-card { overflow: hidden; }
.table-wrap { overflow-x: auto; }

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead th {
    text-align: left;
    padding: 8px 12px;
    color: $text-secondary;
    font-weight: 400;
    border-bottom: 0.5px solid $border-color;
    white-space: nowrap;
  }

  tbody td {
    padding: 10px 12px;
    border-bottom: 0.5px solid $border-color;
    color: $text-primary;
  }

  tbody tr:last-child td { border-bottom: none; }
}

.td--name  { font-weight: 500; }
.td--muted { color: $text-secondary; }
.td--mono  { font-family: $font-mono; font-size: 12px; }

// Barra de progreso inline
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: $bg-muted;
  border-radius: 4px;
  overflow: hidden;
  min-width: 60px;

  &__fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;

    &--green { background: $success; }
    &--amber { background: $warning; }
    &--red   { background: $danger;  }
  }
}

.progress-pct {
  font-size: 11px;
  font-family: $font-mono;
  color: $text-secondary;
  width: 32px;
}
</style>
