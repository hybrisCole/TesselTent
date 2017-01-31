// eslint-disable-next-line strict
'use strict';
const axios = require('axios');
const moment = require('moment');
const Rx = require('rxjs/Rx');
const timeInterval = Rx.Observable.interval(1000);
let currentTime = moment();
let internalStartDiff = moment();
const requestTime = function requestTime () {
  axios.get('http://api.timezonedb.com/v2/get-time-zone?key=K7G5WXGM2Q5B&by=zone&zone=America/Costa_Rica&format=json').then((response) => {
    // eslint-disable-next-line no-console
    // Costa Rica time
    currentTime = moment.unix(response.data.timestamp);
    internalStartDiff = moment();
  }).catch((err) => {
    requestTime();
    // eslint-disable-next-line no-console
    console.log(err);
  });
};
// This is needed bc we can't 100% rely on Tessel's internal time.
exports.setup = function setup () {
  requestTime();
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
