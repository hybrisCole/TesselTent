// eslint-disable-next-line node/no-unpublished-require, node/no-missing-require
const tessel = require('tessel');
const pubnubSingleton = require('../../util/pubnubSingleton');
const moment = require('moment');
const _ = require('lodash');
const relaylib = require('relay-mono');
const Rx = require('rxjs/Rx');
const relayInterval = Rx.Observable.interval(1000);
const relay = relaylib.use(tessel.port.B);
const cbRelay = () => {};
exports.startReading = function startReading () {
  const hours = {
    light : [],
  };
  pubnubSingleton.subscribe('tent:lightHorus', {
    message : (msg) => {
      hours.light = msg.message;
    },
  });
  relay.on('ready', function relayReady () {
    relayInterval.subscribe(() => {
      const currentHour = moment().subtract(6, 'hours').get('hour');
      if (_.includes(hours.light, currentHour)) {
        relay.turnOn(1, cbRelay);
      } else {
        relay.turnOff(1, cbRelay);
      }
    });
  });
};
