<script>
    import { url } from '@sveltech/routify';
</script>

<main
    class="flex flex-col justify-center content-center text-center w-screen
    h-screen"
>
    <h1 class="font-bold text-gray-900 text-6xl">404</h1>
    <h2 class="font-semibold text-gray-600 text-2xl">Page not found</h2>
    <a
        class="font-semibold text-indigo-500 hover:text-indigo-400
        active:text-indigo-600"
        href="{$url('/')}"
    >
        Go Home
    </a>
</main>
