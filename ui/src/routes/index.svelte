<script context="module" lang="ts">
  // we don't need any JS on this page, though we'll load
  // it in dev so that we get hot module replacement...
  export const prerender = true;
</script>

<script lang="ts">
  // import Counter from '$lib/Counter.svelte';
  import { Card } from 'attractions';
  import { BookIcon, CheckCircleIcon } from 'svelte-feather-icons';
</script>

<style lang="scss">
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

  .cards {
    display: flex;
    flex-direction: row;
    width: 80%;
    justify-content: space-between;

    a {
      color: var(--text-color);
      &:hover {
        text-decoration: none;
      }
    }

    .card {
      width: 40%;
      justify-content: center;

      :global .introtitle {
        display: flex;
        align-items: center;
        transition: 0.5s color;

        &:hover {
          color: #000;
          text-decoration: underline;
        }
      }
    }
  }
</style>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section>
  <h1>The Digital Evidence Preservation Toolkit</h1>
  <div class="cards">
    <a class="card" href="/library">
      <Card>
        <h1 class="introtitle"><BookIcon size="2x" /> Library</h1>
        <p>Browse the contents of the archive</p>
      </Card>
    </a>
    <a class="card" href="/verify">
      <Card>
        <h1 class="introtitle"><CheckCircleIcon size="2x" /> Verify</h1>
        <p>Bulk import and verify files against a ledger</p>
      </Card>
    </a>
  </div>
</section>
