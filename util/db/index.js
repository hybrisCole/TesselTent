'use strict';
const r = require('rethinkdb');
const moment = require('moment');
const _ = require('lodash');

const DB_CONFIG = {
  host : '107.170.242.85',
  port : 29126,
  db   : 'internetTent',
};

const onConnect = (callback) => {
  r.connect({
    host : DB_CONFIG.host,
    port : DB_CONFIG.port,
  }, function connectDB (err, connection) {
    if (err) {
      console.log(err);
    } else {
      connection._id = Math.floor(Math.random() * 10001);
    }
    callback(err, connection);
  });
};

const wrapCurrentTime = (data) => {
  const currentTime = moment().subtract(6, 'hours');
  return _.assign({}, data, {
    unix   : currentTime.unix(),
    minute : currentTime.minute(),
    hour   : currentTime.hour(),
    date   : currentTime.date(),
    month  : currentTime.month(),
    year   : currentTime.year(),
  });
};

exports.saveClimate = function saveClimate (climateData) {
  onConnect((err, connection) => {
    r.db(DB_CONFIG.db).table('climate').insert(wrapCurrentTime(climateData))
    .run(connection, (errConnection) => {
      if (errConnection) {
        console.error(errConnection);
      }
      connection.close();
    });
  });
};

exports.saveLightSchedule = function saveLightSchedule (lightScheduleData) {
  onConnect((err, connection) => {
    r.db(DB_CONFIG.db).table('lightSchedule').insert(wrapCurrentTime(lightScheduleData))
    .run(connection, (errConnection) => {
      if (errConnection) {
        console.error(errConnection);
      }
      connection.close();
    });
  });
};
