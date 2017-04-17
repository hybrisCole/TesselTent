// eslint-disable-next-line strict
'use strict';
const axios = require('axios');
const moment = require('moment');
const Rx = require('rxjs/Rx');
const pubnubSingleton = require('../pubnubSingleton');
const timeInterval = Rx.Observable.interval(1000);
const logInterval = Rx.Observable.interval(5 * 60 * 1000);
let currentTime = moment();
let internalStartDiff = moment();

const requestTime = function requestTime () {
  return new Promise((resolve, reject) => {
    axios.get('http://api.timezonedb.com/v2/get-time-zone?key=K7G5WXGM2Q5B&by=zone&zone=America/Costa_Rica&format=json').then((response) => {
      // eslint-disable-next-line no-console
      // Costa Rica time
      currentTime = moment.unix(response.data.timestamp);
      internalStartDiff = moment();
      pubnubSingleton.publish('tent:log', {data : currentTime});
      resolve({});
    }).catch((err) => {
      reject(err);
    });
  });
};

pubnubSingleton.subscribe('tent:forceTimeUpdate', {
  message : () => {
    requestTime().then(() => {
      pubnubSingleton.publish('tent:log', {data : 'forceTimeUpdate'});
      const internalCurrentTime = moment();
      const duration = moment.duration(internalCurrentTime.diff(internalStartDiff));
      const elapsedSeconds = duration.asSeconds();
      internalStartDiff = moment();
      currentTime.add(elapsedSeconds, 's');
      pubnubSingleton.publish('tent:log', {data : elapsedSeconds});
      pubnubSingleton.publish('tent:log', {data : currentTime});
    }).catch((err) => {
      pubnubSingleton.publish('tent:log', {data : err.message});
    });
  },
});

// This is needed bc we can't 100% rely on Tessel's internal time.
exports.setup = function setup () {
  requestTime();
  logInterval.subscribe(() => {
    pubnubSingleton.publish('tent:log', {data : 'timeInterval'});
    pubnubSingleton.publish('tent:log', {data : currentTime});
  });
  timeInterval.subscribe(() => {
    const internalCurrentTime = moment();
    const duration = moment.duration(internalCurrentTime.diff(internalStartDiff));
    const elapsedSeconds = duration.asSeconds();
    internalStartDiff = moment();
    currentTime.add(elapsedSeconds, 's');
  });
};

exports.get = function get () {
  return currentTime;
};
