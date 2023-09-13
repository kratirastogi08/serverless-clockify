const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin')
const path=require('path')
module.exports={
    target: 'node',
    mode: slsw.lib.webpack.isLocal ? 'development' : 'development',
    entry: slsw.lib.entries,
    externals: [nodeExternals()],
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.ts', '.tsx','.ejs'],
    },
    output: {
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        sourceMapFilename: '[file].map',
      },
      plugins: [
        new CopyPlugin({
          patterns: [           
            // ALL .ejs files copied under '<top-level-dist>/email-templates', maintaining sub-folder structure
            {
              from: 'src/templates/*.ejs',
              to: './',
            },
          ],
        }),
      ]
}