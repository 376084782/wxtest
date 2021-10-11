// 获取 access_token
const config = require('../config/index.json'); // 配置数据
const axios = require('axios'); // 请求api
const CircularJSON = require('circular-json');

// (设置 | 获取)缓存方法
const cache = require('./cache');

module.exports = function getAccessToken(res) {
  return new Promise(rsv => {
    const fetchUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appid}&secret=${config.appsecret}`;
    // console.log(fetchUrl, config);

    // 获取缓存
    cache.getCache('access_token', function (cacheValue) {
      // 缓存存在
      if (cacheValue) {
        const result = CircularJSON.stringify({
          access_token: cacheValue,
          from: 'cache'
        });
        rsv(result);
      } else {
        // 调取微信api
        axios.get(fetchUrl).then(response => {
          let json = CircularJSON.stringify(response.data);
          rsv(json);
          // 设置缓存
          if (response.data.access_token) {
            cache.setCache('access_token', response.data.access_token)
          }
        }).catch(err => {
          console.log('axios occurs ', err);
        });
      }
    });
  })

};