//初始化nunjucks
const views = require('koa-nunjucks-next');
const config = require('./config/default');

function template(path,opts){
    let autoescape = opts.autoescape || true;  //是否编译输出
    let watch = opts.watch || false;    //是否映射模板更改
    let noCache = opts.noCache || false;   //默认需要缓存
    // let globals = opts.globals; 
    // console.log(globals);
    return views(path,{
        autoescape:autoescape,
        watch:watch,
        noCache:noCache,
        globals :{
            blog_title: config.blog_title,
            blog_description : config.blog_description
        },
        filters: {
            asyncAdd: (val1, val2) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => resolve(val1 + val2), 2000);
            });
            },
            syncAdd: (val1, val2) => {
                return val1 + val2;
            }
        }
    });
};

//输出整合好的模板
module.exports =  template;

