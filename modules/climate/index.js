'use strict';
const tessel = require('tessel');
const pubnubSingleton = require('../../util/pubnubSingleton');
const db = require('../../util/db');
const climatelib = require('climate-si7020');
const climate = climatelib.use(tessel.port.A);
const DB_LOOP_DURATION = 60;

exports.startReading = function startReading () {
  climate.on('ready', () => {
    let temperatureSum = 0;
    let humiditySum = 0;
    console.log('Connected to climate module');
    setImmediate(function loop () {
      climate.readTemperature('c', (errTemperature, temp) => {
        climate.readHumidity((errHumidity, humid) => {
          const climateData = {
            temperature : Math.round(temp),
            humidity    : Math.round(humid),
          };
          temperatureSum += climateData.temperature;
          humiditySum += climateData.humidity;
          pubnubSingleton.publish('tent:climate', climateData,
            (callBackData) => {
              console.log(callBackData);
            },
            (errPub) => {
              console.error(JSON.stringify(errPub));
            }
          );
          setTimeout(loop, 500);
        });
      });
    });
    setImmediate(function dbLoop () {
      db.saveClimate({
        temperature : Math.round(temperatureSum / DB_LOOP_DURATION),
        humidity    : Math.round(humiditySum / DB_LOOP_DURATION),
      });
      temperatureSum = 0;
      humiditySum = 0;
      setTimeout(dbLoop, DB_LOOP_DURATION * 1000);
    });
  });

  climate.on('error', function climateError (errClimate) {
    console.error(errClimate);
  });
};
