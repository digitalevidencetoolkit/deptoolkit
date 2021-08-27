<script lang="ts">
  import * as Ledger from './index';
  import { fade } from 'svelte/transition';
  import type { LedgerEntry, OriginalTx } from './index';
  import History from './History.svelte';
  import EditingPanel from './EditingPanel.svelte';
  import EntryThumbnail from './EntryThumbnail.svelte';
  import EntryMetadata from './EntryMetadata.svelte';

  //UI
  import { Button } from 'attractions';
  import { ClockIcon, EditIcon, BookOpenIcon } from 'svelte-feather-icons';

  export let entry: LedgerEntry;
  export let i: number;
  export let isMuted: boolean;

  let showEditingPanel: boolean = false;
  let showHistory: boolean = false;

  let originalTX: null | OriginalTx = null;
  $: if (entry.history) {
    originalTX = Ledger.getOriginalTX(entry.history);
    showHistory = true;
  }

  const isOdd = i % 2 === 0;
</script>

<style lang="scss">
  pre {
    margin-top: 0;
    margin-bottom: 0;
  }

  section {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    margin: 1rem 0;
    padding: 1rem;

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
      min-width: 300px;
      height: 200px;
      margin-top: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #ddd;
    }

    .row {
      display: flex;
      flex-direction: row;
      margin-top: 1rem;
      padding-top: 1rem;
    }
  }
</style>

<!-- prettier-ignore -->
<section class="{isOdd === true ? 'odd' : 'even'}
                {showEditingPanel === false &&
                 showHistory === false ? 'small' : 'tall'}"
          in:fade={{ duration: isMuted === true ? 200 : 0 }}>

  <div class="thumbnail">
    <EntryThumbnail url={entry.thumb_hash} />
  </div>

  <div class="metadata">
    <EntryMetadata {entry} />

    {#if entry.history}
      <History history={entry.history} />
      <pre><ClockIcon size="1x" /> Added on <b>{originalTX.originalTxDate}, {originalTX.originalTxTime}</b></pre>
    {/if}

    {#if entry.description}
      <pre><BookOpenIcon size="1x"/> {entry.description}</pre>
    {/if}

    {#if !isMuted}
      <div class="row">
        <!-- prettier-ignore -->
        <Button small 
          on:click={() => Ledger.addHistoryTo(entry)}
          disabled={entry.history ? true : false}>
          <pre><ClockIcon size="1x" /> Show history</pre>
        </Button>
        <Button small on:click={() => (showEditingPanel = !showEditingPanel)}>
          <pre><EditIcon size="1x" /> {showEditingPanel ? `Hide panel` : `Edit metadata `}</pre>
        </Button>
      </div>
    {/if}

    <!-- prettier-ignore -->
    <Button small on:click={() => Ledger.requestWorkingCopy(entry.sku)}>
      <pre><EditIcon size="1x" /> Export working copy</pre>
    </Button>

    {#if showEditingPanel === true}
      <EditingPanel {entry} />
    {/if}
  </div>
</section>
