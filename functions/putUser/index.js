const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' });

exports.handle = function(e, ctx, cb) {
  const params = {
    Item: {
      phone: e.from,
      pet: e.pet,
      lastAction: e.lastAction,
      hunger: e.hunger
    },
    TableName: 'users'
  };

  return docClient.put(params, cb);
}
