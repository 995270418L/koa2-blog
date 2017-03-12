# koa2-blog
　该项目基于node-v7.7.1,mongodb v3.4.2,redis 3.2.8构建而成，最主要的是node的版本一定要支持async/await语法，否则只能使用babel了。
      
　　项目本地使用:
　　1. 开启mongod服务:  
 
  -> mongod --fork --logpath ~/data/log/mongodb.log --dbpath ~/data/db
  2.开启redis-server

  -> redis-server &
  3.运行项目:

  -> node index.js
   项目使用[redis](https://redis.io/)做session管理，[Koa2](http://koajs.com/)做系统框架，[mondogb](https://www.mongodb.com/cn)做储存，flash做消息中间件。具体请看[源代码](https://github.com/995270418L/koa2-blog/),注释都写的非常清楚。大家不懂的多查查文档就可以了,也可以留言一同解决，同时帮帮忙star一下。谢谢！
