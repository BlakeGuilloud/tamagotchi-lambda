const AWS = require('aws-sdk');
const region = 'us-west-2';
const docClient = new AWS.DynamoDB.DocumentClient({ region });

exports.handle = function(e, ctx, cb) {
  const params = {
    Key: {
      name: e.name
    },
    TableName: e.tableName
  };

  return docClient.get(params, (err, data) => {
    if (err) cb(err, data);

    const params = {
      Item: {
        name: e.name,
        count: data.Item ? data.Item.count + 1 : 1
      },
      TableName: e.tableName
    };

    return docClient.put(params, cb);
  });
}
