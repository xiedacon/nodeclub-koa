# nodeclub-koa

[![Build Status](https://travis-ci.org/xiedacon/nodeclub-koa.svg?branch=master)](https://travis-ci.org/xiedacon/nodeclub-koa)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![codecov](https://codecov.io/gh/xiedacon/nodeclub-koa/branch/master/graph/badge.svg)](https://codecov.io/gh/xiedacon/nodeclub-koa)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/xiedacon/nodeclub-koa/blob/master/LICENSE)

使用koa2重写的nodeclub

### 使用

```
1. git clone https://github.com/xiedacon/nodeclub-koa.git
2. cd nodeclub-koa
3. npm install
4. docker-compose up
5. npm start
6. visit http://localhost:3000
7. done!
```

### 中间件

##### 主要

* koa
* koa-bodyparser ==> ctx.request.body
* koa-session2 ==> ctx.session
* koa-router ==> 路由
* static中间件 ==> 自己写的，主要是为了加载less解析，具有压缩功能
* render中间件 ==> ctx[.response].render，自己写的，只做了简单的模板引擎适配
* 模板引擎 ==> 由 [art-template 3.1](https://github.com/aui/art-template/tree/3.1.0) 修改而来，与 [主版本](https://github.com/aui/art-template) 语法相差太大，以后升级 [TODO](#TODO)
* busboy ==> ctx.busboy
* bluebird ==> global.Promise
* log4js ==> 全局logger
* redis ==> cache
* mongoose ==> db
* config-lite ==> 根据环境加载config
* resolve-path ==> static中间件依赖

##### 功能性中间件

* bcrypjs ==> password加密
* uuid ==> accessToken
* koa-csrf ==> csrf攻击防范
* koa-helmet ==> header
* koa-passport ==> github第三方登录
* passport-github

##### 其它

* validator
* bytes
* colors
* moment
* multiline ==> 用于解决 ` 处理不了的文本
* koa-mount
* data2xml
* xmlbuilder

##### 测试

* standard ==> 代码格式
* codecov ==> 测试覆盖率
* istanbul ==> 测试覆盖率
* mocha 
* power-assert
* supertest
* mm ==> mock测试
* rewire ==> 私有方法测试

### TODO

* [ ] 升级为 [art-template@4](https://github.com/aui/art-template)
* [x] 集成测试和测试覆盖率
* [x] 重构
* [ ] 尝试将busboy中间件改为Promise的形式
* [ ] 尝试将controller跟schema合为一层，形成

  ```
  - controller
    - topic.js
    - topic.schema.js

  或

  - controller
    - topic
      - _id.js
      - _id.schema.js
  ```

### 协议

[MIT](https://github.com/xiedacon/nodeclub-koa/blob/master/LICENSE)
