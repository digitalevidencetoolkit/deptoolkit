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
  $: console.log(historyData);

  async function fetchHistory(id: string): Promise<History[]> {
    const res = await fetch(`http://localhost:3000/history/${id}`);
    const data = await res.json();

    if (res.ok) {
      return data;
    }
    // @TODO: error handling!
  }

  async function showHistory(entry: LedgerEntry) {
    const itemHistoryData = await fetchHistory(entry.sku);
    //@ts-ignore
    historyData = [
      ...historyData,
      { sku: entry.sku, history: itemHistoryData },
    ];
  }
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
      <LedgerEntryComponent entry={item} />
      <div>
        <h4>Actions:</h4>
        <button on:click={() => showHistory(item)}>🕰 Show history</button>
        {#if historyData.find(e => e.sku === item.sku)}
          {historyData.find(e => e.sku === item.sku).history[0].metadata.txTime}
        {/if}
      </div>
    {/each}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</main>
