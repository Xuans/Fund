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
const os = require('os');
const Koa = require('koa');
const serve = require('koa-static');
const proxyPass = require('@junyiz/koa-proxy-pass');
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
		(parent = path.dirname(list[list.length - 1]))!==list[list.length - 1]
		&& parent
	) {
		list.push(parent);
	}

	list.reverse().forEach(p=>{
		if(!fs.existsSync(p)){
			fs.mkdirSync(p);
		}
	});
}

//router
router.get('/', async (ctx, next) => {
	ctx.response.type = 'html';
	ctx.response.body = await fs.readFile(LOCAL_PATH + WELCOME_PAGE_PATH, 'utf8');
});

router.post('/uploadImg', async (ctx, next) => {
	const date=new Date();
	const tmpdir = `${__dirname}/assets/img/${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`;
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

	ctx.response.redirect(filePaths[0].replace(__dirname,''));
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

//parser
app.use(koaBody({ multipart: true }));

//websocket
//const wsProxy = proxy('wss://stats-node3.jin10.com:8001/', { changeOrigin: true })

//app.use(wsProxy)

//setting routers
app.use(main);

app.use(router.routes());

const server = app.listen(PORT);

//server.on('upgrade', wsProxy.upgrade) // <-- subscribe to http 'upgrade'