// 通过 access_token 获取 jsapi_ticket 临时票据
const axios = require('axios'); // 请求api
const CircularJSON = require('circular-json');
const config = require('../config/index.json');
const cache = require('./cache');


module.exports = function get_jsapi_ticket(access_token) {
  return new Promise(rsv => {
    const fetchUrl = config.getJsapiTicket + `?access_token=${access_token}&type=jsapi`;
    // 调取微信api
    axios.get(fetchUrl).then(response => {
      // 设置缓存
      if (response.data.ticket) {
        rsv(response.data.ticket);
      } else {
        rsv()
      }
    }).catch(err => {
      // console.log('axios occurs ', err);
    });

  })

}