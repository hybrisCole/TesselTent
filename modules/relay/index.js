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
  const waterData = {info : {}};
  const hours = {
    light : [],
  };
  setTimeout(() => {
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
    pubnubSingleton.history({
      count   : 1,
      channel : 'tent:water',
    }, (status, response) => {
      if (status.statusCode === 200) {
        const water = response.messages[0].entry;
        if (water) {
          waterData.info = water;
        }
      }
    });
  }, 5000);
  pubnubSingleton.subscribe('tent:lightHorus', {
    message : (msg) => {
      hours.light = msg.message;
    },
  });
  pubnubSingleton.subscribe('tent:water', {
    message : (msg) => {
      waterData.info = msg.message;
    },
  });
  relay.on('ready', function relayReady () {
    relayInterval.subscribe(() => {
      const currentTime = time.get();
      const currentDay = currentTime.format('dddd');
      const currentHour = currentTime.get('hour');

      // same day, same hour for watering
      const isDayEnabled = _.includes(_.chain(waterData.info.days).filter((day) => day.enabled).map('day').value(), currentDay);
      const hourEnabled = _.find(waterData.info.hours, (hour) => hour.enabled) || {number : -1};
      if (isDayEnabled && hourEnabled.number === currentHour) {
        const duration = _.find(waterData.info.durations, (durationObj) => durationObj.enabled) || { seconds : -1};
        const startWatering = _.cloneDeep(time.get()).minutes(5).seconds(0);
        const endWatering = _.cloneDeep(time.get()).minutes(5).seconds(duration.seconds);
        /* console.log(`start ${startWatering.toString()}`);
        console.log(`end   ${endWatering.toString()}`);
        console.log(`curre ${time.get().toString()}`);
        console.log(`---`); */
        if (_.inRange(time.get().valueOf(), startWatering.valueOf(), endWatering.valueOf())) {
          relay.turnOn(2, cbRelay);
        } else {
          relay.turnOff(2, cbRelay);
        }
      }
      // eslint-disable-next-line no-console
      pubnubSingleton.publish('tent:hourData', {
        lights : hours.light,
        isOn   : _.includes(hours.light, currentHour),
        time   : time.get().toISOString(),
      });
      if (_.includes(hours.light, currentHour)) {
        relay.turnOn(1, cbRelay);
      } else {
        relay.turnOff(1, cbRelay);
      }
    });
  });
};
