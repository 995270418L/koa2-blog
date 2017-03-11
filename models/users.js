/**
 * 用户模块(crud)
 */
const User = require('../lib/mongo').User;

module.exports = {
    create : function create(user){
        return User.create(user).exec();
    },
    getUserByName: function getUserByName(name){
        return User.findOne({name:name})
                   .addCreatedAt()  //自定义插件(通过_id生成时间戳)
                   .exec();
    }   
};

