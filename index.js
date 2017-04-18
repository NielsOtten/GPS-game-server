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

io.on('connection', user => {
  console.log('User ' + user.id +' is connected.');

  const player = new Player({
    playerId: user.id
  });

  player.save();

  // Add user to global array.
  users.push(user);

  user.on('disconnect', () => {

    // Remove user from list.
    users = users.filter(el => {
      return el.id !== user.id;
    });

    console.log('User ' + user.id +' is disconnected.');
  });

  user.on('changeLocation', (lat, long, accuracy) => {

    const location = new Location({
      lat,
      long,
      accuracy,
      player: player._id
    });

    location.save();

    console.log('New location for user '+user.id+':', lat, long, accuracy);
  });

  user.on('shoot', () => {
    Player.findOne({playerId: user.id})
      .then((player => {
        return player._id;
      }))
      .then(playerId => {
        console.log(playerId);
        const id = mongoose.Types.ObjectId(playerId);
        return Location.findOne({
          player: id
        }).sort({timestamp: -1})
      })
      .then(location => {
        // THIS IS THE LATEST LOCATION.
      });
  });

  user.on('message', msg => {
    console.log(msg);
  });

});
