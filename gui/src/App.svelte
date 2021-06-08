<script lang="ts">
  async function fetchData() {
    const res = await fetch('http://localhost:3000/list-docs');
    const data = await res.json();

    if (res.ok) {
      return data._resultList;
    } else {
      throw new Error(data);
    }
  }
</script>

<style>
  main {
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  pre {
    margin-top: 0;
    margin-bottom: 0;
  }

  section h4 {
    margin-bottom: 0.5rem;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<main>
  {#await fetchData()}
    <p>...waiting</p>
  {:then ledgerData}
    {#each ledgerData as item, i}
      <section>
        <h4>{i} • {item.title}</h4>
        <pre>🔗 {item.url}</pre>
        <pre>🔖 {item.sku}</pre>
        <pre>⚙️ {item.hash}</pre>
      </section>
    {/each}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</main>
