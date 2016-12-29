
const climateModule = require('./modules/climate');
const relayModule = require('./modules/relay');
const time = require('./util/time');

time.setup();
climateModule.startReading();
relayModule.startReading();
