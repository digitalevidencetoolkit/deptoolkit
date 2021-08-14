<script lang="ts">
  import * as Ledger from '$lib/Ledger/index';
  import { Label, Loading } from 'attractions';
  import { BookIcon } from 'svelte-feather-icons';

  // store and initial (async) data loading
  import { ledgerData } from '$lib/stores';
  ledgerData.set(Ledger.fetchData());
</script>

<style lang="scss">
  .content {
    width: 100%;
    max-width: var(--column-width);
    margin: var(--column-margin-top) auto 0 auto;
  }
</style>

<svelte:head>
  <title>Library</title>
</svelte:head>

<div class="content">
  <h1><BookIcon size="1x" /> Library</h1>
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
</div>
