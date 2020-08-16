<style global>
    /* purgecss start ignore */
    @import 'tailwindcss/base';
    @import 'tailwindcss/components';
    /* purgecss end ignore */
    @import 'tailwindcss/utilities';
</style>

<script lang="ts">
    /*import { setClient } from 'svelte-apollo';
    import { buildClient } from './services/apollo';
    setClient(buildClient());*/
    export let name: string;
</script>

<main>
    <h1 class="bg-gray-500">Hello {name}!</h1>
    <p>
        Visit the
        <a href="https://svelte.dev/tutorial">Svelte tutorial</a>
        to learn how to build Svelte apps.
    </p>
</main>
