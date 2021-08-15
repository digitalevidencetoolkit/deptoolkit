<script lang="ts">
  import { FileDropzone, Button } from 'attractions';
  import { CheckIcon } from 'svelte-feather-icons';
  let uploads: File[] | [] = [];

  async function postFiles(payload: FormData) {
    const res = await fetch(`http://localhost:3000/verify`, {
      method: 'POST',
      body: payload,
    });

    if (res.ok === true) {
      console.log(res);
    }
  }
  async function handleSubmit(e: Event) {
    const formData = new FormData();
    for (const i in uploads) {
      console.log(`append file ${i}`);
      formData.append(`file`, uploads[i], `file${i}.png`);
    }
    postFiles;
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
    <FileDropzone accept="image/*" max={3} bind:files={uploads} />
    {#if uploads.length > 0}
      <Button small type="submit"><CheckIcon size="1x" /> Submit</Button>
    {/if}
  </form>
</div>
