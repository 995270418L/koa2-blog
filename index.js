//程序的入口
/**
 * module dependency
 */
const path = require('path'); 
const Koa = require('koa');
const session = require('koa-generic-session');
const redisStore = require('koa-redis');
const flash = require('koa-flash2');
const config = require('./config/default');
const router = require('./routes');
const server = require('koa-static');
const redis = require('redis');
const template = require('./template');
const parse = require('koa-bodyparser');
const logger = require('./logger');
const koaLogger = require('koa-logger-winston');
const isProduction = process.env.NODE_ENV === 'production';
const app = new Koa();

//设置静态文件目录
app.use(server(__dirname + '/public'));
//session中间件
let client = redis.createClient(config.redis_port,config.redis_host);
app.keys = ['keys','f_blog_keys'];

app.use(session({
    store: redisStore({
        // db:config.redis_db,
        client : client
    })
}));

//flash中间件,用来显示通知
app.use(flash());

app.use(parse());

console.log("isProduction: " + isProduction);

//整合nunjucks
app.use(template('views',{
    noCache : !isProduction,
    watch : !isProduction
}));

//添加模板所需的三个变量
app.use(async (ctx,next) => {

    Object.assign(ctx.state,{
        user : ctx.session.user,
        success : ctx.flash('success').toString(),
        error : ctx.flash('error').toString()
    });
    await next();
});

//正常请求的日志
app.use(koaLogger(logger.success));

//路由
app.use(router.routes());

//错误日志
app.use(koaLogger(logger.error));

//处理404error
app.use(async (ctx,next) => {
    if(ctx.status === 404){
        await ctx.render('404',{title: '404 Page'});
    }
    await next();
});

//处理500error页面
app.on('error',async (err,ctx) => {
	await ctx.render('error',{title:'系统错误',error:err});
});

//如果index.js　被require了,则导出app，通常用于测试
if(module.parent){
    module.exports = app;
}else{
    app.listen(config.port,function(){
        console.log(`f_blog listening on port ${config.port}`); 
    });
}
