<script lang="ts">
  export let url: string;
  const pathToThumbnail = (path: string): string => `/api/file/${path}.png`;
</script>

<style lang="scss">
  img {
    max-width: 300px;
    height: 200px;
  }
</style>

<img src={pathToThumbnail(url)} alt="" />
