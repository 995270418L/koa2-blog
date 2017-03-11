//处理所有登录开始的请求

const koaRouter = require('koa-router');
let checkNotLogin = require('../middlewares/check').checkNotLogin;
const crypto = require('crypto');
const userModel = require('../models/users');

const router = new koaRouter({
    prefix: '/signin'
});

//验证密码
function auth(plainPassword,encryPassword){
    let hash = crypto.createHash('sha256');
    hash.update(plainPassword);
    return hash.digest('hex') === encryPassword ;
}
//GET /signin 登录页
router.get('/',checkNotLogin,async(ctx,next) => {
   await ctx.render('signin',{title: '用户登录'});
});

//POST /signin 用户登录
router.post('/',checkNotLogin,async(ctx,next) => {
    let name = ctx.request.body.name;
    let password = ctx.request.body.password;
    console.log("name: " + name + " ; " + "password: " + password);

    //根据用户名从mongodb找寻用户
    let user = await userModel.getUserByName(name);
    if(!user){
        console.log('user not exist');
        ctx.flash('error','用户不存在');
        return ctx.redirect('back');
    }
     console.log('user exists');

     if(!auth(password,user.password)){
         console.log('username or password is not right');
         ctx.flash('error','用户名或者密码错误');
         return ctx.redirect('back');
     }

     ctx.flash('success','登录成功');

     user.password = null;

     ctx.session.user = user;

     ctx.redirect('/posts');
});

module.exports = router;