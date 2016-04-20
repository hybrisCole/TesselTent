const pubnub = require('pubnub');
const pubnubRef = pubnub.init({
  publish_key   : 'pub-c-53c4cd7d-bc10-46c6-842b-36d270ea44f7',
  subscribe_key : 'sub-c-0483cd26-04fc-11e6-bbd9-02ee2ddab7fe',
  error         : function (error) {
    console.log('Error:', error);
  },
});

exports.publish = function publish (channel, message, cb, err) {
  pubnubRef.publish({
    channel  : channel,
    message  : message,
    callback : cb,
    error    : err,
  });
};

exports.subscribe = function subscribe (channel, message, err) {
  pubnubRef.subscribe({
    channel : channel,
    message : message,
    error   : err,
  });
};

exports.unsuscribe = function unsuscribe (channel) {
  pubnubRef.unsubscribe({
    channel : channel,
  });
};
