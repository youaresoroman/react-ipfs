const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const sass = require('rollup-plugin-scss');
module.exports = {
    rollup(config, options) {
        config.plugins.push(
            sass({
                output: true,
                output: 'dist/bundle.css',
                prefix: `@import "./variables.scss";`,
                //outputStyle: 'compressed'
            }),
            postcss({
                plugins: [
                    autoprefixer(),
                ],
                inject: false,
                // only write out CSS for the first bundle (avoids pointless extra files):
                extract: !!options.writeMeta,
            })
        );
        return config;
    },
};