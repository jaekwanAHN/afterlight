import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1"],
  // Keep strict build checks on the TypeScript 5 compiler API. The newer CLI
  // capture path fails to parse --showConfig in this development environment.
  experimental: { useTypeScriptCli: false },
};
export default config;
