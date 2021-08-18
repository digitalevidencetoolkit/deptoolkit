<script lang="ts">
  import type { QLDBHistory } from './index';
  import * as Ledger from './index';
  export let history: QLDBHistory;

  import * as scale from 'd3-scale';
  import * as timeFormat from 'd3-time-format';
  import * as time from 'd3-time';

  const w = 300;
  const h = 50;
  const padding = 10;

  const scaleTime = scale
    .scaleTime()
    .domain([new Date('2021-07-27'), new Date()])
    .range([0 + padding, w - padding])
    .nice();

  const ticks = scaleTime.ticks(time.timeWeek);

  const format = timeFormat.timeFormat('%d %b');
</script>

<style type="text/scss">
  $grey: #ddd;
  svg {
    path {
      stroke: $grey;
      stroke-width: 2px;

      &.axis {
        stroke-dasharray: 4 8;
      }
    }
    circle {
      fill: $grey;
      mix-blend-mode: darken;
      opacity: 0.8;
      stroke: #111;
    }
    text {
      font-size: 10px;
      text-anchor: middle;
    }
  }
</style>

<svg width={w} height={h}>
  <path class="axis" d={`M${padding} ${h / 2} L${w - padding} ${h / 2}`} />
  {#each history as item, i}
    <circle r={5} cx={scaleTime(Ledger.getTXDateFromBlock(item))} cy={h / 2} />
  {/each}
  <g>
    {#each ticks as tick, i}
      <path d={`M${scaleTime(tick)} ${h / 2} L${scaleTime(tick)} ${0.6 * h}`} />
      <text x={scaleTime(tick)} y={0.9 * h}>{format(tick)}</text>
    {/each}
  </g>
</svg>
