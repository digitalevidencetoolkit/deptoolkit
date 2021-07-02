<script lang="ts">
  import LedgerEntryComponent from './LedgerEntry.svelte';
  import type { LedgerEntry } from './types';

  // double declaration to accomplish two things:
  //   1. the typing of `ledgerData`,
  //   2. its setting as a reactive store.
  let ledgerData: null | LedgerEntry[];
  $: ledgerData = null;

  async function fetchData(): Promise<void | Error> {
    const res = await fetch('http://localhost:3000/list-docs');
    const data = await res.json();

    if (res.ok) {
      ledgerData = data;
    } else {
      throw new Error(data);
    }
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
  {#await fetchData()}
    <p>...waiting</p>
  {:then fulfilled}
    {#each ledgerData as item}
      <LedgerEntryComponent entry={item} />
    {/each}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</main>
