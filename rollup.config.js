const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')

const { main, dependencies } = require('./package.json')

const dir = require('path').dirname(main)

module.exports = {
    input: 'src/index.js',
    output: [{
        file: main,
        format: 'cjs',
        sourceMap: true
    }],
    external: [
        '@babel/runtime-corejs2/regenerator',
        '@babel/runtime-corejs2/core-js/promise',
        '@babel/runtime-corejs2/helpers/asyncToGenerator',
        '@babel/runtime-corejs2/helpers/defineProperty',
        ...Object.keys(dependencies)
    ],
    plugins: [
        babel({
            exclude: 'node_modules/**',
            externalHelpers: true,
            runtimeHelpers: true
        }),
        commonjs()
    ]
}