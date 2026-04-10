<template>
  <div class="card">
    <div class="chart-header">
      <h3 class="chart-title">Ventas por mes</h3>
      <div class="chart-legend">
        <span class="chart-legend__item">
          <span class="chart-legend__dot chart-legend__dot--bar"></span> Ventas
        </span>
        <span class="chart-legend__item">
          <span class="chart-legend__dot chart-legend__dot--line"></span> Meta
        </span>
      </div>
    </div>
    <div class="chart-wrap">
      <canvas ref="canvas" role="img" aria-label="Gráfico de ventas mensuales vs meta por trimestre">
        Ventas mensuales comparadas con la meta del trimestre.
      </canvas>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  Chart,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(
  BarElement, LineElement, PointElement,
  BarController, LineController,
  CategoryScale, LinearScale,
  Tooltip, Legend
)

export default {
  name: 'SalesChart',

  computed: {
    ...mapGetters(['chartData'])
  },

  watch: {
    chartData() {
      this.updateChart()
    }
  },

  mounted() {
    this.initChart()
  },

  beforeDestroy() {
    if (this.chart) this.chart.destroy()
  },

  methods: {
    buildConfig() {
      const { months, ventas, metas } = this.chartData
      return {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Ventas',
              data: ventas,
              backgroundColor: '#185FA5',
              borderRadius: 5,
              barPercentage: 0.55
            },
            {
              label: 'Meta',
              data: metas,
              type: 'line',
              borderColor: '#1D9E75',
              backgroundColor: 'transparent',
              borderDash: [5, 4],
              pointStyle: 'circle',
              pointRadius: 5,
              pointBackgroundColor: '#1D9E75',
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'DM Sans', size: 12 } }
            },
            y: {
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                callback: v => 'S/' + Math.round(v / 1000) + 'k',
                font: { size: 11 }
              }
            }
          }
        }
      }
    },

    initChart() {
      this.chart = new Chart(this.$refs.canvas, this.buildConfig())
    },

    updateChart() {
      if (!this.chart) return
      const { months, ventas, metas } = this.chartData
      this.chart.data.labels = months
      this.chart.data.datasets[0].data = ventas
      this.chart.data.datasets[1].data = metas
      this.chart.update()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/variables';

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  color: $text-secondary;
}

.chart-legend {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: $text-secondary;

  &__item {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    flex-shrink: 0;

    &--bar  { background: #185FA5; }
    &--line { background: #1D9E75; border-radius: 50%; }
  }
}

.chart-wrap {
  position: relative;
  width: 100%;
  height: 230px;
}
</style>
