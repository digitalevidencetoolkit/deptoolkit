<script lang="ts">
  import LedgerEntryComponent from './LedgerEntry.svelte';
  import type { LedgerEntry } from './types';

  // double declaration to accomplish two things:
  //   1. the typing of `ledgerData`,
  //   2. its setting as a reactive store.
  let ledgerData: null | LedgerEntry[];
  $: ledgerData = null;

  async function fetchLedgerData(): Promise<void | Error> {
    const res = await fetch('http://localhost:3000/list-docs');
    const data = await res.json();

    if (res.ok) {
      ledgerData = data;
    } else {
      throw new Error(data);
    }
  }

  type History = { blockAddress: {}; data: {}; metadata: { txTime: string } };

  let historyData:
    | [{ sku: ''; history: [] }]
    | {
        sku: string;
        history: History[];
      }[];
  $: historyData = [];

  /**
   * Handle the convoluted querying of a record's history
   * @param id string - the record's ID
   * @returns a promise of a history (an array of revisions)
   */
  async function fetchItemHistory(id: string): Promise<History[]> {
    const res = await fetch(`http://localhost:3000/history/${id}`);
    const data = await res.json();

    if (res.ok) {
      return data;
    }
    // @TODO: error handling!
  }

  /**
   * Show a record's history in the UI: fetch this history
   * and add it to the `historyData` store
   * @param entry object - the record as represented in QLDB
   */
  async function showHistory(entry: LedgerEntry) {
    const itemHistoryData = await fetchItemHistory(entry.sku);
    historyData = [
      ...historyData,
      { sku: entry.sku, history: itemHistoryData },
    ];
  }

  const accessOriginalTxDate = (item: LedgerEntry): string =>
    historyData.find(e => e.sku === item.sku).history[0].metadata.txTime;
</script>

<style>
  main {
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<main>
  {#await fetchLedgerData()}
    <p>...waiting</p>
  {:then fulfilled}
    {#each ledgerData as item}
      {#if historyData.map(e => e.sku).includes(item.sku)}
        <LedgerEntryComponent
          entry={item}
          originalTxDate={new Date(accessOriginalTxDate(item))}
        />
        <div>
          <button disabled on:click={() => showHistory(item)} href="#"
            >🕰 Show history</button
          >
        </div>
      {:else}
        <LedgerEntryComponent entry={item} originalTxDate={undefined} />
        <div>
          <button on:click={() => showHistory(item)} href="#"
            >🕰 Show history</button
          >
        </div>
      {/if}
    {/each}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</main>
