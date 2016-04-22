const tessel = require('tessel');
const pubnubSingleton = require('../../util/pubnubSingleton');
const climatelib = require('climate-si7020');
const climate = climatelib.use(tessel.port['A']);

exports.startReading = function startReading () {
  climate.on('ready', function () {
    console.log('Connected to climate module');
    // Loop forever
    setImmediate(function loop () {
      climate.readTemperature('c', (err, temp) => {
        climate.readHumidity((err, humid) => {
        // console.log(`humidity ${Math.round(humid)}`);
        pubnubSingleton.publish(
          'tent:climate',
          {
            temperature : Math.round(temp),
            humidity    : Math.round(humid),
          },
          (callBackData) => {
            // console.log(callBackData);
          },
          (err) => {
            console.log(JSON.stringify(err));
          }
        );
        setTimeout(loop, 500);
        });
      });
    });
  });

  climate.on('error', function(err) {
    console.log('error connecting module', err);
  });
};
