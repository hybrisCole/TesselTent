const PubNub = require('pubnub');
const pubnubRef = new PubNub({
  publishKey   : 'pub-c-53c4cd7d-bc10-46c6-842b-36d270ea44f7',
  subscribeKey : 'sub-c-0483cd26-04fc-11e6-bbd9-02ee2ddab7fe',
});

exports.publish = function publish (channel, message) {
  pubnubRef.publish({
    channel,
    message,
  });
};

exports.subscribe = function subscribe (channel, listener) {
  pubnubRef.subscribe({
    channels : [channel],
  });
  pubnubRef.addListener(listener);
};

exports.unsuscribe = function unsuscribe (channel) {
  pubnubRef.unsubscribe({
    channel : channel,
  });
};

exports.history = function history (opts, callback) {
  pubnubRef.history(opts, callback);
};
