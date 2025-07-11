/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// @ts-check

import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import autoprefixer from "autoprefixer";
import cssnanoPlugin from "cssnano";
import ForkTsCheckerNotifierPlugin from "fork-ts-checker-notifier-webpack-plugin";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { resolve } from "node:path";
import { cwd, env } from "node:process";
import { fileURLToPath } from "node:url";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";
import WebpackNotifierPlugin from "webpack-notifier";

import { sassNodeModulesLoadPaths } from "@blueprintjs/node-build-scripts";

import { getPackageName } from "./utils.mjs";

// globals
const IS_PRODUCTION = env.NODE_ENV === "production";
const DEV_PORT = env.PORT || 9001;
const PACKAGE_NAME = getPackageName();

/**
 * Configure plugins loaded based on environment.
 *
 * @type {webpack.WebpackPluginInstance[]}
 */
const plugins = [
    new ForkTsCheckerPlugin(
      {
        async: IS_PRODUCTION ? false : undefined,
        typescript: {
            configFile: "src/tsconfig.json",
            memoryLimit: 4096,
        },
      },
    ),

    // CSS extraction is only enabled in production (see scssLoaders below).
    new MiniCssExtractPlugin({ filename: "[name].css" }),

    // pipe env variables to FE build, with these default values (null means optional)
    new webpack.EnvironmentPlugin({
        NODE_ENV: "development",
        BLUEPRINT_NAMESPACE: null,
        REACT_APP_BLUEPRINT_NAMESPACE: null,
    }),
];

if (!IS_PRODUCTION) {
    plugins.push(
        new ReactRefreshPlugin(),
        new ForkTsCheckerNotifierPlugin({ title: `${PACKAGE_NAME}: typescript`, excludeWarnings: false }),
        new WebpackNotifierPlugin({ title: `${PACKAGE_NAME}: webpack` }),
    );
}

// Module loaders for CSS files, used in reverse order: apply PostCSS, then interpret CSS as ES modules
const cssLoaders = [
    // Only extract CSS to separate file in production mode.
    IS_PRODUCTION
        ? {
              loader: MiniCssExtractPlugin.loader,
          }
        : fileURLToPath(import.meta.resolve("style-loader")),
    {
        loader: fileURLToPath(import.meta.resolve("css-loader")),
        options: {
            // necessary to minify @import-ed files using cssnano
            importLoaders: 1,
        },
    },
    {
        loader: fileURLToPath(import.meta.resolve("postcss-loader")),
        options: {
            postcssOptions: {
                plugins: [autoprefixer, cssnanoPlugin({ preset: "default" })],
            },
        },
    },
];

// Module loaders for Sass/SCSS files, used in reverse order: compile Sass, then apply CSS loaders
const scssLoaders = [
    ...cssLoaders,
    {
        loader: fileURLToPath(import.meta.resolve("sass-loader")),
        options: {
            sassOptions: {
                includePaths: sassNodeModulesLoadPaths,
            },
        },
    },
];

/**
 * @type {webpack.Configuration & { devServer: object }}
 */
export default {
    // to automatically find tsconfig.json
    context: cwd(),

    devtool: IS_PRODUCTION ? false : "eval-source-map",

    devServer: {
        allowedHosts: "all",
        client: {
            overlay: {
                warnings: true,
                errors: true,
            },
            progress: true,
        },
        devMiddleware: {
            index: resolve(cwd(), "src/index.html"),
            stats: "errors-only",
        },
        historyApiFallback: true,
        https: false,
        host: "0.0.0.0",
        hot: true,
        open: false,
        port: DEV_PORT,
        static: {
            // N.B. it is important to exclude TS sources from this directory allow hot module replacement to work
            directory: resolve(cwd(), "src", "assets"),
        },
    },

    mode: IS_PRODUCTION ? "production" : "development",

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: fileURLToPath(import.meta.resolve("source-map-loader")),
                options: {
                    filterSourceMappingUrl: (_url, resourcePath) => {
                        // These external modules (e.g. parse5) contain #sourceMappingUrl comments that point towards
                        // non-existent files. Skip them to reduce Webpack noise.
                        if (/\/node_modules\/(parse5|parse5-htmlparser2-tree-adapter)\//i.test(resourcePath)) {
                            return "skip";
                        }

                        return true;
                    },
                },
            },
            {
                test: /\.tsx?$/,
                loader: fileURLToPath(import.meta.resolve("swc-loader")),
                exclude: /(node_modules)/,
                options: {
                    jsc: {
                        parser: {
                            decorators: true,
                            dynamicImport: true,
                            syntax: "typescript",
                            tsx: true,
                        },
                        transform: {
                            legacyDecorator: true,
                            react: {
                                refresh: !IS_PRODUCTION,
                                runtime: "classic",
                                useBuiltins: true,
                            },
                        },
                    },
                },
            },
            {
                test: /\.css$/,
                use: cssLoaders,
            },
            {
                test: /\.scss$/,
                use: scssLoaders,
            },
            {
                test: /\.(eot|ttf|woff|woff2|svg|png|gif|jpe?g)$/,
                type: "asset/resource",
                generator: {
                    filename: "assets/[name][ext][query][hash]",
                },
            },
        ],
    },

    optimization: {
        minimize: IS_PRODUCTION,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
            }),
        ],
    },

    plugins,

    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".scss"],
    },
};
