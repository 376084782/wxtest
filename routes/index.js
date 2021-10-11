var express = require('express');
var router = express.Router();
import ModelUser1 from '../models/ModelUser1'
import ModelHaibao from '../models/ModelHaibao'

router.post('/haibao', async (req, res, next) => {
  let data = req.body;
  await ModelHaibao.insertMany([{
    content: data.content,
    openid: data.openid,
    nickname: data.nickname
  }], {
    writeConcern: 0,
  })
  res.json({
    code: 0,
    data: {},
    message: '提交成功'
  });

});
router.post('/doSubmit', async (req, res, next) => {
  let data = req.body;
  // 每个手机限定一个
  let dataDB = await ModelUser1.findOne({
    phone: '' + data.phone,
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
      phone: data.phone,
      openid: data.openid,
      nickname: data.nickname
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