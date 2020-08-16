<style global>
    /* purgecss start ignore */
    @import 'tailwindcss/base';
    @import 'tailwindcss/components';
    /* purgecss end ignore */
    @import 'tailwindcss/utilities';
</style>

<script lang="ts">
    import { Router } from '@sveltech/routify';
    import { routes } from '@sveltech/routify/tmp/routes';
    /*import { setClient } from 'svelte-apollo';
    import { buildClient } from './services/apollo';
    setClient(buildClient());*/
</script>

<Router {routes} />
