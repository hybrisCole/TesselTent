// eslint-disable-next-line node/no-unpublished-require, node/no-missing-require
const tessel = require('tessel');
const pubnubSingleton = require('../../util/pubnubSingleton');
const time = require('../../util/time');
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
  pubnubSingleton.history({
    count   : 1,
    channel : 'tent:lightHorus',
  }, (status, response) => {
    if (status.statusCode === 200) {
      const lastHours = response.messages[0].entry;
      if (lastHours.length) {
        hours.light = lastHours;
      }
    }
  });
  pubnubSingleton.subscribe('tent:lightHorus', {
    message : (msg) => {
      hours.light = msg.message;
    },
  });
  relay.on('ready', function relayReady () {
    relayInterval.subscribe(() => {
      const currentHour = time.get().get('hour');
      // eslint-disable-next-line no-console
      console.log(hours.light, currentHour);
      if (_.includes(hours.light, currentHour)) {
        relay.turnOn(1, cbRelay);
      } else {
        relay.turnOff(1, cbRelay);
      }
    });
  });
};
