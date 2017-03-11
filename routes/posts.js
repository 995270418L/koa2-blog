//处理所有以/post/开始的请求

const koaRouter = require('koa-router');
const checkLogin = require('../middlewares/check').checkLogin;
const postModel = require('../models/posts');
const commentModel = require('../models/comments');

//设定路由前缀
const router = new koaRouter({
    prefix: '/posts'
});

//GET /posts　所有用户或者特定用户的文章页
router.get('/', async (ctx,next) => {
    console.log('所有用户或者特定用户的文章页');
    let author = ctx.query.author;
    let posts = await postModel.getPosts(author);
    console.log(posts);
    try {
        await ctx.render('posts', {title: '首页',posts: posts});
    }catch(e){
        console.log(e.message);
    }
});

//GET /posts/create 发表文章页
router.get('/create',checkLogin,async (ctx,next) => {
    console.log('发表文章页');
    await ctx.render('create',{title: '写文章'});
});

//POST /posts 发表一篇文章
router.post('/',checkLogin,async (ctx,next) => {
    console.log('发表一篇文章');
    let author = ctx.session.user._id;
    let title = ctx.request.body.title;
    let content = ctx.request.body.content;

    //校检参数
    try{
        console.log('校检参数');
        if(!title.length){
            throw new Error('请填写标题');
        }
        if(!content.length){
            throw new Error('请填写内容');
        }
    }catch(e){
        console.log('校检参数出错');
        ctx.flash('error',e.message);
        return ctx.redirect('back');
    }

    let post = {
        author : author,
        title : title,
        content : content,
        pv: 0  //点击量
    };

    try{
        console.log('post data to mongodb');
        let result = await postModel.create(post);
        //result是插入mongodb后的值，包含_id;
        post = result.ops[0];
        ctx.flash('success','发表成功');
        ctx.redirect(`/posts/${post._id}`);
    }catch(e){
        //handler error
        console.log('post error : ' + e.message);
    }

});

//GET /posts/:postId  单独一篇文章页
router.get('/:postId',async (ctx,next) => {
    console.log('单独一篇文章页');
    let postId = ctx.params.postId;
  
    try{
        let result = await Promise.all([postModel.getPostById(postId),postModel.incPv(postId),commentModel.getComments(postId)]);
        let post = result[0];
        let comments = result[2];
        console.log(comments);
        if(!post){
            throw new Error('该文章不存在');
        }
        await ctx.render('post',{item : post , comments : comments , title: post.title});
    }catch(e){
        console.log(e.message);
    }
});

//GET /posts/:postId/edit 更新文章页 
router.get('/:postId/edit',checkLogin,async (ctx,next) => {
    console.log('更新文章页');
   let postId = ctx.params.postId;
   let author = ctx.session.user._id;

   try{
       let post = await postModel.getRawPostById(postId,author);
       if(!post){
           throw new Error('该文章不存在');
       }
       if(author.toString() !== post.author._id.toString()){
           throw new Error('权限不足');
       }
       await ctx.render('edit',{
           post: post,
           title:'编辑文章'
       });
   }catch(e){
       console.log(e.message);
   }

}) ;

//POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit',checkLogin,async (ctx,next) => {
   console.log('更新一篇文章');
   let postId = ctx.params.postId;
   let author = ctx.session.user._id;
   let title = ctx.request.body.title;
   let content = ctx.request.body.content;
   try{
       await postModel.updatePostById(postId,author,{title: title,content: content}); 
       ctx.flash('success','更新成功');
       ctx.redirect(`/posts/${postId}`);
   }catch(e){
       console.log(e.message);
   }
});

//DEL /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove',checkLogin,async (ctx,next) => {
    console.log('删除一篇文章');
    let postId = ctx.params.postId;
    let author = ctx.session.user._id;

    try{ 
        await postModel.delPostById(postId,author);
        ctx.flash('success','删除文章成功');
        //转到主页
        ctx.redirect('/posts');
    }catch(e){
        console.log(e.message);
    }
});

//POST /posts/:postId/comment  创建一条留言
router.post('/:postId/comment',checkLogin,async (ctx,next) => {
    console.log('创建一条留言');
    let author = ctx.session.user._id;
   let postId = ctx.params.postId;
   let content = ctx.request.body.content;
   let comment = {
       author: author,
       postId: postId,
       content: content
   };
    try{
        let result = await commentModel.create(comment);
        ctx.flash('success','留言成功');
        ctx.redirect('back');
    }catch(e){
        console.log(e.message);
    }
});

//DELETE  /posts/:postId/comment/:commentId/remove 删除一条留言
router.get('/:postId/comment/:commentId/remove',checkLogin,async (ctx,next) => {
    console.log('删除一条留言');
    let commentId = ctx.params.commentId;
    let author = ctx.session.user._id;
    try{
        await commentModel.delCommentById(commentId,author);
        //删除成功后跳转到上一页
        ctx.redirect('back');
    }catch(e){
        console.log(e.message);
    }
});

//输出
module.exports = router;
