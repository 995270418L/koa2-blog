let config = {
    port: 3000,
    mongodb: 'mongodb://127.0.0.1:27017/f_blog',
    redis_host:'127.0.0.1',
    redis_port: 6379,
    redis_db:0,
    redis_password:'',
    ENV : 'development',
    blog_title: 'Koa2-blog',
    blog_description: '让我们一起，为梦想窒息!'
};
module.exports = config;
