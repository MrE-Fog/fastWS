fastWS Server
=====

[![npm](https://img.shields.io/npm/v/fast-ws-server.svg)](https://www.npmjs.com/package/fast-ws-server)
[![Node version](https://img.shields.io/node/v/fast-ws-server.svg)](https://www.npmjs.com/package/fast-ws-server)
[![GitHub Action](https://github.com/hans00/fastWS/workflows/build/badge.svg)](https://github.com/hans00/fastWS)

It's very fast Web Server Node.js server based on uWebSockets.

And very easy to use.

[Benchmark result](../../benchmark/README.md)

[Documents](../../docs/README.md)

---

# Usage

`npm i fast-ws-server`

```js
const fastWS = require('fast-ws-server')

const app = new fastWS({ /* options */ })

app.ws('/ws', ws => {
  console.log(`Connected ${ws.remoteAddress}`)

  ws.on('message', ({ data }) => {
    ws.sendMessage(data)
  })

  ws.on('echo', ({ reply, data }) => {
    reply(data)
  })
})

app.post('/post', async (req, res) => {
  const data = await req.body()
  res.json(data)
})

app.get('/hello/:name', async (req, res, params) => {
  res.render([
    '<html>',
    '<head><title>Hello</title></head>',
    '<body><h1>Hello, ${escapeHTML(name)}</h1></body>',
    '</html>'
  ].join(''), params)
})

app.get('/hello/:name/alert', async (req, res, params) => {
  res.render([
    '<html>',
    '<head><title>Hello</title></head>',
    '<body><script>alert("Hello, ${escapeVar(name, String)}")</script></body>',
    '</html>'
  ].join(''), params)
})

app.serve('/*') // auto serve project /static/*

app.listen(3000, () => {
  console.log('Listen on 3000')
})
```

# Feature

- [x] Simple to use
- [x] Serve static files
- [x] Simple WebSocket Framework
- [x] Reload SSL when system signal HUP(1)
- [x] Graceful shutdown
- [x] Parse body data
- [x] URL params parser
- [x] Support for template engine
- [x] Response from pipe stream
- [x] Support cache
- [ ] Support for Socket.io
- [ ] Support for TypeScript
- [ ] Sub-route likes Express.js
