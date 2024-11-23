// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const path = require("path");
const root = path.resolve(__dirname);
const threePackagePath = path.resolve(root, "node_modules/three");
const newConfig = {
  ...config,
  watchFolders: [root],
  resolver: {
    ...config.resolver,
    extraNodeModules: {
      three: threePackagePath,
    },
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === "DRACOLoader") {
        return {
          filePath: path.resolve(
            threePackagePath,
            "examples/jsm/loaders/DRACOLoader.js"
          ),
          type: "sourceFile",
        };
      }
      if (moduleName === "GLTFLoader") {
        return {
          filePath: path.resolve(
            threePackagePath,
            "examples/jsm/loaders/GLTFLoader.js"
          ),
          type: "sourceFile",
        };
      }
      if (moduleName === "RGBELoader") {
        return {
          filePath: path.resolve(
            threePackagePath,
            "examples/jsm/loaders/RGBELoader.js"
          ),
          type: "sourceFile",
        };
      }
      if (moduleName === "three") {
        return {
          filePath: path.resolve(threePackagePath, "build/three.webgpu.js"),
          type: "sourceFile",
        };
      }
      // Let Metro handle other modules
      return context.resolveRequest(context, moduleName, platform);
    },
  },
  transformer: {
    ...config.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
module.exports = newConfig;
