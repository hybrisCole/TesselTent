'use strict';
const tessel = require('tessel');
const pubnubSingleton = require('../../util/pubnubSingleton');
const db = require('../../util/db');
const moment = require('moment');
const _ = require('lodash');
const relaylib = require('relay-mono');
const relay = relaylib.use(tessel.port.B);
let lightHours  = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

pubnubSingleton.subscribe('tent:lightHorus', (lightHoursResponse) => {
  lightHours = lightHoursResponse;
  console.log(lightHoursResponse);
}, (err) => {
  console.log(JSON.stringify(err));
});

exports.startReading = function startReading () {
  relay.on('ready', function relayReady () {
    let alreadyTurnedOn = false;
    let alreadyTurnedOff = false;
    console.log('Connected to relay module');
    setInterval(function toggle () {
      const currentHour = moment().subtract(6, 'hours').get('hour');
      if (_.includes(lightHours, currentHour)) {
        if (!alreadyTurnedOn) {
          alreadyTurnedOn = true;
          alreadyTurnedOff = false;
          relay.turnOn(1, (err) => {
            console.log('turnedOn', err);
          });
        }
      } else {
        if (!alreadyTurnedOff) {
          alreadyTurnedOn = false;
          alreadyTurnedOff = true;
          relay.turnOff(1, (err) => {
            console.log('turnedOff', err);
          });
        }
      }
    }, 1000);
    setInterval(function dbLoop () {
      db.saveLightSchedule({
        light : alreadyTurnedOn,
      });
    }, 60 * 60 * 1000); // each hour
  });
  // When a relay channel is set, it emits the 'latch' event
  relay.on('latch', function latch (channel, value) {
    console.log(`latch on relay channel ${channel} switched to ${value}`);
  });
};
