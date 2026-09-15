import { cp, mkdir } from "node:fs/promises";

await mkdir("epoxy", { recursive: true });
await cp("node_modules/@mercuryworkshop/epoxy-transport/dist/index.js", "epoxy/index.js");