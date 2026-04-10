<template>
  <div class="reportes">
    <div class="page-header">
      <div>
        <h1>Reportes</h1>
        <p>Análisis comparativo anual por trimestre</p>
      </div>
      <FilterBar />
    </div>

    <!-- Resumen del trimestre -->
    <div class="summary-grid">
      <div class="card summary-card">
        <div class="summary-card__icon summary-card__icon--blue">↑</div>
        <div class="summary-card__body">
          <div class="summary-card__label">Mejor mes del {{ trimestre }}</div>
          <div class="summary-card__value">{{ mejorMes.name }}</div>
          <div class="summary-card__sub">{{ formatMoney(mejorMes.valor) }}</div>
        </div>
      </div>

      <div class="card summary-card">
        <div class="summary-card__icon summary-card__icon--green">★</div>
        <div class="summary-card__body">
          <div class="summary-card__label">Top vendedor</div>
          <div class="summary-card__value">{{ topVendedor.name }}</div>
          <div class="summary-card__sub">{{ formatMoney(topVendedor.ventas) }}</div>
        </div>
      </div>

      <div class="card summary-card">
        <div class="summary-card__icon summary-card__icon--amber">◎</div>
        <div class="summary-card__body">
          <div class="summary-card__label">Región líder</div>
          <div class="summary-card__value">{{ regionLider.name }}</div>
          <div class="summary-card__sub">{{ regionLider.pct }}% del total</div>
        </div>
      </div>
    </div>

    <!-- Gráfico de dona: distribución por región -->
    <div class="charts-grid">
      <div class="card">
        <h3 class="card-label">Distribución por región — {{ trimestre }}</h3>
        <div class="donut-wrap">
          <canvas
            ref="donutCanvas"
            role="img"
            aria-label="Gráfico de distribución de ventas por región"
          >Distribución de ventas por región.</canvas>
        </div>
        <div class="donut-legend">
          <div v-for="(r, i) in regiones" :key="r.name" class="donut-legend__item">
            <span class="donut-legend__dot" :style="{ background: colors[i] }"></span>
            <span class="donut-legend__name">{{ r.name }}</span>
            <span class="donut-legend__pct">{{ r.pct }}%</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-label">Comparativo anual de ventas</h3>
        <div class="anual-bars">
          <div
            v-for="q in comparativoAnual"
            :key="q.label"
            class="anual-row"
          >
            <span class="anual-row__label">{{ q.label }}</span>
            <div class="anual-row__track">
              <div
                class="anual-row__fill"
                :class="{ 'anual-row__fill--active': q.label === trimestre }"
                :style="{ width: (q.total / maxTotal * 100) + '%' }"
              ></div>
            </div>
            <span class="anual-row__val">{{ formatMoney(q.total) }}</span>
          </div>
        </div>
        <div class="anual-total">
          Total anual: <strong>{{ formatMoney(totalAnual) }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import FilterBar from '@/components/FilterBar.vue'
import {
  Chart, ArcElement, DoughnutController, Tooltip, Legend
} from 'chart.js'

Chart.register(ArcElement, DoughnutController, Tooltip, Legend)

export default {
  name: 'ReportesView',
  components: { FilterBar },

  data() {
    return {
      colors: ['#185FA5', '#1D9E75', '#BA7517', '#D85A30'],
      donutChart: null,
      comparativoAnual: [
        { label: 'Q1', total: 142800 },
        { label: 'Q2', total: 168500 },
        { label: 'Q3', total: 131200 },
        { label: 'Q4', total: 195600 }
      ]
    }
  },

  computed: {
    ...mapState(['trimestre']),
    ...mapGetters(['regiones', 'topVendedor', 'chartData']),

    mejorMes() {
      const { months, ventas } = this.chartData
      const max = Math.max(...ventas)
      const idx = ventas.indexOf(max)
      return { name: months[idx], valor: max }
    },

    regionLider() {
      return [...this.regiones].sort((a, b) => b.pct - a.pct)[0]
    },

    maxTotal() {
      return Math.max(...this.comparativoAnual.map(q => q.total))
    },

    totalAnual() {
      return this.comparativoAnual.reduce((sum, q) => sum + q.total, 0)
    }
  },

  watch: {
    regiones() {
      this.updateDonut()
    }
  },

  mounted() {
    this.initDonut()
  },

  beforeDestroy() {
    if (this.donutChart) this.donutChart.destroy()
  },

  methods: {
    formatMoney(n) {
      return 'S/ ' + n.toLocaleString('es-PE')
    },

    initDonut() {
      this.donutChart = new Chart(this.$refs.donutCanvas, {
        type: 'doughnut',
        data: {
          labels: this.regiones.map(r => r.name),
          datasets: [{
            data: this.regiones.map(r => r.pct),
            backgroundColor: this.colors,
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: { legend: { display: false } }
        }
      })
    },

    updateDonut() {
      if (!this.donutChart) return
      this.donutChart.data.labels = this.regiones.map(r => r.name)
      this.donutChart.data.datasets[0].data = this.regiones.map(r => r.pct)
      this.donutChart.update()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/variables';

.reportes { max-width: 1100px; }

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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 1.5rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 14px;

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: $radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    flex-shrink: 0;

    &--blue  { background: #E6F1FB; color: $primary;  }
    &--green { background: #EAF3DE; color: $success;  }
    &--amber { background: #FAEEDA; color: $warning;  }
  }

  &__label { font-size: 11px; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.07em; }
  &__value { font-size: 15px; font-weight: 500; color: $text-primary; margin-top: 2px; }
  &__sub   { font-size: 12px; color: $text-secondary; margin-top: 2px; }
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 700px) { grid-template-columns: 1fr; }
}

.card-label {
  font-size: 13px;
  font-weight: 500;
  color: $text-secondary;
  margin-bottom: 1rem;
}

.donut-wrap {
  position: relative;
  height: 200px;
}

.donut-legend {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  &__name { flex: 1; color: $text-secondary; }
  &__pct  { font-family: $font-mono; font-size: 11px; color: $text-primary; }
}

// Comparativo anual
.anual-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 1rem;
}

.anual-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;

  &__label {
    width: 28px;
    font-weight: 500;
    color: $text-primary;
  }

  &__track {
    flex: 1;
    height: 10px;
    background: $bg-muted;
    border-radius: 5px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: $border-strong;
    border-radius: 5px;
    transition: width 0.5s ease;

    &--active { background: $primary; }
  }

  &__val {
    width: 90px;
    text-align: right;
    font-family: $font-mono;
    font-size: 11px;
    color: $text-secondary;
  }
}

.anual-total {
  font-size: 13px;
  color: $text-secondary;
  text-align: right;
  border-top: 0.5px solid $border-color;
  padding-top: 10px;

  strong { color: $text-primary; font-weight: 500; }
}
</style>
