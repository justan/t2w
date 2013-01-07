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
    console.log('tweet coming: ')
    console.log(tweet);
    formatTweetForWeibo(tweet, function(err, data){
      if(err){
        //throw err;
        console.error(err);
      }else{
        data.accessToken = config.weibo.access_token;
        console.log('kai shi fa weibo: ');
        console.log(data);
        twei.updateWeibo(data).on('success', function(reply){
          if(reply.error){
            console.log('weibo error: ');
            console.log(reply);
          }else{
            console.log('done');
          }
        }).on('error', function(e){
          console.log('failed: ');
          console.log(e);
        });
      }
    });
  });

});

//将 tweet 转成微博允许的格式
function formatTweetForWeibo(originalTweet, callback) {
  var text, place, media, img, urls
    , tweet = originalTweet
    ;
  
  //抛弃那些无同步意义的 tweet:
  //@某人
  try{
    if(tweet.retweeted_status){//RT
      console.log('RT from: ' + tweet.retweeted_status.user.name);
      tweet = tweet.retweeted_status;
    }
    
    if(tweet.in_reply_to_user_id_str){//reply
      console.log('reply somebody');
      callback('drop');
      return;
    }else if(tweet.entities.user_mentions && tweet.entities.user_mentions.length){//@
      console.log('@somebody');
      callback('drop');
      return;
    }
    
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
    }else{
      originUrls[i] = urls[i];
      if(i === urls.length - 1){
        callback(originUrls);
      }
    }
  })
}

function getTwitterUid() {
  var uid = config.twitter.access_token_key.match(/^\d+/)[0];
  return uid;
}

module.exports = {
    checkUrl: checkUrl
  , formatTweetForWeibo: formatTweetForWeibo
};