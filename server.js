/**
 *  AWEB Node.js Static Server
 *  version:6.0.0
 *  author:lijiancheng@agree.com.cn
 *  date:2018/12/21
 * 
 *  */


// Local Server Path
const LOCAL_PATH='./static';
const WELCOME_PAGE_PATH='index.html';
const PORT='3000';


// Dependences
const Koa = require('koa');
const serve= require('koa-static');
const proxyPass = require('@junyiz/koa-proxy-pass');
const router=require('koa-router')();
const koaBody = require('koa-body');
const httpRequest=require('request');
const fs = require('fs.promised');
const cors = require('koa-cors');
const main=serve(LOCAL_PATH);

router.get('/',async (ctx,next)=> {
	ctx.response.type = 'html';
	ctx.response.body = await fs.readFile(LOCAL_PATH + WELCOME_PAGE_PATH, 'utf8');
});

//app
const app=new Koa();
app.use(cors());

//parser
app.use(koaBody());

//setting routers
app.use(main);

app.use(router.routes());

app.listen(PORT);