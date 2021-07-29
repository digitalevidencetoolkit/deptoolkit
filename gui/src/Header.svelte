<script>
  import { H2, H3, Button } from 'attractions';
  import { GithubIcon, HomeIcon } from 'svelte-feather-icons';
</script>

<style type="text/scss">
  header {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #4300b0;
    justify-content: space-between;

    .title {
      display: flex;
      flex-direction: row;
    }

    :global h2 {
      margin: 0 0 0 0.6rem;
    }

    nav {
      display: none;

      @media only screen and (min-width: 1024px) {
        display: flex;
        align-items: center;
        flex: 1;
        margin: 0 2em;
        // font-weight: vars.$thin-font-weight;

        .node {
          margin: 0 0.25em;
        }
      }
    }
  }
</style>

<header>
  <div class="title">
    <img src="logo.svg" width="30" alt="Digital Evidence Toolkit logo" />
    <H2>The Digital Evidence Preservation Toolkit</H2>
  </div>

  <nav class="breadcrumbs">
    <!-- {#if segment != null} -->
    <Button href="/" round small>
      <HomeIcon size="20" />
    </Button>
    <div class="node">/</div>
    <div class="node">Library</div>
    <!-- <div class="node">{segmentToName(segment)}</div> -->
    <!-- {/if} -->
  </nav>

  <div>
    <a href="https://github.com/digitalevidencetoolkit/">
      <Button round neutral>
        <GithubIcon size="24" />
      </Button>
    </a>
  </div>
</header>
