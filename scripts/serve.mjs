import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("public");
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".json": "application/json",
};

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const requested = pathname === "/" ? "/index.html" : pathname;
  const file = path.resolve(root, `.${requested}`);
  if (!file.startsWith(root)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  fs.stat(file, (statError, stat) => {
    if (statError || !stat.isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": "no-store",
    });
    fs.createReadStream(file).pipe(response);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`Portfolio preview: http://127.0.0.1:${port}/`);
});
