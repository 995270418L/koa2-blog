const path = require('path');
const assert = require('assert');
const request = require('supertest');
const app = require('../index');  //没导出?
const User = require('../lib/mongo').User;

let testname1 = 'testName1';
let testname2 = 'floder';

describe('signup',function(){
    describe('POST /signup',function(){
        let agent = request.agent(app);  //persist cookie when redirect
        beforeEach(function (done){
            User.create({
                name:testname1,
                password:'123456',
                avatar:'',
                gender: 'x',
                bio: ''
            }).exec()
              .then(function(){
                  done();
              })
              .catch(done);
        });
        afterEach(function(done){
            //删除测试用户
            User.remove({name: {$in: [testname1,testname2]}})
                .exec()
                .then(function(){
                    done();
                })
                .catch(done);
        });

        //用户名错误的情况
        it('wrong name',function(done){
            agent
                .post('/signup')
                .type('form')
                .attach('avatar',path.join(__dirname,'avatar.jpg'))
                .field({name:''})
                .redirects()
                .end(function(err,res){
                    if(err) return done(err);
                    assert(res.text.match(/名字长度为1-10/));
                    done();
                });
        });

        // 用户名被占用的情况
        it('duplicate name', function(done) {
            agent
                .post('/signup')
                .type('form')
                .attach('avatar', path.join(__dirname, 'avatar.png'))
                .field({ name: testName1, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
                .redirects()
                .end(function(err, res) {
                if (err) return done(err);
                assert(res.text.match(/用户名已被占用/));
                done();
                });
        });

         // 注册成功的情况
        it('success', function(done) {
            agent
                .post('/signup')
                .type('form')
                .attach('avatar', path.join(__dirname, 'avatar.png'))
                .field({ name: testName2, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
                .redirects()
                .end(function(err, res) {
                if (err) return done(err);
                assert(res.text.match(/注册成功/));
                done();
                });
        });
    });
});



