const util = require('util');
const client = require('socket.io-client');
const socket = require('socket.io');
const https=require('https');
const colors = require('colors');
const httpProxy = require('http-proxy');

const _getProxyHeader=function _getProxyHeader(headers) {
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
};
const _formatProxyResponse=function _formatProxyResponse(res) {
    const headers = res.headers
    const keys = Object.getOwnPropertyNames(headers)
    let switchLine = '\r\n';
    let response = [`HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage}${switchLine}`]
    keys.forEach(key => {
      response.push(`${key}: ${headers[key]}${switchLine}`)
    })
    response.push(switchLine)
    return response.join('')
};


module.exports={
    start(server,port){
        // const io = socket(server);

        // io.on('connection', ins => {
        //     console.log('初始化成功！下面可以用socket绑定事件和触发事件了');

            
        //     //const remote = socket('wss://sshibiocbo.jin10.com:8082/socket.io/?EIO=3&transport=websocket&sid=aYiPZwo79aGiCcWLUAiE');

        //     // remote.on('connect', () => {
        //     // 	ins.emit('getMsg', 'success');
        //     // })

        //     ins.on('send', data => {
        //         console.log('客户端发送的内容：', data);
        //         ins.emit('message', '我是返回的消息... ...');
        //     })

        //     setTimeout(() => {
        //         ins.emit('message', '我是初始化3s后的返回消息... ...')
        //     }, 3000)
        // });
    },
    proxy(req,client,head){
        const headers=_getProxyHeader(req.headers);

        headers.host='sshcdhpjnb.jin10.com:8082';
        headers.origin='https://www.jin10.com';
        headers.rejectUnauthorized=false;

        const proxy=https.request(headers);

        proxy.on('upgrade',(res,socket,head)=>{
            client.write(_formatProxyResponse(res));
            client.pipe(socket);
            socket.pipe(client);
        });

        proxy.on('error',error=>{
            client.write(error.message);

            return;
        });

        proxy.end();

        debugger;
    }
}