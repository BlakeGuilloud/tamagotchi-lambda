const Bandwidth = require('node-bandwidth');

exports.handle = function(e, ctx, cb) {
  const client = new Bandwidth({
    userId: process.env.BANDWIDTH_USER_ID,
    apiToken: process.env.BANDWIDTH_TOKEN,
    apiSecret: process.env.BANDWIDTH_SECRET,
  });

  const body = {
    from: process.env.FROM_NUMBER,
    to: e.to,
    text: e.text,
    media: `https://s3-us-west-2.amazonaws.com/blake-images/%2B${e.from.slice(1, e.from.length)}`
  };

  client.Message.send(body)
    .then(message => cb(null, message))
    .catch(err => cb(err, null));
}
