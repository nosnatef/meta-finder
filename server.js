const overwatch = require('overwatch-api');
const steamAPI = require('steam-api');
const codAPI = require('cod-api');
const bodyParser = require('body-parser');
const owjs = require('overwatch-js');

var path = require('path');
var fs = require('fs');
var exphbs = require('express-handlebars');
var express = require('express');
var MongoClient = require('mongodb').MongoClient;

var mongoHost = process.env.MONGO_HOST;
var mongoPort = process.env.MONGO_PORT || 27017;
var mongoUser = process.env.MONGO_USER;
var mongoPassword = process.env.MONGO_PASSWORD;
var mongoDBName = process.env.MONGO_DB;

mongoHost = 'classmongo.engr.oregonstate.edu';
mongoPort = 27017;
mongoUser = 'cs290_guz';
mongoPassword = 'cs290_guz';
mongoDBName = 'cs290_guz';


var testvar;


var mongoDBDatabase;
var db;
var overwatchId = 51;


var mongoURL = 'mongodb://' + mongoUser + ':' + mongoPassword + '@' + mongoHost + ':' + mongoPort + '/' + mongoDBName;
console.log(mongoURL);

var app = express();

app.engine('handlebars',exphbs({
  defaultLayout:'main',
  helpers:{
    'ifThird':function(index, options){
      if((index)%3==0){
        return options.fn(this);
      }
      else{
        return options.inverse(this);
      }
    }
  }
  }));
app.set('view engine','handlebars');

var port = process.env.PORT || 3001;

const platform = 'pc';
const region = 'us';
const tag = 'J3sus-11941';

const steamAPIKey = '36E4FE8D8ABDAB3E874F2111676BFFAF';

var appID = 311210;


var user = new steamAPI.User(steamAPIKey,76561198272110510);
var userStats = new steamAPI.UserStats(steamAPIKey);


var options = {
  title:"bo3",
  platform:"psn",
  username:"Prospect",
  days:1,
  type:"core",
  time:"monthly",
  mode:"career"
};

app.use(bodyParser.json());

codAPI.getProfile(options,function(profile){
  console.log(profile);
});

app.use(express.static('public'));
app.use(express.static('public/callofduty'));
app.use(express.static('public/Overwatch'));
app.use(express.static('public/utility'));
/*
app.listen(port, function () {
  console.log("== Server is listening on port", port);
});
*/

app.get('/',function(req,res){
  res.status(200);
  var cardJson = fs.readFileSync('gameData.json');
  var cardJsonContent = JSON.parse(cardJson);
  res.render('indexPage',{
    cards:cardJsonContent
  });
});



app.get('/123',function(req,res){
  res.redirect('/result');
});

app.post('/submit',function(res,req){
  res.redirect('/result');
});



app.post('/Overwatch/', function(req,res,){
       console.log("=== Overwatch Request Recived");

});



app.post('/callofduty/wwii/submit',function(req,res,next){

  console.log(123);
  var resultObj;
  console.log(req.body);
  console.log("   - username:",req.body.username);
  console.log("   - platform:",req.body.platform);
  codAPI.getProfile(req.body,function(profile){
    console.log(profile['mp']);
    resultObj={
      username:req.body.username,
      platform:req.body.platform,
      level:profile['mp']['level'],
      prestige:profile['mp']['prestige']
    };
    console.log(resultObj);


  });
  res.send("123");
});

var testObj = {
  mp:{
    level:10,
    prestige:40
  }
};

app.post('/Overwatch/submit',function(req,res,next){
  console.log(req.body.username);
  var username = req.body.username.replace('#','-');
  var player = db.collection('player.overwatch.new');
    owjs
        .getAll('pc','us',username)
        .then(function(data){
          //console.log(data);
          console.log("== Got data from API");
          player.findOne({'profile.nick': data.profile.nick}, function(err, result){
               if(err)
               {
                    console.log("== ERROR from findOne: ");
                    console.log(err);
               }
               if(!result)
               {
                    console.log("== User not in DB. Adding...");
                    player.insertOne(data);
                    console.log("Done!");
               }
               else
               {
                    console.log("== User is in DB. Updating...");

                    player.deleteOne({'profile.nick':data.profile.nick });
                    player.insertOne(data);

                    //console.log(data.competitive.heroes);
                    //var competitiveObj = data.competitive;
                    /*player.updateOne(
                         {'profile.nick':data.profile.nick},
                         {$set: {
                              'profile' : data.profile,
                              'competitive' : competitiveObj,//doesnt like d.va
                              'quickplay' : data.quickplay,
                              'achievements' : data.achievements
                         }});*/
                    console.log("Done!");

               }
          })


        });
});

