import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import calculateShot from './weapons/calculate';

import Player from './models/Player';
import Location from './models/Location';

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/gpsgame');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

let users = [];

app.use(bodyParser.json());

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
  users.push({
    socket: user,
    playerId: user.id,
    location: null,
    angle: null
  });

  user.on('disconnect', () => {

    // Remove user from list.
    users = getUsersWithout(player.playerId);

    console.log('User ' + user.id +' is disconnected.');
  });

  user.on('changeLocation', (lat, long, accuracy) => {
    const location = new Location({
      lat,
      long,
      accuracy,
      player: player._id
    });

    setUserProperty(player.playerId, 'location', location);

    location.save();

    // Send location to all other users.
    user.broadcast.emit('changeLocation', {lat, long, accuracy, playerId: player.playerId});

    console.log('New location for user '+user.id+':', lat, long, accuracy);
  });

  user.on('changeAngle', angle => {
    setUserProperty(player.playerId, 'angle', angle);
    player.angle = angle;
    player.save();
  });

  user.on('shoot', weaponType => {
    const user = getUser(player.playerId);
    const enemies = getUsersWithout(player.playerId);
    const enemiesHit = calculateShot(weaponType, user.location, user.angle, enemies);

    if (enemiesHit != 'undefined' && enemiesHit != null) {
      enemiesHit.forEach(enemy => {
        enemy.socket.emit('hit');
      });
    }
  });

  user.on('message', msg => {

    console.log(msg);
  });
});

function setUserProperty(playerId, property, value) {
  const user = getUser(playerId);
  user[property] = value;
}

function getUser(playerId) {
  return users.find(user => {
    if (user.playerId == playerId) return user;
  });
}

function getUsersWithout(playerId) {
  return users.filter(user => {
    return user.playerId !== playerId;
  });
}