let marked = require('marked');
let _Comment = require('../lib/mongo').Comment;

//将comment的Content 从 markdown 转换成html
_Comment.plugin('contentToHtml',{
    afterFind: function(comments){
        return comments.map(function(comment){
            comment.content = marked(comment.content);
            return comment;
        });
    },
    afterFindOne: function(comment){
        if(comment){
            comment.content = marked(comment.content);
        }
        return comment;
    }
});

module.exports = {
    
    //创建留言
    create : function create(comment){
        return _Comment
                .create(comment)
                .exec();
    },
    
    //通过用户id 和留言id　删除一个留言
    delCommentById : function delCommentById(commentId,author){
        return _Comment.remove({author:author,_id:commentId}).exec();
    },
    
    //通过文章id 删除该文章下所有留言
    delCommentsByPostId : function delCommentsByPostId(postId){
        return _Comment.remove({postId: postId}).exec();
    },

    //通过文章id 获取该文章下所有留言，按留言创建时间排序
    getComments : function getComments(postId){
        return _Comment.find({postId: postId})
                       .populate({path:'author',model:'User'})
                       .sort({_id: 1})
                       .addCreatedAt()
                       .contentToHtml()
                       .exec();
    },

    //通过文章id获取该文章下留言数
    getCommentsCount: function getCommentsCount(postId){
        return _Comment.count({postId : postId}).exec();
    }

}