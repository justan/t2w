t2w
===

同步 twitter 到 weibo

## 特性

1. 同步 tweet 到新浪微博
2. 还原短网址
3. 同步图片, 地理信息
4. 实时(twitter stream API)
5. 丢掉不宜同步的 tweet, 包括: @某人, 回复某人, 转发

## 使用

1. `git clone https://github.com/justan/t2w.git`
2. `cd t2w && npm install`
3. `cp config.sample.js config.js`
4. 输入 config.js 中 twitter 的 'consumer_key, consumer_secret, access_token_key, access_token_secret', 这些可以通过在 https://dev.twitter.com 注册一个 app 获得
5. 输入 config.js 中微博的 access_token. 简单的, 可以从 http://t.cn/zWKjcla 获得
6. 确保你的机器可以访问 twitter
7. `nohup node index.js &`

## 后记

前几天发现 [twei] 的 [access_token 有效期][0]从 7 天变成 5 年, 就觉得是时候写这样一个工具了. 于是在一个失眠的夜晚完成了这个.


[twei]: https://github.com/justan/twei
[0]: http://t.cn/zWKjcla