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

  let player = null;
  let team = null;

  user.on('loginPlayer', playerId => {

    team = getLowestTeam();

    // Create user when you don't have an account yet.
    if (playerId == '') {
      player = createUser(user);
      user.emit("loggedIn", player.playerId);
      users.push({
        socket: user,
        playerId: playerId,
        location: null,
        angle: null,
        team: team
      });
    } else {
      Player.findOne({'playerId': playerId})
        .then(el => {
          player = el;
          users.push({
            socket: user,
            location: null,
            playerId: playerId,
            angle: null,
            team: team
          });
          user.emit("loggedIn", player.playerId);
        });
    }
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
    sendTeamMembers(team, player.playerId, 'changeLocation', {lat, long, accuracy, playerId: player.playerId});

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
});

function createUser(user) {
  const player = new Player({
    playerId: user.id
  });
  player.save();
  return player;
}

function getLowestTeam() {
  if (users == 'undefined' || users == null || users.length <= 0) return false;

  let teamRed = 0;
  let teamBlue = 0;

  users.forEach(user => {
    if (user.team !== 'undefined' && user.team !== null) {
      switch (user.team) {
        case 'red':
          teamRed++;
          break;
        case 'blue':
          teamBlue++;
          break;
      }
    }
  });

  return teamBlue >= teamRed ? 'red' : 'blue';
}

function setUserProperty(playerId, property, value) {
  const user = getUser(playerId);
  if (user != 'undefined' && user != null) {
    user[property] = value;
  }
}

function sendTeamMembers(team, playerId, subject, message) {
  if (users == 'undefined' && users == null && users.length <= 0 &&
  team == 'undefined' && subject == 'undefined' && message == 'undefined') return false;

  users.forEach(user => {
    console.log(user.team, team, playerId, user.playerId);
    if (user.team === team && playerId !== user.playerId) {
      user.socket.emit(subject, message);
    }
  })
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