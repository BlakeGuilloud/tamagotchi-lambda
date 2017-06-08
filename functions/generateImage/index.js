const AWS = require('aws-sdk');
const s3Bucket = new AWS.S3({ params: { Bucket: 'blake-images' } });
const Identicon = require('identicon.js');

exports.handle = function(e, ctx, cb) {
  const icon = new Identicon(`${e.from}${e.pet}${e.lastAction}`, 420).toString();

  const buf = new Buffer(icon.replace(/^data:image\/\w+;base64,/, ''),'base64');

  const data = {
    Key: e.from,
    Body: buf,
    ContentEncoding: 'base64',
    ContentType: 'image/jpeg',
    ACL: 'public-read'
  };

  return s3Bucket.putObject(data, cb);
}
