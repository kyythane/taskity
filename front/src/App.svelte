<style global>
    /* purgecss start ignore */
    @import 'tailwindcss/base';
    @import 'tailwindcss/components';
    /* purgecss end ignore */
    @import 'tailwindcss/utilities';
</style>

<script>
    import { Router } from '@sveltech/routify';
    import { routes } from '@sveltech/routify/tmp/routes';
    //import { setClient } from 'svelte-apollo';
    //import { buildClient } from './services/apollo';
    // buildClient();
    //const c1 = buildClient();
    //setClient(buildClient());
</script>

<Router {routes} />
