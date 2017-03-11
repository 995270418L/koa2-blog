
//给每个路由都使用这个middleware检查用户权限

module.exports = {
    checkLogin : async (ctx,next) =>{
        if(!ctx.session.user){
            //将验证消息添加到redis message(flash-message)
            ctx.flash('error',"未登录");
            //请求重定向
            return ctx.redirect('/signin');
        }
        await next();
    },
    checkNotLogin: async (ctx,next)=>{
        if(ctx.session.user){
            ctx.flash('success',"已登录");
            return ctx.redirect('back');  //返回之前的页面  
        }
        await next();
    }
};