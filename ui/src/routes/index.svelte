<script context="module" lang="ts">
  // we don't need any JS on this page, though we'll load
  // it in dev so that we get hot module replacement...
  export const prerender = true;
</script>

<script lang="ts">
  // import Counter from '$lib/Counter.svelte';
</script>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
  }

  h1 {
    width: 100%;
  }

  .welcome {
    position: relative;
    width: 100%;
    height: 0;
    padding: 0 0 calc(100% * 495 / 2048) 0;
  }

  .welcome img {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    display: block;
  }
</style>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section>
  <h1>The Digital Evidence Preservation Toolkit</h1>
</section>
