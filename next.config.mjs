import path from "node:path";

const baseUiEsmAliases = {
  "@base-ui/react/avatar": path.resolve(
    "./node_modules/@base-ui/react/esm/avatar/index.js"
  ),
  "@base-ui/react/button": path.resolve(
    "./node_modules/@base-ui/react/esm/button/index.js"
  ),
  "@base-ui/react/dialog": path.resolve(
    "./node_modules/@base-ui/react/esm/dialog/index.js"
  ),
  "@base-ui/react/input": path.resolve(
    "./node_modules/@base-ui/react/esm/input/index.js"
  ),
  "@base-ui/react/menu": path.resolve(
    "./node_modules/@base-ui/react/esm/menu/index.js"
  ),
  "@base-ui/react/merge-props": path.resolve(
    "./node_modules/@base-ui/react/esm/merge-props/index.js"
  ),
  "@base-ui/react/select": path.resolve(
    "./node_modules/@base-ui/react/esm/select/index.js"
  ),
  "@base-ui/react/separator": path.resolve(
    "./node_modules/@base-ui/react/esm/separator/index.js"
  ),
  "@base-ui/react/tabs": path.resolve(
    "./node_modules/@base-ui/react/esm/tabs/index.js"
  ),
  "@base-ui/react/use-render": path.resolve(
    "./node_modules/@base-ui/react/esm/use-render/index.js"
  ),
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      ...baseUiEsmAliases,
    };

    return config;
  },
};

export default nextConfig;