app.post('/callofduty/submit',function(req,res,next){
  console.log(req.body.username);
  var username = req.body.username;
  var player = db.collection('player.callofduty');
  var options = {
    title:"bo3",
    platform:"psn",
    username:username,
    days:1,
    type:"core",
    time:"monthly",
    mode:"career"
  };
  console.log(options);
  codAPI.getProfile(options,function(profile){
    console.log(profile);
    try{
    //player.insertOne(profile);
    }
    catch(e){
      ;
    }
  });

});

app.get('/callofduty/result/:username',function(req,res,next){
  var username = req.params.username;
  console.log("Get request for "+username);
  var player = db.collection('player.callofduty');
  var playerCursor = player.find({'username':username});
  playerCursor.toArray(function(err,playerDocs){
    if(err){
      res.status(500).send("Error in database");
    }
    else{
      var playerElement = playerDocs[0];
      if(playerElement === undefined){
        next();
      }
      res.status(200);
      var winCount = playerElement.mp.lifetime.all.wins,
          lossCount = playerElement.mp.lifetime.all.losses,
          winPercentage = Math.floor((winCount/(winCount+lossCount)*100*100)/100) + "%",
          playedCount = winCount + lossCount,
          timePlayed = Math.floor((playerElement.mp.lifetime.all.timePlayed)/3600),
          kdRatio = playerElement.mp.lifetime.all.kdRatio,
          sugObjArray = [];

      var sugCursor = player.find({$and:[{"mp.lifetime.all.kdRatio":{$gte:kdRatio-0.2}},{"mp.lifetime.all.kdRatio":{$lte:kdRatio+0.2}}]});
      sugCursor.toArray(function(err,sugDocs){
        //console.log(sugDocs);
        for(var i = 0;i < 5;i++){
          var sugObj = sugDocs[i];
          if(!(sugObj === undefined)){
          sugObjArray.push(sugObj);
          }
        }
        res.render('codPage',{
          username:username,
          prestige:playerElement.mp.prestige,
          level:playerElement.mp.level,
          winCount:winCount,
          lossCount:lossCount,
          winPercentage:winPercentage,
          playedCount:playedCount,
          timeCount:timePlayed + " hrs",
          killCount:playerElement.mp.lifetime.all.kills,
          deathCount:playerElement.mp.lifetime.all.deaths,
          kdRatio:kdRatio,
          headCount:playerElement.mp.lifetime.all.headshots,
          suggested:sugObjArray
        });
      });


    }
  });
});

