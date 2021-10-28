<script lang="ts">
  import { FileDropzone, Button } from 'attractions';
  import { CheckIcon, CheckCircleIcon } from 'svelte-feather-icons';
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

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
  }

  hr {
    color: var(--muted-grey);
    margin: 4rem 0;
  }
  .center {
    display: flex;
    justify-content: center;
  }
  :global .dropzone-layer,
  :global .file-dropzone,
  :global .empty-layer,
  :global .title {
    color: var(--accent-color);
    border-color: var(--accent-color) !important;
  }
  :global .btn.outline {
    color: var(--accent-color);
    border: 1px solid var(--accent-color) !important;
  }
</style>

<svelte:head>
  <title>Verify</title>
  <link
    href="https://fonts.googleapis.com/css?family=Roboto:400,600,700"
    rel="stylesheet"
  />
</svelte:head>

<div class="content">
  <h1><CheckCircleIcon size="1x" /> Verifying an archive</h1>

  <p>
    Content dragged-and-dropped into this page will be cross-checked against the
    database and will be sent over the internet to the Toolkit.
  </p>
  <p>
    The SHA256 signature of the items to cross-reference are generated upon
    reception server-side and looked up in the ledger.
  </p>
  <p>Matches will be surfaced below. Non-matches won't appear.</p>

  <hr />

  <form on:submit|preventDefault={handleSubmit} class="col">
    <FileDropzone accept="image/*" max={30} bind:files={uploads} />
    {#if uploads.length > 0}
      <div class="center">
        <Button outline type="submit"><CheckIcon size="1x" /> Submit</Button>
      </div>
    {/if}
  </form>

  {#if matches.length > 0}
    <hr />

    <h3>Positive database matches:</h3>
    {#each matches as item, i}
      <Ledger.LedgerEntryComponent entry={item} {i} isMuted={true} />
    {/each}
  {/if}
</div>
