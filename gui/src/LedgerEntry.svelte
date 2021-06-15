<script lang="ts">
  import type { LedgerEntry } from './types';

  export let entry: LedgerEntry;
  const pathToThumbnail = (entry: LedgerEntry): string =>
    `out/${entry.sku}_thumb.png`;
</script>

<style type="text/scss">
  pre {
    margin-top: 0;
    margin-bottom: 0;
  }

  section h4 {
    margin-bottom: 0.5rem;
  }

  section {
    display: flex;
    flex-direction: row;
    width: 100%;
    margin: 1rem;
  }

  section {
    height: 250px;

    .thumbnail,
    img {
      width: 320px;
      height: 230px;
    }

    .metadata {
      margin-left: 1rem;
    }
  }
</style>

<section>
  <div class="thumbnail">
    {#if entry.hash}
      <img src={pathToThumbnail(entry)} alt="" />
    {/if}
  </div>
  <div class="metadata">
    <h4>📦 • {entry.title}</h4>
    <pre>🔗 {entry.url}</pre>
    <pre>🔖 {entry.sku}</pre>
    <pre>⚙️ {entry.hash}</pre>
  </div>
</section>
