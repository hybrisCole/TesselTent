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
const waterData = {info : {}};
const hours = {
  light : [],
};
const loadHistory = () => {
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
};

const lightHorusSub = {
  message : (msg) => {
    hours.light = msg.message;
  },
};

const waterSub = {
  message : (msg) => {
    waterData.info = msg.message;
  },
};
const performWatering = (currentTime) => {
  const duration = _.find(waterData.info.durations, (durationObj) => durationObj.enabled) || { seconds : -1};
  const startWatering = _.cloneDeep(currentTime).minutes(5).seconds(0);
  const endWatering = _.cloneDeep(currentTime).minutes(5).seconds(duration.seconds);
  if (_.inRange(currentTime.valueOf(), startWatering.valueOf(), endWatering.valueOf())) {
    relay.turnOn(2, cbRelay);
  } else {
    relay.turnOff(2, cbRelay);
  }
};

const relayReady = () => {
  relayInterval.subscribe(() => {
    const currentTime = time.get();
    const currentDay = currentTime.format('dddd');
    const currentHour = currentTime.get('hour');
    // same day, same hour for watering
    const isDayEnabled = _.includes(_.chain(waterData.info.days).filter((day) => day.enabled).map('day').value(), currentDay);
    const hourEnabled = _.find(waterData.info.hours, (hour) => hour.enabled) || {number : -1};
    if (isDayEnabled && hourEnabled.number === currentHour) {
      performWatering();
    }
    // eslint-disable-next-line no-console
    pubnubSingleton.publish('tent:hourData', {
      lights : hours.light,
      isOn   : _.includes(hours.light, currentHour),
      time   : currentTime.toISOString(),
    });
    if (_.includes(hours.light, currentHour)) {
      relay.turnOn(1, cbRelay);
    } else {
      relay.turnOff(1, cbRelay);
    }
  });
};

exports.startReading = function startReading () {
  setTimeout(loadHistory, 5000);
  pubnubSingleton.subscribe('tent:lightHorus', lightHorusSub);
  pubnubSingleton.subscribe('tent:water', waterSub);
  relay.on('ready', relayReady);
};
