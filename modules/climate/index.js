const tessel = require('tessel');
const pubnubSingleton = require('../../util/pubnubSingleton');
const climatelib = require('climate-si7020');
const climate = climatelib.use(tessel.port.A);

exports.startReading = function startReading () {
  climate.on('ready', () => {
    console.log('Connected to climate module');
    // Loop forever
    setImmediate(function loop () {
      climate.readTemperature('c', (errTemperature, temp) => {
        climate.readHumidity((errHumidity, humid) => {
          pubnubSingleton.publish(
            'tent:climate',
            {
              temperature : Math.round(temp),
              humidity    : Math.round(humid),
            },
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
  });

  climate.on('error', function climateError (errClimate) {
    console.error(errClimate);
  });
};
