var express = require('express');
var router = express.Router();
const config = require('../config/index.json'); // 配置数据

// 微信配置

var request = require('request');
const crypto = require('crypto'); // node内置的加密模块
import {
  getAccessToken
} from '../util/accessToken'


function sha1(str) {
  let shasum = crypto.createHash("sha1");
  return shasum.update(str, 'utf-8').digest("hex");
}

router.get('/getAccessToken', (req, res) => {
  getAccessToken().then(token => {
    console.log(token, 'tokenkkk')
  })
});

router.get('/token', (req, res) => {
  let signature = req.query.signature;
  let echostr = req.query.echostr;
  let timestamp = req.query.timestamp;
  let nonce = req.query.nonce;
  let reqArray = [nonce, timestamp, '1'];
  reqArray.sort(); //对数组进行字典排序
  let sortStr = reqArray.join(''); //连接数组
  let sha1Str = sha1(sortStr.toString().replace(/,/g, ""));
  if (signature === sha1Str) {
    res.end(echostr);
  } else {
    res.end("false");
    console.log("授权失败!");
  }
});
router.get('/getCode', (req, res) => {
  let AppID = config.appid
  var return_uri = encodeURIComponent('http://192.168.10.103:8081/malasong/index.html')
  var scoped = 'snsapi_userinfo'
  var state = '123'
  console.log('进入跳转', 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + AppID + '&redirect_uri=' + return_uri + '&response_type=code&scope=' + scoped + '&state=' + state + '#wechat_redirect')
  res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + AppID + '&redirect_uri=' + return_uri + '&response_type=code&scope=' + scoped + '&state=' + state + '#wechat_redirect')
})
router.get('/getAccessToken', function (req, res) {
  let AppID = config.appid;
  let AppSecret = config.appsecret;
  let code = req.query.code;
  request.get({
      url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + AppID + '&secret=' + AppSecret + '&code=' + code + '&grant_type=authorization_code'
    }, // 请求获取令牌
    function (error, response, body) {
      if (response.statusCode == 200) {
        let data = JSON.parse(body)
        let access_token = data.access_token;
        let openid = data.openid;
        request.get({
            url: 'https://api.weixin.qq.com/sns/userinfo?access_token=' + access_token + '&openid=' + openid + '&lang=zh_CN'
          }, // 调用获取用户信息的api
          (error, response, body) => {
            var userinfo = JSON.parse(body);
            res.send({
              code: 0,
              data: userinfo,
              message: ''
            });
          }
        )
      }
    }
  )
})
export default router;