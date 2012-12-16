//将本文件拷贝为 config.js, 并填上你的 twitter 和 weibo 信息

var config = {
  //twitter 所需的这些参数可以从 https://dev.twitter.com 新建一个 app 后获取.
  twitter: {
    consumer_key: 'key',
    consumer_secret: 'secret', 
    access_token_key: 'key',
    access_token_secret: 'secet'
  },
  // weibo 的 access_token 可以从这里授权取得: http://t.cn/zWKjcla
  weibo: {
    access_token: 'weibo'
  }
};

module.exports = config;