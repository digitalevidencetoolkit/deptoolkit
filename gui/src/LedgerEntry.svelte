<script lang="ts">
  import type { LedgerEntry } from './types';
  export let entry: LedgerEntry;
  export let originalTxDate: Date | undefined;
  let formattedOriginalTxDate: string | undefined = undefined;
  let formattedOriginalTxTime: string | undefined = undefined;
  $: if (originalTxDate) {
    formattedOriginalTxDate = originalTxDate.toDateString();
    formattedOriginalTxTime = originalTxDate.toLocaleTimeString();
  }

  const pathToThumbnail = (path: string): string =>
    `http://localhost:3000/file/${path}.png`;
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
      width: 300px;
      height: 200px;
    }

    .metadata {
      margin-left: 1rem;
    }
  }
</style>

<section>
  <div class="thumbnail">
    {#if entry.thumb_hash}
      <img src={pathToThumbnail(entry.thumb_hash)} alt="" />
    {/if}
  </div>
  <div class="metadata">
    <h4>📦 • {entry.title}</h4>
    <pre>🔗 {entry.url}</pre>
    <pre>🔖 {entry.sku}</pre>
    <pre>📷️ {entry.screenshot_hash}</pre>
    {#if entry.one_file_hash}
      <pre>📁 {entry.one_file_hash}</pre>
    {/if}
    {#if formattedOriginalTxDate}
      <pre>🕰️ Added on {formattedOriginalTxDate}, {formattedOriginalTxTime}</pre>
    {/if}
  </div>
</section>
