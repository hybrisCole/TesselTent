// eslint-disable-next-line node/no-unpublished-require, node/no-missing-require
const tessel = require('tessel');
const climatelib = require('climate-si7020');
const climate = climatelib.use(tessel.port.A);
const pubnubSingleton = require('../../util/pubnubSingleton');
const moment = require('moment');
const Rx = require('rxjs/Rx');

const climateInterval = Rx.Observable.interval(5000);
const readTemperature = (err, temp) => {
  pubnubSingleton.publish('tent:climate', {
    temperature : temp.toFixed(2),
    time        : (moment().subtract(6, 'hours')).toISOString(),
  });
};

const climateError = (errClimate) => {
  // eslint-disable-next-line no-console
  console.error(errClimate);
};

exports.startReading = function startReading () {
  climate.on('ready', () => {
    climate.setHeater(true);
    climateInterval.subscribe(() => {
      climate.readTemperature('c', readTemperature);
    });
  });
  climate.on('error', climateError);
};
