<script lang="ts">
  import type { QLDBHistory } from './index';
  export let history: QLDBHistory;
  console.log(history);
  const w = 300;
  const h = 50;
  const padding = 10;
</script>

<style type="text/scss">
  $grey: #ddd;
  svg {
    path {
      stroke: $grey;
      stroke-width: 2px;
      stroke-dasharray: 4 8;
    }
    circle {
      fill: $grey;
    }
  }
</style>

<svg width={w} height={h}>
  <circle r={6} cx={padding} cy={h / 2} />
  <path d={`M${padding} ${h / 2} L${w - padding} ${h / 2}`} />
</svg>
