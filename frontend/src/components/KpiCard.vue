<template>
  <div class="kpi-card">
    <div class="kpi-card__label">{{ label }}</div>
    <div class="kpi-card__value">{{ value }}</div>
    <div class="kpi-card__delta" :class="`kpi-card__delta--${deltaType}`">
      <span>{{ deltaIcon }}</span> {{ delta }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'KpiCard',
  props: {
    label:     { type: String,  required: true },
    value:     { type: String,  required: true },
    delta:     { type: String,  default: '' },
    deltaType: { type: String,  default: 'neutral' } // 'up' | 'down' | 'neutral'
  },
  computed: {
    deltaIcon() {
      if (this.deltaType === 'up')   return '↑'
      if (this.deltaType === 'down') return '↓'
      return '—'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/variables';

.kpi-card {
  background: $bg-muted;
  border-radius: $radius-md;
  padding: 1rem 1.25rem;

  &__label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: $text-secondary;
    margin-bottom: 6px;
  }

  &__value {
    font-family: $font-mono;
    font-size: 24px;
    font-weight: 700;
    color: $text-primary;
    line-height: 1;
  }

  &__delta {
    font-size: 12px;
    margin-top: 6px;

    &--up     { color: $success; }
    &--down   { color: $danger;  }
    &--neutral { color: $text-secondary; }
  }
}
</style>
