var express = require('express');
var router = express.Router();
const config = require('../config/index.json'); // 配置数据
const axios = require('axios'); // 请求api

// 微信配置

var request = require('request');
const crypto = require('crypto'); // node内置的加密模块
import getAccessToken from '../util/accessToken'
import get_jsapi_ticket from '../util/jsapiTicket'


function sha1(str) {
  let shasum = crypto.createHash("sha1");
  return shasum.update(str, 'utf-8').digest("hex");
}

function getSignature(param) {
  let sha1 = crypto.createHash("sha1");
  // param为{ timestamp, jsapi_ticket, noncestr, url }
  let str = Object.keys(param).sort().map((key) => `${key}=${param[key]}`).join('&');
  sha1.update(str);
  return sha1.digest("hex");
}
router.get('/saveImg', (req, res) => {
  let media_id = req.query.media_id;
    	console.log('获取微信图')
  getAccessToken().then(data => {
    axios.get(`https://api.weixin.qq.com/cgi-bin/media/get?access_token=${data.access_token}&media_id=${media_id}`, {
      responseType: 'arraybuffer'
    }).then(response => {
    	console.log('收到微信图')
      res.send({
        code: 0,
        data: 'data:image/png;base64,' + response.data.toString('base64'),
        message: ''
      })
    }).catch(err => {
    	console.log('收到微信图失败了')
      console.log(err)
      res.send({
        code: -1,
        message: '失败'
      })
    });
  })
});
router.get('/jssdk', (req, res) => {
  let url = req.query.url;

  const timestamp = Math.floor(new Date().getTime() / 1000);
  const noncestr = "XXXXXXXX";
  getAccessToken().then(data => {
    get_jsapi_ticket(data.access_token).then(jsapi_ticket => {
      const signature = getSignature({
        timestamp,
        noncestr,
        url,
        jsapi_ticket,
      });
      res.send({
        code: 0,
        data: {
          url,
          jsapi_ticket,
          timestamp,
          noncestr,
          signature,
          appid: config.appid
        },
        message: ''
      });
    })
  })
});
router.get('/getAccessToken', (req, res) => {
  getAccessToken().then(data => {
    res.send({
      code: 0,
      data,
      message: ''
    });
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
  var return_uri = encodeURIComponent('http://oss.yipeng.online/mls20221107/index.html')
  var scoped = 'snsapi_userinfo'
  var state = '123'
  res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + AppID + '&redirect_uri=' + return_uri + '&response_type=code&scope=' + scoped + '&state=' + state + '#wechat_redirect')
})
router.get('/getUserInfo', function (req, res) {
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