app.get('/Overwatch/result/:username',function(req,res,next){
  var username = req.params.username.split('-')[0];
  var blizID = req.params.username.split('-')[1];
  var player = db.collection('player.overwatch.new');
  var playerCursor = player.find({'profile.nick':username});
  playerCursor.toArray(function(err,playerDocs){
    if(err){
      res.status(500).send("Error in database");
    }
    else if(playerDocs==[]){
      console.log("IDK what happened");
    }
    else{

      console.log("== The user information is fetched from DB:");
      //console.log(playerDocs);
      var playerElement = playerDocs[0];
      if(playerElement === undefined){
        next();
      }
        res.status(200);
        try{
        var profilePic = playerElement.profile.avatar,
            skillRating = playerElement.profile.rank,
            rankPic = playerElement.profile.rankPicture,
            winCount = playerElement.competitive.global.games_won,
            lossCount = playerElement.competitive.global.games_lost,
            drawCount = playerElement.competitive.global.games_tied,
            playedCount = playerElement.competitive.global.games_played,
            timePlayed = playerElement.competitive.global.time_played,
            timeCount = (timePlayed/3600000) + " hrs",
            soloElimination = playerElement.competitive.global.eliminations,
            totalDamage = playerElement.competitive.global.all_damage_done,
            goldMedal = playerElement.competitive.global.medals_gold,
            silverMedal = playerElement.competitive.global.medals_silver,
            bronzeMedal = playerElement.competitive.global.medals_bronze,
            winPercentage = Math.floor((winCount/playedCount)*100*100)/100 + "%",
            sugObjArray = [],
            heroArray = playerElement.competitive.heroes,
            heroArraySort = [],
            heroFinal = [];

            for(var i in heroArray){
              var time_played = heroArray[i].time_played;
              var hero_name = i;
              if(!isNaN(time_played)){
                var heroObj = {
                  time_played:time_played,
                  hero_name:hero_name
                };
                heroArraySort.push(heroObj);
              }
            }


            for(var i = 0;i < heroArraySort.length;i++){
              for(var j = 0;j < heroArraySort.length - i - 1;j++){
                if(heroArraySort[j].time_played < heroArraySort[j+1].time_played){
                  var temp = heroArraySort[j];
                  heroArraySort[j] = heroArraySort[j+1];
                  heroArraySort[j+1] = temp;
                }
              }
            }
            console.log("== All heros in order of play time:");
            console.log(heroArraySort);

            var timeSum = 0;
            for(var i = 0;i<heroArraySort.length;i++){
              timeSum += heroArraySort[i].time_played;
            }

            for(var i = 0;i<3;i++){
              var heroObj = {
                hero_name:heroArraySort[i].hero_name,
                playPercentage:Math.floor(((heroArraySort[i].time_played)/timeSum)*100*100)/100
              }
              heroFinal.push(heroObj);
            }
            console.log("== Top three heros:");
            console.log(heroFinal);

            //for(var i = 0;i < )

            blizID = playerElement.profile.url.split('-')[2];

            console.log(winPercentage);
            var sugCursor = player.find({$and:[{"profile.rank":{$gte:skillRating-200}},{"profile.rank":{$lte:skillRating+200}}]});
            sugCursor.toArray(function(err,sugDocs){
              //console.log(sugDocs);
              for(var i = 0;i < 5;i++){
                var sugObj = sugDocs[i];
                if(!(sugObj === undefined)){
                sugObj['blizID'] = sugObj.profile.url.split("-")[2];
                sugObjArray.push(sugObj);
                }
              }
              res.render('overwatchPage',{
                profilePic:profilePic,
                username:username,
                blizID:blizID,
                skillRating:skillRating,
                rankPic:rankPic,
                winCount:winCount,
                lossCount:lossCount,
                drawCount:drawCount||0,
                playedCount:playedCount,
                timeCount:timeCount,
                soloElimination:soloElimination,
                totalDamage:totalDamage,
                goldMedal:goldMedal,
                silverMedal:silverMedal,
                bronzeMedal:bronzeMedal,
                winPercentage:winPercentage,
                suggested:sugObjArray,
                heroes:heroFinal
              });
            });
            //console.log(sugCursor);

/*
              sugCursor.toArray(function(err,sugDocs){
                  console.log(sugDocs);
                  for(var i = 0;i < 5;i++){
                  var sugObj = playerDocs[i];
                  console.log(sugObj);
                  sugObjArray.push(sugObj);
                  }
                }).then(function(){
                  console.log(sugObjArray);
                });
*/



        }
        catch(e){
          ;
        }



    }
  });

});

app.post('/a', [function(req, res, next) {
  next();
}, function(req, res) {
  res.send('Hello World!');
}]);

app.get('/result',function(req,res){
  res.render('resultPage',testObj);
});

app.get('/player',function(req,res){
  var player = db.collection('player');
  var playerCursor = player.find({});
  playerCursor.toArray(function(err,playerDocs){
    if(err){
      res.status(500).send("error in DB");
    }
    else{
      console.log(playerDocs);
    }
  });
});


app.get('*',function(req,res){
  res.status(404);
  res.redirect('/404.html');
});


app.listen(3001,function(){
    console.log("== Server is listening on port 3001.");
});
/*
MongoClient.connect(mongoURL,function(err,client){
  if(err){
    throw err;
  }
  db = mongoDBDatabase = client.db(mongoDBName);

});
*/
