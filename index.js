var config = require('./config.js')
  //, Twit = require('twit')
  , Twit = require('ntwitter')
  , twei = require('twei')
  , T = new Twit(config.twitter)
  ;

T.stream('statuses/filter', {follow: getTwitterUid()}, function(stream) {
  console.log('connected');
  stream.on('connect', function (request) {
    console.log('connected.');
  }).on('error', function(e, result) {
    console.log('error')
    console.log(e);
    console.log(result);
  }).on('data', function(tweet){
    console.log('data coming')
    //console.log(tweet);
    formatTweetForWeibo(tweet, function(err, data){
      if(err){
        throw err;
      }else{
        console.log('kai shi fa weibo');
        data.accessToken = config.weibo.access_token;
        twei.updateWeibo(data);
      }
    });
  }).on('disconnect', function (disconnectMessage) {
    console.log(disconnectMessage);
  }).on('reconnect', function (req, res, connectInterval) {
    var body;
    console.log('reconnect');
    //console.log(res);
    res.on('data', function(chunk) {
      body = body ? body.concat(chunk) : chunk;
    });
    res.on('end', function() {
      console.log(buffer.toString());
    });
  }).on('warning', function (warning) {
    console.log(warning);
  });

});

//将 tweet 转成微博允许的格式
function formatTweetForWeibo(tweet, callback) {
  var text, place, media, img;
  
  if(tweet.in_reply_to_user_id_str || tweet.entities.user_mentions.length || tweet.retweeted_status){
    console.log('drop');
    callback(new Error('drop'));
    return;
  }else{
    try{
      text = tweet.text;
      media = tweet.entities.media;
      place = tweet.place && tweet.place.bounding_box.coordinates ? tweet.place.bounding_box.coordinates[0][0] : [];
      
      //#hash -> #hash#
      tweet.entities.hashtags.forEach(function(hashInfo){
        text = text.replace(hashInfo.text, hashInfo.text + '#');
      });
      
      //转换 t.co 到原始 url, 对于原始 url 就是使用 t.co 的无效
      tweet.entities.urls.forEach(function(urlInfo){
        text = text.replace(urlInfo.url, urlInfo.expanded_url);
      });
      
      if(media && media[0]){
        text = text.replace(media[0].url, '');//remove the media url
        img = media[0].media_url + ':large';
      }
      
      callback(null, {
          message: text
        , coordinates: place
        , image: img
      });
    }catch(e) {
      callback(e);
    }
  }
}

function getTwitterUid() {
  var uid = config.twitter.access_token_key.match(/^\d+/)[0];
  return uid;
}