export default {
  presets: [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "usage",
        corejs: "3",
      },
    ],
  ],
  plugins: ["transform-remove-console"]
};
