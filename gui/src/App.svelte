<script lang="ts">
  import * as Ledger from './Ledger/index';
  import { ledgerData } from './stores';
  ledgerData.set(Ledger.fetchData());
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
  {#await $ledgerData}
    <p>...waiting</p>
  {:then data}
    {#each data as item}
      <Ledger.LedgerEntryComponent entry={item} />
      <div>
        <button on:click={() => Ledger.addHistoryTo(item)} href="#"
          >🕰 Show history</button
        >
      </div>
    {/each}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</main>
