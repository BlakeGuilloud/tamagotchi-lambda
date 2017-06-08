const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' });

exports.handle = function(e, ctx, cb) {
  const params = {
    Key: {
      phone: e.from,
    },
    UpdateExpression: 'set lastAction=:lastAction, hunger=:hunger',
    ExpressionAttributeValues: {
      ':lastAction': e.lastAction,
      ':hunger': e.hunger,
    },
    TableName: 'users',
    ReturnValues: 'UPDATED_NEW'
  };

  return docClient.update(params, cb);
}
