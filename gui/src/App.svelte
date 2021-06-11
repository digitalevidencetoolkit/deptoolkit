<script lang="ts">
  type LedgerEntry = { title: string; url: string; sku: string; hash?: string };

  let ledgerData: null | LedgerEntry[];
  $: ledgerData = null;

  async function fetchData() {
    const res = await fetch('http://localhost:3000/list-docs');
    const data = await res.json();

    if (res.ok) {
      ledgerData = data._resultList;
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
  {:then fulfilled}
    {#each ledgerData as item}
      <section>
        <h4>📦 • {item.title}</h4>
        <pre>🔗 {item.url}</pre>
        <pre>🔖 {item.sku}</pre>
        <pre>⚙️ {item.hash}</pre>
      </section>
    {/each}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</main>
