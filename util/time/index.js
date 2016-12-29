// eslint-disable-next-line strict
'use strict';
const axios = require('axios');
const moment = require('moment');
let currentTime = moment();
// eslint-disable-next-line no-console
console.time('reqDone');
// This is needed bc we can't 100% rely on Tessel's internal time.
exports.setup = function setup () {
  axios.get('http://www.timeapi.org/utc/now.json').then((response) => {
    // eslint-disable-next-line no-console
    console.timeEnd('reqDone');
    // Costa Rica time
    currentTime = moment(response.data.dateString).subtract(6, 'hours');
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err);
  });
};

exports.get = function get () {
  return currentTime;
};
