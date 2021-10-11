var express = require('express');
var router = express.Router();
import ModelUser1 from '../models/ModelUser1'


var request = require('request');
const crypto = require('crypto'); // node内置的加密模块
router.get('/token', wechatAuth);

function sha1(str) {
  let shasum = crypto.createHash("sha1");
  return shasum.update(str, 'utf-8').digest("hex");
}

function wechatAuth(req, res) {
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
}

router.get('/getCode', (req, res) => {
  let AppID = 'wx4d71fdfe9622167d'
  var return_uri = 'http://127.0.0.1:7001/wx/getAccessToken'
  var scoped = 'snsapi_userinfo'
  var state = '123'
  res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + AppID + '&redirect_uri=' + return_uri + '&response_type=code&scope=' + scoped + '&state=' + state + '#wechat_redirect')
})

router.get('/getAccessToken', function (req, res) {
  code = req.query.code
  console.log('得到授权码code：', code);
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
          function (error, response, body) {
            var userinfo = JSON.parse(body);
            console.log(userinfo)
            res.send("\
                          <h1>" + userinfo.nickname + " 的个人信息</h1>\
                          <p><img src='" + userinfo.headimgurl + "' /></p>\
                          <p>" + userinfo.city + "，" + userinfo.province + "，" + userinfo.country + "</p>\
                      ");
          }
        )
      }
    }
  )
})



router.post('/doSubmit', async (req, res, next) => {
  let data = req.body;
  let dataDB = await ModelUser1.findOne({
    number: '' + data.number,
  })
  if (dataDB) {
    res.json({
      code: -1,
      message: '您已定制过赛服，请勿重复提交。'
    });
  } else {
    let count = await ModelUser1.find({}).countDocuments()
    let order = count + 1;
    await ModelUser1.insertMany([{
      name: data.name,
      number: data.number,
      content: data.content,
      order: order,
      phone: data.phone
    }], {
      writeConcern: 0,
    })
    res.json({
      code: 0,
      data: {
        name: data.name,
        sex: data.sex,
        birth: data.birth,
        number: data.number,
        content: data.content,
        order: order,
        phone: data.phone
      },
      message: '提交成功'
    });
  }
});
router.post('/getData', async (req, res, next) => {
  let data = req.body;
  let dataDB = await ModelUser1.findOne({
    phone: data.phone,
    name: data.name
  })
  if (dataDB) {
    res.json({
      code: 0,
      data: dataDB,
      message: ''
    });
  } else {
    res.json({
      code: 99,
      data: {},
      message: '您还未参与过定制'
    });
  }
});
router.get('/getCount', async (req, res, next) => {
  let count = await ModelUser1.find({}).countDocuments()
  res.json({
    code: 0,
    data: count,
    message: ''
  });
});


router.post('/login', async (req, res, next) => {
  let data = req.body;
  let dataDB = await ModelUser1.findOne({
    nickName: '' + data.nickName,
    cardId: '' + data.cardId
  })
  if (dataDB) {
    res.json({
      code: 0,
      data: {
        nickName: data.nickName,
        cardId: data.cardId
      }
    });
  } else {
    res.json({
      code: 9999,
      message: '您信息填写有误或未报名此次活动1'
    });
  }
});
router.post('/scan', async (req, res, next) => {
  let data = req.body;
  let timeNow = new Date().getTime();
  if (timeNow - data.time > 60 * 1000 * 5) {
    res.json({
      code: -1,
      message: '验证码已过期，请刷新重试'
    });
    return
  }
  let dataDB = await ModelUser1.findOne({
    cardId: '' + data.cardId
  })
  if (dataDB) {
    let listGamePlayed = dataDB.listGamePlayed.split(',');
    if (listGamePlayed.indexOf(data.gameId) > -1) {
      res.json({
        code: -1,
        message: '您已经打过卡了'
      });
    } else {
      listGamePlayed.push(data.gameId);
      await dataDB.updateOne({
        listGamePlayed: listGamePlayed.join(',')
      })
      res.json({
        code: 0,
        data: {

        }
      });
    }
  } else {
    res.json({
      code: 9999,
      message: '您信息填写有误或未报名此次活动2'
    });
  }
});
router.post('/played', async (req, res, next) => {
  let data = req.body;
  let dataDB = await ModelUser1.findOne({
    cardId: '' + data.cardId
  })
  if (dataDB) {
    res.json({
      code: 0,
      data: dataDB
    });
  } else {
    res.json({
      code: 9999,
      message: '您信息填写有误或未报名此次活动3'
    });
  }
});
router.post('/check', async (req, res, next) => {
  let data = req.body;
  let dataDB = await ModelUser1.findOne({
    cardId: '' + data.cardId
  })
  if (dataDB) {
    if (dataDB.flagGiftGot) {
      res.json({
        code: -1,
        message: data.cardId + '已经领取过奖励'
      });
    } else {

      let listGamePlayed = dataDB.listGamePlayed.split(',').filter(item => !!item);
      if (listGamePlayed.length >= 3) {
        await dataDB.updateOne({
          flagGiftGot: true
        })
        res.json({
          code: 0,
          message: data.cardId + '验证成功'
        });
      } else {
        res.json({
          code: -1,
          message: '未完成三个游戏'
        });
      }
    }
  } else {
    res.json({
      code: 9999,
      message: '您信息填写有误或未报名此次活动4'
    });
  }
});
export default router;