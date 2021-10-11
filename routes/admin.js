import excelPort from 'node-xlsx';
import ModelUser1 from '../models/ModelUser1'
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

function writeExcel(datas) {

  let sheetData = [];
  let map = {
    name: '姓名',
    sex: '性别',
    birth: '生日',
    number: '号码',
    content: '烫印内容',
    order: '订单号',
    phone:'手机号'
  }
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
router.get('/user/excel', async (req, res, next) => {
  let list = await ModelUser1.find({});
  let file = writeExcel(list)
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader("Content-Disposition", "attachment; filename=" + "list.xlsx");
  res.send(file);
});

module.exports = router;