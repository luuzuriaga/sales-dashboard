<template>
  <div class="filter-controls">
    <!-- Selector de Año -->
    <div class="filter-group">
      <button
        v-for="year in years"
        :key="year"
        class="filter-btn"
        :class="{ 'filter-btn--active': anio === year }"
        @click="$store.dispatch('cambiarAnio', year)"
      >
        {{ year }}
      </button>
    </div>

    <div class="filter-divider"></div>

    <!-- Selector de Trimestre -->
    <div class="filter-group">
      <button
        v-for="q in trimestres"
        :key="q"
        class="filter-btn"
        :class="{ 'filter-btn--active': trimestre === q }"
        @click="$store.dispatch('cambiarTrimestre', q)"
      >
        {{ q }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'FilterBar',
  data() {
    return {
      trimestres: ['Q1', 'Q2', 'Q3', 'Q4'],
      years: ['2025', '2026']
    }
  },
  computed: {
    ...mapState(['trimestre', 'anio'])
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/variables';

.filter-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  background: $bg-muted;
  padding: 4px;
  border-radius: 999px;
  border: 0.5px solid $border-color;
}

.filter-group {
  display: flex;
  gap: 2px;
}

.filter-btn {
  padding: 6px 16px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: $text-secondary;
  font-size: 13px;
  font-family: $font-sans;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    color: $text-primary;
  }

  &--active {
    background: #fff;
    color: $text-primary;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1);
  }
}

.filter-divider {
  width: 1px;
  height: 16px;
  background: $border-strong;
  opacity: 0.5;
}
</style>
