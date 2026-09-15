# Scramjet HTML/JS Template (v2.0.67-alpha.1)

A [Scramjet](https://github.com/MercuryWorkshop/scramjet) web proxy: a URL bar and an
`<iframe>` that browses sites through Scramjet. The Scramjet and controller files are
already included, so you just serve the folder.

## What's in here

```
index.html              UI plus the ~40 lines of JS that wire up Scramjet
sw.js                   Service worker (loads the controller)
controller/             Scramjet controller bundle (vendored)
scramjet/
  scramjet.js           Scramjet runtime (vendored)
  scramjet.wasm         Rewriter WASM (vendored)
```

The folder paths matter. See [File layout](#file-layout) below.

## Running it

Scramjet uses a service worker, and browsers only allow those in a secure context,
meaning `https://` or `http://localhost`. Opening `index.html` directly off your
disk (`file://`) won't work, so you need to serve the folder.

This template includes an npm setup. From this folder, run:

```sh
npm install
npm start
```

The install copies Epoxy into `epoxy/index.js`, so the proxy's runtime assets are
served locally. The default Wisp endpoint is public and intended for demos; set
`window.WISP_URL` in `index.html` before `scramjet` initialization to use your own.

Use whatever static server you like:

```sh
bunx serve .                  # bun
python3 -m http.server 3000   # python
npx serve .                   # node
```

Open the URL it prints (something like http://localhost:3000) and type a site into
the bar.

The demo uses a public wisp server. Those get rate-limited and sometimes go down,
so run your own once you're doing anything serious (see step 3).

## How it works

There are three pieces, and `index.html` sets them up in order:

1. The runtime and controller (`scramjet/`, `controller/`), loaded as plain
   `<script>` tags. They register themselves on the global object.
2. A transport (Epoxy), which is the actual connection to a wisp server. The wisp
   server makes the real outbound requests for you.
3. A service worker (`sw.js`), which catches requests coming out of the `<iframe>`
   and hands them to the controller to rewrite and serve.

Here's the whole thing, trimmed down:

```js
const { Controller }    = $scramjetController;   // controller/controller.api.js
const { defaultConfig } = $scramjet;             // scramjet/scramjet.js
const EpoxyTransport    = self.EpoxyTransport.default;

await navigator.serviceWorker.ready;             // sw.js is active
const transport = new EpoxyTransport({ wisp: "wss://your-wisp-server/" });
await transport.init();

const scramjet = new Controller({ serviceworker, transport, scramjetConfig: defaultConfig });
await scramjet.wait();

const frame = scramjet.createFrame(iframe);
frame.go("https://example.com");
```

## Using it in your own app

`index.html` has `STEP 1` through `STEP 6` comments at each part. Short version:

**Step 1: load the libs as plain scripts.**

```html
<script src="/scramjet/scramjet.js"></script>
<script src="/controller/controller.api.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-transport@3.0.1/dist/index.js"></script>
```

Don't switch these to `type="module"` or `import`. The bundles put their API on
`window` through top-level `var`s, and that only reaches the global scope from a
classic script. As modules, the globals come back `undefined`.

**Step 2: grab the classes off the globals.**

```js
const { Controller }    = $scramjetController;
const { defaultConfig } = $scramjet;
const EpoxyTransport    = self.EpoxyTransport.default;
```

**Step 3: point at a wisp server.**

```js
const transport = new EpoxyTransport({ wisp: "wss://your-wisp-server/" });
```

You can run your own with
[wisp-server-node](https://github.com/MercuryWorkshop/wisp-server-node) or any
other wisp implementation. The public default is just for the demo.

**Steps 4 and 5: make the controller and a frame.**

```js
const scramjet = new Controller({ serviceworker, transport, scramjetConfig: defaultConfig });
await scramjet.wait();
const frame = scramjet.createFrame(myIframeElement);
frame.go("https://example.com");
```

**Step 6: register the service worker.**

```js
navigator.serviceWorker.register("/sw.js").then(init);
```

Serve `sw.js` from your site root so its scope covers the whole app.

## File layout

The controller config (inside `controller/controller.api.js`) expects these files
at your site root:

| Config key     | Default path                       |
| -------------- | ---------------------------------- |
| `scramjetPath` | `/scramjet/scramjet.js`            |
| `wasmPath`     | `/scramjet/scramjet.wasm`          |
| `injectPath`   | `/controller/controller.inject.js` |

The service worker grabs the WASM from `wasmPath` and feeds it into the proxy. If
`/scramjet/scramjet.wasm` 404s, you get `rewriter wasm does not have wasm magic`
errors. So keep `scramjet/` and `controller/` at the root, or change those config
paths if you put them somewhere else.

Your server should also send `.wasm` with the `application/wasm` content type. Most
do this already.

## Troubleshooting

| Symptom | What's going on |
| --- | --- |
| `Controller is not a constructor`, or globals are `undefined` | A library got loaded as a module. Use plain `<script>` tags. |
| `rewriter wasm does not have wasm magic (... 404)` | `/scramjet/scramjet.wasm` isn't being served. Check the folder layout. |
| `Failed to register a ServiceWorker` | You opened the page over `file://`. Serve it over localhost or https. |
| Old behaviour sticks around after edits | Unregister the SW in DevTools, Application, Service Workers, then hard refresh. |
| Pages time out or won't load | The wisp server is down or rate-limiting you. Use your own. |

## Updating Scramjet

Swap the vendored files for the version you want:

```sh
V=2.0.67-alpha.1
curl -o scramjet/scramjet.js   "https://cdn.jsdelivr.net/npm/@mercuryworkshop/scramjet@$V/dist/scramjet.js"
curl -o scramjet/scramjet.wasm "https://cdn.jsdelivr.net/npm/@mercuryworkshop/scramjet@$V/dist/scramjet.wasm"
# controller/ comes from @mercuryworkshop/scramjet-controller
```

Keep the controller and scramjet versions in sync. The controller checks the
runtime version at startup and throws if they don't match.
