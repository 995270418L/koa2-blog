/**
 * mongo连接以及输出Schema模型
 */

const config = require('../config/default');
const Mongolass = require('mongolass');
const moment = require('moment');
const objectIdToTimestamp = require('objectid-to-timestamp');
const mongolass = new Mongolass(config.mongodb);

//根据id生成创建时间 created_at
mongolass.plugin('addCreatedAt',{
    afterFind: function (results){
        results.forEach(item => item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm'));
        return results;
    },
    afterFindOne: function(result){
        if(result){
            result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
        }
        return result;
    }
});

let User = mongolass.model('user',{
    name: {type: 'string'},
    password: {type : 'string'},
    avatar: {type:'string'},
    gender:{type:'string',enum:['m','f','x']},
    bio:{type:'string'}  //个人简介
});

User.index({name:1},{unique: true}).exec(); //name建立索引
 
let Post = mongolass.model('Post',{
    author: {type: Mongolass.Types.ObjectId},
    title:{type: 'string'},
    content: {type: 'string'},
    pv: {type:'number'} //点击量
});

Post.index({author:-1,_id: -1}).exec(); //按创建时间降序查看用户文章列表

let Comments = mongolass.model('Comment',{
    author: {type: Mongolass.Types.ObjectId},
    content: { type: 'string'},
    postId: {type: Mongolass.Types.ObjectId}
});

Comments.index({postId: 1, _id: 1}).exec();  //通过文章id 获取该文章下所有留言
Comments.index({author: 1,_id: 1}).exec();   //通过用户id和留言id 删除一个留言

module.exports = {
    User : User,
    Post : Post,
    Comment: Comments
};


