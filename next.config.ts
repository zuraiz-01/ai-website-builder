import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 blocks cross-origin requests to dev resources by default
  // (it expects requests to come from `localhost`). The dev server may also
  // be reached via LAN IP (e.g. http://192.168.0.135:3000) or a tunnel
  // host, so we allowlist a permissive set of dev origins here. This is
  // a dev-only check; it has no effect in production.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "*.localhost",
    "192.168.*",
    "10.*",
    "172.16.*",
    "172.17.*",
    "172.18.*",
    "172.19.*",
    "172.20.*",
    "172.21.*",
    "172.22.*",
    "172.23.*",
    "172.24.*",
    "172.25.*",
    "172.26.*",
    "172.27.*",
    "172.28.*",
    "172.29.*",
    "172.30.*",
    "172.31.*",
    "*.local",
    "*.ngrok.io",
    "*.ngrok-free.app",
    "*.trycloudflare.com",
    "*.loca.lt",
  ],
};

export default nextConfig;
