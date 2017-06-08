const AWS = require('aws-sdk');
const region = 'us-west-2';
const docClient = new AWS.DynamoDB.DocumentClient({ region });

exports.handle = function(e, ctx, cb) {
  const params = {
    Key: {
      phone: e.from,
    },
    TableName: 'users'
  };

  return docClient.get(params, cb);
}
