import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild'

export default [{
    input: "./src/index.ts",
    output: [
        {
            file: "dist/index.js",
            format: "cjs",
            sourcemap: true,
            exports: "auto",
        },
        {
            file: "dist/index.esm.js",
            format: "esm",
            sourcemap: true,
            exports: "auto",
        }
    ],
    plugins: [esbuild()],
    external: [],
}, {
    input: `src/index.ts`,
    plugins: [dts()],
    output: {
        file: `dist/bundle.d.ts`,
        format: 'es',
    },
}]

