const path = require('path');

// Export a function. Accept the base config as the only param.
module.exports = async ({ config, mode }) => {
  // `mode` has a value of 'DEVELOPMENT' or 'PRODUCTION'
  // You can change the configuration based on that.
  // 'PRODUCTION' is used when building the static version of storybook.

  config.module.rules.push({
    test: /\.(js|jsx)$/,
    exclude: [/node_modules/, /coverage/],
    use: 'babel-loader',
  });

  config.module.rules.push({
    test: /\.s?css$/,
    exclude: [/coverage/],
    use: [
      { loader: 'style-loader' },
      {
        loader: 'css-loader',
        options: { importLoaders: 2 },
      },
      {
        loader: 'postcss-loader',
        options: {
          plugins: () => [
            require('autoprefixer')({
              browsers: ['last 1 version', 'ie >= 11'],
            }),
          ],
        },
      },
      {
        loader: 'sass-loader',
        options: {
          includePaths: [path.resolve(__dirname, '..', 'node_modules')],
        },
      },
    ],
  });

  config.module.rules.push({
    test: /\.(png|jpe?g|gif)$/,
    use: [
      {
        loader: 'file-loader',
        options: {},
      },
    ],
  });

  config.module.rules.push({
    test: /\.(stories|story)\.[tj]sx?$/,
    loader: require.resolve('@storybook/source-loader'),
    exclude: [/node_modules/],
    enforce: 'pre',
  });

  // Return the altered config
  return config;
};
