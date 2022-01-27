<script lang="ts">
  import { domainFromUrl, shortHash, shortenStringToLength } from '$lib/helpers';
  import {
    ExternalLinkIcon,
    KeyIcon,
    CameraIcon,
    FileTextIcon,
  } from 'svelte-feather-icons';
  export let entry;
  const { title, url, sku, screenshot_hash, one_file_hash } = entry;

  const pretty_domain = domainFromUrl(url);
  const pretty_domain_short = `${ shortenStringToLength(pretty_domain, 18) }...`;
</script>

<style lang="scss">
  h4 {
    margin-bottom: 0.5rem;
    width: 350px;
  }
  pre {
    margin-top: 0;
    margin-bottom: 0;
  }
  .showHelp:hover {
    cursor: help;
    color: var(--accent-color);
    transition: color 0.3s;
  }

  .row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 300px;
  }
</style>

<h4>{title}</h4>
<pre><ExternalLinkIcon size="1x" /> <a href={url}>{pretty_domain_short}</a></pre>
<div class="row">
  <!-- prettier-ignore -->
  <pre class="showHelp" title={sku}>
    <KeyIcon size="1x" /> {shortHash(sku)}</pre>
  <!-- prettier-ignore -->
  <pre class="showHelp" title={screenshot_hash}>
    <CameraIcon size="1x" /> {shortHash(screenshot_hash)}
  </pre>
  {#if entry.one_file_hash}
    <!-- prettier-ignore -->
    <pre class="showHelp" title={one_file_hash}>
      <FileTextIcon size="1x" /> {shortHash(one_file_hash)}
    </pre>
  {/if}
</div>
