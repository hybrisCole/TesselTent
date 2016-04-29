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
    let climateCounter = 0;
    console.log('Connected to climate module');
    setInterval(function loop () {
      climate.readTemperature('c', (errTemperature, temp) => {
        climate.readHumidity((errHumidity, humid) => {
          if (!errTemperature && !errHumidity) {
            const climateData = {
              temperature : Math.round(temp),
              humidity    : Math.round(humid),
            };
            temperatureSum += climateData.temperature;
            humiditySum += climateData.humidity;
            climateCounter++;
            pubnubSingleton.publish('tent:climate', climateData,
              (callBackData) => {
                console.log(callBackData);
              },
              (errPub) => {
                console.error(JSON.stringify(errPub));
              }
            );
          } else {
            console.log(errTemperature, errHumidity);
          }
        });
      });
    }, 1000);
    setInterval(function dbLoop () {
      db.saveClimate({
        temperature : Math.round(temperatureSum / climateCounter),
        humidity    : Math.round(humiditySum / climateCounter),
      });
      climateCounter = 0;
      temperatureSum = 0;
      humiditySum = 0;
    }, DB_LOOP_DURATION * 1000);
  });

  climate.on('error', function climateError (errClimate) {
    console.error(errClimate);
  });
};
