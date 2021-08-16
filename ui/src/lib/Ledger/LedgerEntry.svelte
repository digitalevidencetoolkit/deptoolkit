<script lang="ts">
  import * as Ledger from './index';
  import { fade } from 'svelte/transition';
  import type { LedgerEntry, EntryHistory } from './index';
  import EditingPanel from './EditingPanel.svelte';
  import { domainFromUrl, shortHash } from '$lib/helpers';

  //UI
  import { Button } from 'attractions';
  import {
    ClockIcon,
    ExternalLinkIcon,
    KeyIcon,
    CameraIcon,
    FileTextIcon,
    EditIcon,
    BookOpenIcon,
  } from 'svelte-feather-icons';

  export let entry: LedgerEntry;
  export let i: number;
  let showEditingPanel: boolean = false;

  let originalTX: null | EntryHistory = null;
  $: if (entry.history) {
    originalTX = Ledger.getOriginalTX(entry.history);
  }

  const pathToThumbnail = (path: string): string =>
    `http://localhost:3000/file/${path}.png`;

  const isOdd = i % 2 === 0;
</script>

<style lang="scss">
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
    margin: 1rem 0;
    padding: 1rem;
  }

  section {
    height: 250px;

    &.even {
      background-color: #fbfbfb;
    }

    .thumbnail,
    img {
      width: 300px;
      height: 200px;
      border: 1px solid #ddd;
    }

    .metadata {
      margin-left: 1rem;

      .showHelp:hover {
        cursor: help;
        color: #696969;
        transition: color 0.3s;
      }

      .hashes {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 300px;
      }
    }

    .row {
      display: flex;
      flex-direction: row;
    }
  }
</style>

<section class={isOdd === true ? 'odd' : 'even'} in:fade>
  <div class="thumbnail">
    {#if entry.thumb_hash}
      <img src={pathToThumbnail(entry.thumb_hash)} alt="" />
    {/if}
  </div>
  <div class="metadata">
    <h4>{entry.title}</h4>

    <pre><ExternalLinkIcon size="1x" /> <a href={entry.url}>{domainFromUrl(entry.url)}</a></pre>
    <div class="hashes">
      <pre
        class="showHelp"
        title={entry.sku}><KeyIcon size="1x" /> {shortHash(entry.sku)}</pre>
      <pre
        class="showHelp"
        title={entry.screenshot_hash}><CameraIcon size="1x" /> {shortHash(entry.screenshot_hash)}</pre>
      {#if entry.one_file_hash}
        <pre
          class="showHelp"
          title={entry.one_file_hash}><FileTextIcon size="1x" /> {shortHash(entry.one_file_hash)}</pre>
      {/if}
    </div>

    {#if entry.history}
      <pre><ClockIcon size="1x" /> Added on <b>{originalTX.originalTxDate}, {originalTX.originalTxTime}</b></pre>
    {/if}

    {#if entry.description}
      <pre><BookOpenIcon size="1x"/> {entry.description}</pre>
    {/if}

    <div class="row" style="margin-top: 1rem;">
      <Button
        small
        disabled={entry.history ? true : false}
        on:click={() => Ledger.addHistoryTo(entry)}
        ><pre><ClockIcon size="1x" /> Show history</pre></Button
      >
      <Button small on:click={() => (showEditingPanel = !showEditingPanel)}
        ><pre><EditIcon size="1x" /> {showEditingPanel ? `Hide panel` : `Edit metadata `}</pre></Button
      >
    </div>
    {#if showEditingPanel === true}
      <EditingPanel {entry} />
    {/if}
  </div>
</section>
