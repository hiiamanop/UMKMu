// Proxy kecil: Tailscale → proxy (port 11435) → Ollama (port 11434)
// Tujuan: rewrite Host header supaya Ollama tidak reject request eksternal
const http = require('http')

const server = http.createServer((clientReq, clientRes) => {
  const chunks = []
  clientReq.on('data', chunk => chunks.push(chunk))
  clientReq.on('end', () => {
    const body = Buffer.concat(chunks)

    const options = {
      hostname: '127.0.0.1',
      port: 11434,
      path: clientReq.url,
      method: clientReq.method,
      headers: {
        'host': 'localhost',                                          // kunci: override host
        'content-type': clientReq.headers['content-type'] ?? 'application/json',
        'content-length': body.length,
      },
    }

    const proxy = http.request(options, (proxyRes) => {
      clientRes.writeHead(proxyRes.statusCode, proxyRes.headers)
      proxyRes.pipe(clientRes)
    })

    proxy.on('error', err => {
      console.error('[proxy] error:', err.message)
      clientRes.writeHead(502)
      clientRes.end('Proxy error: ' + err.message)
    })

    proxy.write(body)
    proxy.end()

    console.log(`[proxy] ${clientReq.method} ${clientReq.url} → ollama:11434`)
  })
})

server.listen(11435, '0.0.0.0', () => {
  console.log('[proxy] listening on :11435 → forwarding to localhost:11434')
})
