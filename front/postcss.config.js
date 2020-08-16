const cssnano = require('cssnano')({ preset: 'default' })

const purgecss = require('@fullhuman/postcss-purgecss')({
    content: [
        './**/**/*.html',
        './**/**/*.svelte',
    ],

    whitelistPatterns: [/svelte-/],

    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
});

const production = !process.env.ROLLUP_WATCH

module.exports = {
    plugins: [
        require('tailwindcss'),
        require('postcss-font-family-system-ui'),
        require('autoprefixer'),
        ...(production ? [purgecss, cssnano] : [])
    ]
};
