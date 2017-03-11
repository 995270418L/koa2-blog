//获取所有路由
const fs = require('fs');
const path = require('path');
const koaRouter = require('koa-router');
const router = new koaRouter();
//路由管理文件(处理一类请求)
fs
    .readdirSync(__dirname)
    .filter(file => (file.indexOf('.') !==0) && (file.split('.').slice(-1)[0] === 'js') && file !== 'index.js')
    .forEach(file => {
        const route = require(path.join(__dirname,file));
        router.use(route.routes(),route.allowedMethods());
    });
    
router.get('/', async (ctx,next) => {
    ctx.redirect('/posts');
});

module.exports = router;