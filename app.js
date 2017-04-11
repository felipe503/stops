const port = 8000;
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const fs = require('fs');

//to use mongo db
const mongojs = require('mongojs')
//mongo db collections
const db = mongojs('stm', ['stops']);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Set static path
app.use('/public', express.static(path.join(__dirname, 'public')));
//Get custom functions from server
const funcs = require('./functions/functions.js');
//console.log(funcs.CSVToArray('public/data/stop_times-000.txt',','));
/*
var file = 'calendar_dates';

fs.readFile('public/data/json/'+file+'.txt.json', function(err, data){
  if(err) throw err;

  db.calendar_dates.insert(JSON.parse(data).results, (err, res)=>{
    if(err){
      throw err
    }
    else{
      console.log(file);
    }
  });

  //console.log(funcs.CSVToArray(data, ','));
  //console.log(JSON.parse(data).results);
});
*/
var stops=[];
db.stops.find(function (err, docs) {
    stops = docs;
});
app.get('/', function (req, res) {
  res.render('index',{
    title: 'Index',
    stops:stops
  });
});
app.get('/about', function (req, res) {
  res.render('about',{
    title: 'About'
  });
});

app.get('/list',function(req, res){
  res.render('list',{
    title: 'List'
  });
});

app.post('/closeststops/', function(req, res){
  let closeststops=[];
  stops.forEach(function(st){
    if(funcs.getClosest(req.body.distance, req.body.latitude, st.stop_lat, req.body.longitude, st.stop_lon)){
      funcs.setDistance(st, req.body.latitude,req.body.longitude);
      closeststops.push(st);
    }
  });
  res.send(closeststops);
});
app.get('/gettripsid/:stop_id', function(req, res){
  db.stop_times.find({
    stop_id:Number(req.params.stop_id),arrival_time:{$gte:funcs.timeNow(),$lt:funcs.timeNow(20)}//2400078
  },function (err, docs) {
    if(docs.length>0){
      let tripsId = [];
      let busnames=[];
      let cpt=0;
      docs.forEach(function(val){
        tripsId.push({trip_id:val.trip_id,arrival_time:val.arrival_time});
      });
      tripsId = funcs.classDayTrips(tripsId);
      tripsId.forEach(function(tripId){
        let _tripId = tripId;
        db.trips.findOne({trip_id:String(tripId.trip_id)},function(err, docs){
          if(err)
            throw err;
          busnames.push(docs);
          cpt++;
          if(cpt==tripsId.length){
            db.calendar_dates.find({
              service_id:busnames[0].service_id, date:Number(((new Date()).toISOString().slice(0,10).replace(/-/g,"")))
            }, function(err, docs){;
                res.status(200).send(busnames[0].trip_headsign+' - '+_tripId.arrival_time);
            });
          }
        });
      });
    }
    else {
      res.status(200).send('No buses');
    }
  })
});

app.listen(port, function () {
  console.log('Example app listening on port '+port+'!')
});
