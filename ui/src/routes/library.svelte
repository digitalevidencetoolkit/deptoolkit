<script lang="ts">
  import * as Ledger from '$lib/Ledger/index';
  import { Label, Loading } from 'attractions';
  import { BookIcon } from 'svelte-feather-icons';

  // store and initial (async) data loading
  import { ledgerData } from '$lib/stores';
  ledgerData.set(Ledger.fetchData());
</script>

<style lang="scss">
  hr {
    color: var(--muted-grey);
  }
  section {
    width: 100%;
    max-width: var(--column-width);
    margin: var(--column-margin-top) auto 0 auto;

    .center {
      margin-top: 3rem;
      text-align: center;
    }
  }
  h1 {
    font-weight: 700;
    font-size: 2.5rem;
  }
</style>

<svelte:head>
  <title>Library</title>
  <link
    href="https://fonts.googleapis.com/css?family=Roboto:400,600,700"
    rel="stylesheet"
  />
</svelte:head>

<section>
  <h1><BookIcon size="1x" /> Library</h1>
  <hr />
  {#await $ledgerData}
    <div class="center">
      <Loading />
      <Label>...waiting</Label>
    </div>
  {:then data}
    {#each data as item, i}
      <Ledger.LedgerEntryComponent entry={item} {i} />
    {/each}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</section>
