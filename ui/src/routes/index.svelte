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
    width: 80%;
    margin: 0 auto;
  }

  .hero {
    @media screen and (min-width: 450px) {
      width: 50%;
      margin-bottom: 4rem;
    }
    h1 {
      width: 100%;
      &.headline {
        font-size: 3rem;
        // width: 70%;
        font-weight: 700;
        text-align: left;
        margin-bottom: 0.5rem;
      }
    }

    h2 {
      &.muted {
        color: --var(--muted-grey);
        font-size: 1.25rem;
        font-weight: 400;
        line-height: 1.25;
      }
    }
  }

  hr {
    width: 30%;
    margin: 0 auto;
    color: var(--muted-grey);
    margin-bottom: 2rem;
  }

  .cards {
    display: flex;
    flex-direction: row;
    width: 80%;
    justify-content: space-between;
    margin-top: 3rem;

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
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--accent-color);

        &:hover {
          color: #000;
          text-decoration: underline;
        }
      }
    }
  }

  .footer {
    margin-top: 6rem;
  }
</style>

<svelte:head>
  <title>Home</title>
  <link
    href="https://fonts.googleapis.com/css?family=Roboto:400,600,700"
    rel="stylesheet"
  />
</svelte:head>

<section>
  <div class="hero">
    <h1 class="headline">The Digital Evidence Preservation Toolkit</h1>
    <h2 class="muted">
      An archiving and annotation tool demonstrating chain of custody in view of
      international prosecutions
    </h2>
  </div>

  <hr />

  <div class="cards">
    <a class="card" href="/library">
      <Card>
        <h2 class="introtitle"><BookIcon size="2x" /> Library</h2>
        <p>Browse the contents of the archive, edit metadata</p>
      </Card>
    </a>
    <a class="card" href="/verify">
      <Card>
        <h2 class="introtitle"><CheckCircleIcon size="2x" /> Verify</h2>
        <p>Bulk import and verify files against a ledger</p>
      </Card>
    </a>
  </div>

  <div class="footer">
    <p><b>Pssst – not sure where to start?</b></p>
    <ul>
      <li>
        <a
          href="https://digitalevidencetoolkit.notion.site/Getting-started-15521f4125534f4aa758a2575c27ad5c"
          >Getting started</a
        >
      </li>
      <li>
        <a
          href="https://digitalevidencetoolkit.notion.site/Technical-Journal-01ad0720aebc4f9c9a8036da0fd7426b"
          >Full technical documentation</a
        >
      </li>
    </ul>
  </div>
</section>
