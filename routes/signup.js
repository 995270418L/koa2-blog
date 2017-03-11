//处理所有以　'/signup'　开头的请求

const koaRouter = require('koa-router');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');  //加密模块
const checkNotLogin = require('../middlewares/check').checkNotLogin;
const userModel = require('../models/users');
// const formidable = require('koa-formidable');
const multer = require('koa-multer');
// const util = require('util');
let router = new koaRouter({
    prefix: '/signup'
});

const upload = multer({
    dest: path.join(__dirname,"../public/img")
});

function encrypt(plainPassword,method){
    const hash = crypto.createHash(method);
    hash.update(plainPassword);
    return hash.digest('hex');
};

//GET /signup 注册页
router.get('/',checkNotLogin,async(ctx,next)=> {
    await ctx.render('signup',{title:'signup'});
});
//POST /signup 用户注册
router.post('/',checkNotLogin,upload.single('avatar'),async(ctx,next) =>{
    let req = ctx.req;
    let name = req.body.name;
    let gender = req.body.gender;
    let bio = req.body.bio;
    let avatar;
    let password = req.body.password;
    let repassword = req.body.repassword;

    try{
        if(!(name.trim().length) >= 1 && name.trim().length <= 10){
            ctx.flash('error','名字长度为1-10');          
        }
        if(['m','f','x'].indexOf(gender) === -1){
            ctx.flash('error','性别不对');
        }
        if(!(bio.trim().length >= 1 && bio.trim().length <= 30)){
            ctx.flash('error','简介不能超过30个字符');
        }
        if(!ctx.req.file.originalname){
            ctx.flash('error','需要上传头像');
        }
        if(password.length < 6){
            ctx.flash('error','密码长度必须大于6');
        }
        if(password !== repassword){
            ctx.flash('error','两次密码不同');
        }
        avatar = req.file.path.split('/').pop(); //返回文件的名字
    }catch(e){
        //注册失败，异步删除以上传的图片
        fs.unlink(ctx.req.file.path);
        //往session里面加入一条错误消息
        ctx.flash('error',e.message);
        return ctx.redirect('/signup');
    }
    //密码明文加密
    password = encrypt(password,'sha256');

    //待写入数据库信息
    let user = {
        name: name,
        password: password,
        gender: gender,
        bio: bio,
        avatar: avatar  //保存的是文件的名字
    };

    console.log(user);

    //将用户信息写入数据库
    try{
        let create = await userModel.create(user);
        user = create.ops[0];
        user.password = null;
        ctx.session.user = user;
        //写入flash消息
        ctx.flash('success','注册成功');
    }catch(e){
        //删除上传的文件
        fs.unlink(ctx.req.file.path);
        if(e.errmsg.match('E11000 duplicate key')){
            ctx.flash('error','用户名已被占用');
            return ctx.redirect('/signup');
        }
    }
    ctx.redirect('/posts');
});

module.exports = router;