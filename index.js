var config = require('./config.js')
  , Twit = require('ntwitter')
  , twei = require('twei')
  , T = new Twit(config.twitter)
  ;

T.stream('statuses/filter', {follow: getTwitterUid()}, function(stream) {
  console.log('connected');
  stream.on('error', function(e, result) {
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
  });

});

//将 tweet 转成微博允许的格式
function formatTweetForWeibo(tweet, callback) {
  var text, place, media, img, urls;
  
  //抛弃那些无同步意义的 tweet:
  //@某人, 回复某人, 转发
  if(tweet.in_reply_to_user_id_str || tweet.entities.user_mentions.length || tweet.retweeted_status){
    console.log('drop');
    callback('drop');
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
      
      //图片转发
      if(media && media[0]){
        text = text.replace(media[0].url, '');//remove the media url
        img = media[0].media_url + ':large';
      }
      
      if(tweet.entities.urls.length){
        urls = [];
        //微博不允许使用国际上的一些短网址服务
        tweet.entities.urls.forEach(function(urlInfo){
          urls.push(urlInfo.expanded_url);
        });
        checkUrl(urls, function(originUrls) {
          originUrls.forEach(function (originUrl, i){
            text = text.replace(tweet.entities.urls[i].url, originUrl);
          });
          
          callback(null, {
              message: text
            , coordinates: place
            , image: img
          });
        });
      }else{
        callback(null, {
            message: text
          , coordinates: place
          , image: img
        });
      }
    }catch(e) {
      callback(e);
    }
  }
}

//解开短网址
function checkUrl(urls, callback) {
  var http = require('http')
    , _url = require('url')
    , checklist = {'t.co': 1, 'bit.ly': 1}
    , originUrls = []
    , n = 0
    ;
    
  callback = callback || function() {};
  
  function checkB (i, url){
    n--;
    originUrls[i] = url;
    n || callback(originUrls);
  }
  
  urls.forEach(function(url, i) {
    if(checklist[_url.parse(url).host]) {
      n++;
      http.get(url, function(res) {
        var location = res.headers.location;
        if(location){
          if(checklist[_url.parse(location).host]){
            checkUrl([location], function (realurl){
              checkB (i, realurl[0]);
            });
          }else{
            checkB(i, location);
          }
        }else{
          checkB(i, url)
        }
      }).on('error', function(e) {
        checkB(i, url)
      })
    }
  })
}

function getTwitterUid() {
  var uid = config.twitter.access_token_key.match(/^\d+/)[0];
  return uid;
}

module.exports = {
  checkUrl: checkUrl
};