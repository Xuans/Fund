const http = require('http')
const server = http.createServer((req, res) =>{
  res.end('hello world');
}).listen(8080)
  server.on('upgrade', (req, client, head) => {
    const headers = _getProxyHeader(req.headers) //将客户端的websocket头和一些信息转发到真正的处理服务器上
    headers.hostname = 'localhost'//目标服务器
    headers.path = '/' 目标路径 
    headers.port = 6443
    const proxy = http.request(headers) //https可用https，headers中加入rejectUnauthorized=false忽略证书验证
    proxy.on('upgrade', (res, socket, head) => {
      client.write(_formatProxyResponse(res))//使用目标服务器头信息响应客户端
      client.pipe(socket)
      socket.pipe(client)
    })
    proxy.on('error', (error) => {
      client.write("Sorry, cant't connect to this container ")
      return
    })
    proxy.end()
    function _getProxyHeader(headers) {
      const keys = Object.getOwnPropertyNames(headers)
      const proxyHeader = { headers: {} }
      keys.forEach(key => {
        if (key.indexOf('sec') >= 0 || key === 'upgrade' || key === 'connection') {
          proxyHeader.headers[key] = headers[key]
          return
        }
        proxyHeader[key] = headers[key]
      })
      return proxyHeader
    }
    function _formatProxyResponse(res) {
      const headers = res.headers
      const keys = Object.getOwnPropertyNames(headers)
      let switchLine = '\r\n';
      let response = [`HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage}${switchLine}`]
      keys.forEach(key => {
        response.push(`${key}: ${headers[key]}${switchLine}`)
      })
      response.push(switchLine)
      return response.join('')
    }
  })