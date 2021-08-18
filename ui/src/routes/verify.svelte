<script lang="ts">
  import { FileDropzone, Button } from 'attractions';
  import { CheckIcon } from 'svelte-feather-icons';
  import * as Ledger from '$lib/Ledger';
  import { putFileinFormData, wait } from '$lib/helpers';
  let uploads: File[] | [] = [];

  let matches: Ledger.LedgerEntry[] = [];
  $: matches = [];

  const parseMatches = (res: Ledger.LedgerEntry) => {
    if ('sku' in res) {
      matches = [...matches, res];
    }
  };

  async function handleSubmit() {
    for (let i = 0; i < uploads.length; i++) {
      wait(200 * i)
        .then(() => putFileinFormData(uploads[i]))
        .then(form => Ledger.verifyFile(form))
        .then(res => res.json())
        .then(data => parseMatches(data));
    }
  }
</script>

<style>
  .content {
    width: 100%;
    max-width: var(--column-width);
    margin: var(--column-margin-top) auto 0 auto;
  }
</style>

<svelte:head>
  <title>Verify</title>
</svelte:head>

<div class="content">
  <h1>Verifying an archive</h1>

  <p>
    Pellentesque dapibus suscipit ligula. Donec posuere augue in quam. Etiam vel
    tortor sodales tellus ultricies commodo. Suspendisse potenti. Aenean in sem
    ac leo mollis blandit. Donec neque quam, dignissim in, mollis nec, sagittis
    eu, wisi. Phasellus lacus. Etiam laoreet quam sed arcu. Phasellus at dui in
    ligula mollis ultricies.
  </p>

  <form on:submit|preventDefault={handleSubmit} class="col">
    <FileDropzone accept="image/*" max={30} bind:files={uploads} />
    {#if uploads.length > 0}
      <Button small type="submit"><CheckIcon size="1x" /> Submit</Button>
    {/if}
  </form>

  <h3>Matches:</h3>
  {#each matches as item, i}
    <Ledger.LedgerEntryComponent entry={item} {i} />
  {/each}
</div>
