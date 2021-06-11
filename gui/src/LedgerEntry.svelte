<script lang="ts">
  import type { LedgerEntry } from './types';

  export let entry: LedgerEntry;
</script>

<style>
  pre {
    margin-top: 0;
    margin-bottom: 0;
  }

  section h4 {
    margin-bottom: 0.5rem;
  }
</style>


      <section>
        <h4>📦 • {entry.title}</h4>
        <pre>🔗 {entry.url}</pre>
        <pre>🔖 {entry.sku}</pre>
        <pre>⚙️ {entry.hash}</pre>
      </section>