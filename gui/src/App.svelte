<script lang="ts">
  import * as Ledger from './Ledger/index';
  import Header from './Header.svelte';
  import { Label, Loading, Button } from 'attractions';

  // store and initial (async) data loading
  import { ledgerData } from './stores';
  ledgerData.set(Ledger.fetchData());
</script>

<style type="text/scss">
  main {
    padding: 1em;
    margin: 0 auto;
    :global .label {
      text-align: center;
    }
  }

  :global svg.feather {
    transform: translateY(2px);
  }
</style>

<Header />
<main>
  {#await $ledgerData}
    <Loading />
    <Label>...waiting</Label>
  {:then data}
    {#each data as item, i}
      <Ledger.LedgerEntryComponent entry={item} {i} />
    {/each}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</main>
