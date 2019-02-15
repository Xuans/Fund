/**
 *  AWEB Node.js Static Server
 *  version:6.0.0
 *  author:lijiancheng@agree.com.cn
 *  date:2018/12/21
 * 
 *  */


// Local Server Path
const LOCAL_PATH = './';
const WELCOME_PAGE_PATH = 'index.html';
const PORT = '3000';


// Dependences
const Koa = require('koa');
const serve = require('koa-static');
const proxy = require('@junyiz/koa-proxy-pass');
const router = require('koa-router')();
const koaBody = require('koa-body');
const httpRequest = require('request');
const fs = require('fs.promised');
const cors = require('koa-cors');
const path = require('path');
const main = serve(LOCAL_PATH);

//methods
// 递归创建目录 同步方法
const mkdir = (dirname) => {

	let list = [];
	let parent;

	list.push(dirname);
	while (
		(parent = path.dirname(list[list.length - 1])) !== list[list.length - 1]
		&& parent
	) {
		list.push(parent);
	}

	list.reverse().forEach(p => {
		if (!fs.existsSync(p)) {
			fs.mkdirSync(p);
		}
	});
}

//router
router.get('/', async (ctx, next) => {
	ctx.response.type = 'html';
	ctx.response.body = await fs.readFile(LOCAL_PATH + WELCOME_PAGE_PATH, 'utf8');
});
//uploadImg
router.post('/uploadImg', async (ctx, next) => {
	const date = new Date();
	const tmpdir = `${__dirname}/assets/img/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
	const filePaths = [];
	const files = ctx.request.files || ctx.files.body || {};

	mkdir(tmpdir);

	for (let key in files) {
		if (files.hasOwnProperty(key)) {
			const file = files[key];

			const filePath = path.join(
				tmpdir,
				file.name
					.replace(/^.*(\.[a-z0-9A-Z]{1,})$/, Math.ceil(Math.random() * 1e7) + '$1'));

			const reader = fs.createReadStream(file.path);
			const writer = fs.createWriteStream(filePath);
			reader.pipe(writer);
			filePaths.push(filePath);
		}
	}

	ctx.response.redirect(filePaths[0].replace(__dirname, ''));
	// ctx.response.type = 'image';
	// ctx.response.body = await fs.readFile(filePaths[0]);
	// ctx.type = 'json';
	// ctx.body = JSON.stringify({
	// 	path: filePaths
	// });
});

//app
const app = new Koa();
app.use(cors());

//proxy
app.use(proxy({
	host: 'wss://sshibiocbo.jin10.com:8082/socket.io',
	match: /aaaa/
}));

//parser
app.use(koaBody({ multipart: true }));

app.use(main);

app.use(router.routes());
//app.listen(PORT);

const socket = require('socket.io');
const server = require('http').createServer(app.callback());
const io = socket(server);
io.on('connection', ins => {
	console.log('初始化成功！下面可以用socket绑定事件和触发事件了');

	debugger;
	const remote = socket('wss://sshibiocbo.jin10.com:8082/socket.io/?EIO=3&transport=websocket&sid=aYiPZwo79aGiCcWLUAiE');

	remote.on('connect', () => {
		ins.emit('getMsg', 'success');
	})

	ins.on('send', data => {
		console.log('客户端发送的内容：', data);
		ins.emit('getMsg', '我是返回的消息... ...');
	})

	setTimeout(() => {
		ins.emit('getMsg', '我是初始化3s后的返回消息... ...')
	}, 3000)
});
server.listen(PORT);
