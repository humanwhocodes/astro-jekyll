/**
 * @fileoverview Rollup config file
 */

export default [
    {
        input: "src/astro-jekyll.js",
        output: [
            {
                file: "dist/astro-jekyll.cjs",
                format: "cjs"
            },
            {
                file: "dist/astro-jekyll.js",
                format: "esm"
            }
        ]
    }
];
