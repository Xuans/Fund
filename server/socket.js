const util = require('util');
const client = require('socket.io-client');
const socket = require('socket.io');
const colors = require('colors');
const httpProxy = require('http-proxy');

let proxy;



module.exports = {
    proxy(req, res) {
        proxy.web(req, res);
    },
    start(server, port) {

        const io = socket(server);

        io.on('connection', ins => {
            console.log('初始化成功！下面可以用socket绑定事件和触发事件了');

            
            //const remote = socket('wss://sshibiocbo.jin10.com:8082/socket.io/?EIO=3&transport=websocket&sid=aYiPZwo79aGiCcWLUAiE');

            // remote.on('connect', () => {
            // 	ins.emit('getMsg', 'success');
            // })

            ins.on('send', data => {
                console.log('客户端发送的内容：', data);
                ins.emit('message', '我是返回的消息... ...');
            })

            setTimeout(() => {
                ins.emit('message', '我是初始化3s后的返回消息... ...')
            }, 3000)
        });

        proxy = new httpProxy.createProxyServer({
            target: {
                host: 'sshibiocbo.jin10.com',
                port: 8082
            },
            headers:{
                host:'sshibiocbo.jin10.com:8082',
                Origin:'https://www.jin10.com'
            }
        });
        console.log(proxy);

        server.on('upgrade', function (req, socket, head) {
            debugger;
            setTimeout(function () {
                proxy.ws(req, socket, head);
            }, 1000);
        });
        global.server=server;

        try{
            var ws = client.connect('wss://sshibiocbo.jin10.com:8082/');

            ws.on('message', function (msg) {
                util.debug('Got message: ' + msg);
                ws.send('I am the client');
            });
            ws.on('price list', data => {
                console.log('服务端消息：', data);
            });

            ws.on('connect', function(response){
                debugger;
            });
            ws.on('event', function(data){
                debugger;
            });
            ws.on('reconnect_error', function(data){
                debugger;
            });
             ws.on('connect_error', function(data){
                debugger;
            });
            ws.on('disconnect', function(response){
                debugger;
            });
            ws.on('error', function(response){
                debugger;
            });
            ws.on('close', function(response){
                debugger;
            });

            global.ws=ws;
            global.client=client;
            console.log(ws);
        }catch(e){
            console.log(e);
            debugger;
        }
    }
}