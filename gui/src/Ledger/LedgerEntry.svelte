<script lang="ts">
  import * as Ledger from './index';
  import type { LedgerEntry, EntryHistory } from './index';
  import History from '../History.svelte';
  export let entry: LedgerEntry;
  export let i: number;

  //UI
  import { Button } from 'attractions';
  import {
    ClockIcon,
    ExternalLinkIcon,
    KeyIcon,
    CameraIcon,
    FileTextIcon,
    EditIcon,
  } from 'svelte-feather-icons';

  let originalTX: null | EntryHistory = null;
  $: if (entry.history) {
    originalTX = Ledger.getOriginalTX(entry.history);
  }
  const pathToThumbnail = (path: string): string =>
    `http://localhost:3000/file/${path}.png`;

  const isOdd = i % 2 === 0;

  let showEditingPanel: boolean = false;
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
    //height: 250px;

    &.even {
      background-color: #fbfbfb;
    }

    .thumbnail,
    img {
      width: 300px;
      height: 200px;
    }

    .metadata {
      margin-left: 1rem;
    }

    .row {
      display: flex;
      flex-direction: row;
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

    {#if entry.history}
      <pre><ClockIcon size="1x" /> Added on <b>{originalTX.originalTxDate}, {originalTX.originalTxTime}</b></pre>
    {/if}

    <div class="row" style="margin-top: 1rem;">
      <Button
        small
        outline
        disabled={entry.history ? true : false}
        on:click={() => Ledger.addHistoryTo(entry)}
        ><pre><ClockIcon size="1x" /> Show history</pre></Button
      >
      <Button
        small
        outline
        on:click={() => (showEditingPanel = !showEditingPanel)}
        ><pre><EditIcon size="1x" /> {showEditingPanel ? `Hide panel` : `Edit metadata `}</pre></Button
      >
    </div>
    {#if showEditingPanel === true}
      <EditingPanel {entry} />
    {/if}
  </div>
</section>
