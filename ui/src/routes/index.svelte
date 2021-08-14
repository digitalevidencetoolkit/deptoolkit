<script context="module" lang="ts">
  // we don't need any JS on this page, though we'll load
  // it in dev so that we get hot module replacement...
  export const prerender = true;
</script>

<script lang="ts">
  // import Counter from '$lib/Counter.svelte';
  import { Card } from 'attractions';
  import { BookIcon } from 'svelte-feather-icons';
  const routes = [
    {
      url: '/library',
      name: 'Library',
      description: 'Browse the contents of the archive',
    },
    {
      url: '/verify',
      name: 'Verify',
      description: 'Bulk import and verify files against a ledger',
    },
  ];
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
    }
  }
</style>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section>
  <h1>The Digital Evidence Preservation Toolkit</h1>
  <div class="cards">
    {#each routes as route}
      <a class="card" href={route.url}>
        <Card outline>
          <h3>{route.name}</h3>
          <p>{route.description}</p>
        </Card>
      </a>
    {/each}
  </div>
</section>
