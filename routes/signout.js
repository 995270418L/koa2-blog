//处理所有以 '/signout' 开头的请求
const koaRouter = require('koa-router');
const checkLogin = require('../middlewares/check').checkLogin;

const router = new koaRouter({
    prefix: '/signout'
});

//GET /signout 登出
router.get('/',checkLogin,async (ctx,next) =>{
    //清空session信息
    ctx.session.user  =null;
    ctx.flash('success','登出成功');
    ctx.redirect('/posts');
});

module.exports = router;