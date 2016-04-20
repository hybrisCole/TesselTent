// Import the interface to Tessel hardware
const tessel = require('tessel');
const climatelib = require('climate-si7020');
const climate = climatelib.use(tessel.port['A']);
const pubnubSingleton = require('./util/pubnubSingleton');


climate.on('ready', function () {
  console.log('Connected to climate module');
  // Loop forever
  setImmediate(function loop () {
    climate.readTemperature('c', (err, temp) => {
      climate.readHumidity((err, humid) => {
      // console.log(`humidity ${Math.round(humid)}`);
      console.log(Math.round(temp));
      pubnubSingleton.publish(
        'tent:temperature',
        Math.round(temp),
        (callBackData) => {
          console.log(callBackData);
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
