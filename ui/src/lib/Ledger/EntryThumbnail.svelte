<script lang="ts">
  export let url: string;
  const pathToThumbnail = (path: string): string =>
    `/api/file/${path}.png?source=S3`;
</script>

<style lang="scss">
  img {
    max-width: 300px;
    height: 200px;
  }
</style>

<img src={pathToThumbnail(url)} alt="" />
