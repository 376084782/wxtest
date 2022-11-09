import excelPort from 'node-xlsx';
import ModelUser1 from '../models/ModelUser1'
import ModelHaibao from '../models/ModelHaibao';
var express = require('express');
var router = express.Router();
var fs = require('fs')
//引入excel模块

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function (req, res, next) {
  let data = req.body;
  res.json({
    code: 0,
    data: {}
  }); //数据返回前端
});

router.get('/user/list', async (req, res, next) => {
  let data = req.query;
  let page = +data.page || 1;
  let size = +data.size || 20;
  let list = await ModelUser1.find({}).sort({
    "ID": 1
  }).skip(size * (page - 1)).limit(size);
  let total = await ModelUser1.find({}).countDocuments()
  res.json({
    code: 0,
    data: {
      list,
      pageConfig: {
        page,
        size,
        total: Math.ceil(total / size)
      }
    }
  }); //数据返回前端
});
router.post('/user/insert/multi', async (req, res, next) => {
  let data = req.body;
  await ModelUser1.deleteMany({})
  await ModelUser1.insertMany(
    data.list, {
    writeConcern: 0,
  }
  )
  res.json({
    code: 0,
    data: {}
  }); //数据返回前端
});

function writeExcel(datas, map) {

  let sheetData = [];
  // 写入表头
  let colTitle = [];
  for (let key in map) {
    colTitle.push(map[key])
  }
  sheetData.push(colTitle)
  datas.forEach(element => {
    let colData = [];
    for (let key in map) {
      colData.push(element[key])
    }
    sheetData.push(colData)
  });

  let xlsxObj = [{
    name: 'sheet1',
    data: sheetData,
  }]
  //生成表格
  let file = excelPort.build(xlsxObj);
  return file;
}

router.get('/user/clear', async (req, res, next) => {
  await ModelUser1.deleteMany()
  res.json({
    code: 0,
    data: {}
  }); //数据返回前端
});

router.get('/user/excel', async (req, res, next) => {
  let list = await ModelUser1.find({});
  let file = writeExcel(list, {
    openid: '微信openid',
    nickname: '微信昵称',
    phone: '手机号',
    name: '姓名',
    number: '身份证',
    content: '烫印内容',
    order: '订单号',
  })
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader("Content-Disposition", "attachment; filename=" + "list.xlsx");
  res.send(file);
});


router.get('/haibao/list', async (req, res, next) => {
  let data = req.query;
  let page = +data.page || 1;
  let size = +data.size || 20;
  let list = await ModelHaibao.find({}).sort({
    "ID": 1
  }).skip(size * (page - 1)).limit(size);
  let total = await ModelHaibao.find({}).countDocuments()
  res.json({
    code: 0,
    data: {
      list,
      pageConfig: {
        page,
        size,
        total: Math.ceil(total / size)
      }
    }
  }); //数据返回前端
});

router.get('/haibao/clear', async (req, res, next) => {
  await ModelHaibao.deleteMany()
  res.json({
    code: 0,
    data: {}
  }); //数据返回前端
});

router.get('/haibao/excel', async (req, res, next) => {
  let list = await ModelHaibao.find({});
  let file = writeExcel(list, {
    openid: '微信openid',
    nickname: '微信昵称',
    content: '宣言',
  })
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader("Content-Disposition", "attachment; filename=" + "list.xlsx");
  res.send(file);
});

module.exports = router;