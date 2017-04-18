import express from 'express';
import mongoose from 'mongoose';
import Pin from './Pin';
import bodyParser from 'body-parser';
import path from 'path';

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/gpsgame');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(bodyParser.json());

app.post('/postLocation', (req, res) => {
  const pin = new Pin(req.body);
  pin.save().then(a => res.json(a));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/index.html'));
});


http.listen(5000);

io.on('connection', function (user) {
  console.log('User ' + user.id +' is connected.');
  user.on('disconnect', function() {
    console.log('User ' + user.id +' is disconnected.');
  });
  user.on('changeLocation', function (lat, long, accuracy) {
    const pin = new Pin({lat, long, accuracy});
    pin.save();
    console.log('New location for user '+user.id+':', lat, long, accuracy);
  });
  user.on('message', function (msg) {
    console.log(msg);
  });
});
