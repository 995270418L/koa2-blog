
/**
 * 与文章相关的操作
 */
let posts = require('../lib/mongo').Post;
let CommentModel = require('./comments');
const marked = require('marked');

//将post的content 从 markdown 转换成 html
posts.plugin('contentToHtml',{
    afterFind: function(posts){
        return posts.map(function (post){
            post.content = marked(post.content);
            return post;
        });
    },
    afterFindOne: function(post){
        if(post){
            post.content = marked(post.content);
        }
        return post;
    }
});

//给post添加留言数 commentsCount
posts.plugin('addCommentsCount',{
    afterFind: function(posts){
        return Promise.all(posts.map(function(post){
            return CommentModel.getCommentsCount(post._id).then(function (commentsCount){
                post.commentsCount = commentsCount;
                return post;
            });
        }));
    },
    afterFindOne: function(post){
        if(post){
            return CommentModel.getCommentsCount(post._id).then(function(count){
                post.commentsCount = count;
                return post;
            });
        }
        return post;
    }
});

module.exports = {
    //创建一篇文章
    create : function create(post){
        return posts.create(post).exec();
    },

    //通过文章id来获取文章
    getPostById: function getPostById(postId){
        return posts.findOne({_id:postId})
                    .populate({path:'author',model:'User'})  //联表查询(通过path,表是User)
                    .addCreatedAt()     //创建时间插件
                    .addCommentsCount()
                    .contentToHtml()    //markdown内容转化为html
                    .exec();
    },

    //按创建时间降序获取所有用户文章或者某个特定用户的所有文章
    getPosts : function getPosts(author){
        let query = {};
        //如果query为空,查询所有用户的文章，否则查询指定用户的文章
        if(query){
            query.author = author;
        }
        console.log(query);
        if(query.author === undefined){
            query = {};
        }
        return posts.find(query)
                    .populate({path:'author',model:'User'})
                    .sort({_id: -1})   //倒序
                    .addCreatedAt()
                    .addCommentsCount()
                    .contentToHtml()
                    .exec();
    },

    //通过文章id 给pv 加１
    incPv : function incPv(postId){
        return posts.update({_id:postId},{$inc:{pv: 1}})
                    .exec();
    },

    //通过文章id 获取一篇原生文章
    getRawPostById: function getRawPostById(postId){
        return posts.findOne({_id:postId})
                    .populate({path:'author',model:'User'})
                    .exec();
    },

    //通过用户id 和文章 id 更新一篇文章
    updatePostById: function updatePostById(postId,author,data){
        return posts.update({author:author,_id:postId},{$set: data}).exec();
    },

    //通过用户id和文章id删除一篇文章
    delPostById: function delPostById(postId,author){
        return posts.remove({author:author,_id:postId})
                    .exec()
                    .then(function (res){
                        //文章删除后，再删除该文章下的所有留言
                        if(res.result.ok && res.result.n > 0){
                            return CommentModel.delCommentsByPostId(postId);
                        }
                    });
    },

};
