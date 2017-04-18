import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';

import Player from './models/Player';
import Location from './models/Location';

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/gpsgame');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

let users = [];

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

  const player = new Player({
    playerId: user.id
  });

  player.save();

  // Add user to global array.
  users.push(user);

  user.on('disconnect', function() {

    // Remove user from list.
    users = users.filter(el => {
      return el.id !== user.id;
    });

    console.log('User ' + user.id +' is disconnected.');
  });

  user.on('changeLocation', function (lat, long, accuracy) {

    const location = new Location({
      lat,
      long,
      accuracy,
      player: player._id
    });

    location.save();

    console.log('New location for user '+user.id+':', lat, long, accuracy);
  });

  user.on('message', function (msg) {
    console.log(msg);
  });

});
