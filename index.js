'use strict';
const climateModule = require('./modules/climate');
const relayModule = require('./modules/relay');
climateModule.startReading();
relayModule.startReading();
