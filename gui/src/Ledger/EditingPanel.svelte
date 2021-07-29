<script lang="ts">
  import { TextField, FormField, Label, Button } from 'attractions';
  import { fade } from 'svelte/transition';
  import { CheckIcon } from 'svelte-feather-icons';
  import * as Ledger from './index';

  export let entry;
  const { sku } = entry;

  /**
   * on form submission, build up the FormData that will
   * subsequently be sent to the ledger
   * @param e a DOM event, triggered on click/form submission
   **/
  // @TODO: handle the return and give feedback if promise fulfills
  const handleSubmit = (e: Event) => {
    const formData = new FormData(e.target as HTMLFormElement);
    const parsedFormData = {};
    for (const [k, v] of formData.entries()) {
      parsedFormData[k] = v;
    }
    return Ledger.postDocumentRevision(formData, sku);
  };
</script>

<style type="text/scss">
  :global .text-field {
    width: 300px;
  }
  .col {
    display: flex;
    flex-direction: column;
  }
</style>

<form on:submit|preventDefault={handleSubmit} class="col" in:fade out:fade>
  <div class="groups">
    <Label small>Edit description</Label>
    <input type="text" name="description" />
  </div>
  <Button small type="submit"><CheckIcon size="1x" /> Submit</Button>
</form>
