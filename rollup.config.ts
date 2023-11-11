import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

export default [{
  input: './src/index.ts',
  output: [
    {
      file: 'dist/cjs/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    },
    {
      file: 'dist/esm/index.mjs',
      format: 'esm',
      sourcemap: true,
      exports: 'auto'
    }
  ],
  plugins: [esbuild()],
  external: []
}, {
  input: 'src/index.ts',
  plugins: [dts()],
  output: {
    file: 'dist/bundle.d.ts',
    format: 'es'
  }
}]
