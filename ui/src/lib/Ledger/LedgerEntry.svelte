<script lang="ts">
  import * as Ledger from './index';
  import { fade } from 'svelte/transition';
  import type { LedgerEntry, OriginalTx } from './index';
  import History from './History.svelte';
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
  export let muted: boolean;

  let showEditingPanel: boolean = false;
  let showHistory: boolean = false;

  let originalTX: null | OriginalTx = null;
  $: if (entry.history) {
    originalTX = Ledger.getOriginalTX(entry.history);
    showHistory = true;
  }

  const pathToThumbnail = (path: string): string => `/api/file/${path}.png`;

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
    &.small {
      height: 230px;
    }
    &.tall {
      height: 350px;
    }
    transition: height 0.7s;

    &.even {
      background-color: #fbfbfb;
    }

    .thumbnail {
      width: 300px;
      height: 200px;
      margin-top: 1rem;

      img {
        width: 300px;
        height: 200px;
        border: 1px solid #ddd;
      }
    }

    .metadata {
      margin-left: 1rem;

      .showHelp:hover {
        cursor: help;
        color: var(--accent-color);
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
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dotted var(--muted-grey);
    }
  }
</style>

<section
  class="{isOdd === true ? 'odd' : 'even'} {showEditingPanel
    ? 'tall'
    : 'small'} {showHistory ? 'tall' : 'small'}"
  in:fade={{ duration: muted === true ? 200 : 0 }}
>
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
      <History history={entry.history} />
      <pre><ClockIcon size="1x" /> Added on <b>{originalTX.originalTxDate}, {originalTX.originalTxTime}</b></pre>
    {/if}

    {#if entry.description}
      <pre><BookOpenIcon size="1x"/> {entry.description}</pre>
    {/if}

    {#if !muted}
      <div class="row">
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
    {/if}

    <Button small on:click={() => Ledger.requestWorkingCopy(entry.sku)}
      ><pre><EditIcon size="1x" /> Export working copy</pre></Button
    >
    {#if showEditingPanel === true}
      <EditingPanel {entry} />
    {/if}
  </div>
</section>
