<script>
    import { url } from '@sveltech/routify';
</script>

<div class="flex justify-center items-center w-full h-full">
    <div
        class="flex flex-col justify-center items-center rounded-lg bg-pink-300
        h-64 w-64"
    >
        <h1 class="font-bold text-gray-900 text-6xl">404</h1>
        <h2 class="font-semibold text-gray-700 text-2xl">Page not found</h2>
        <a
            class="font-semibold text-indigo-600 hover:text-indigo-500
            active:text-indigo-700"
            href="{$url('/')}"
        >
            Go Home
        </a>
    </div>
</div>
