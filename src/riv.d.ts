// Lets TypeScript import .riv files; Metro bundles them as assets (see metro.config.js).
declare module '*.riv' {
  const asset: number;
  export default asset;
}
