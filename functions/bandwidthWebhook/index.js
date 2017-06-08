const AWS = require('aws-sdk');
const region = 'us-west-2';
const docClient = new AWS.DynamoDB.DocumentClient({ region });
const lambda = new AWS.Lambda({ region });

function recordInput(tableName, text, { e, ctx, cb }) {
  const event = {
    name: text,
    tableName,
  };
  const recordInputPayload = {
    FunctionName: 'Tamagotchi_recordInput',
    Payload: JSON.stringify(event, ctx, cb)
  };

  return lambda.invoke(recordInputPayload, cb);
}

function generatePetName() {
  const names = ['Drog', 'Fog', 'Thog', 'Knog', 'Pog', 'Monster', 'Micket', 'Ticket', 'Wicket', 'Pix', 'Pash', 'Monk', 'Tunk', 'Thunk', 'Meep', 'Beek', 'Winston', 'Jam', 'Tham'];
  
  const idx = Math.floor((Math.random() * names.length - 1) + 1);

  return names[idx];
}

function handleCreateResponse(e, ctx, cb, user) {
  const event = {
    to: user.phone,
    text: `Hello!! Would you like to learn about your new pet, ${user.pet}?`,
  };

  const sendMessagePayload = {
    FunctionName: 'Tamagotchi_bandwidthSendMessage',
    Payload: JSON.stringify(event, ctx, cb)
  };

  return lambda.invoke(sendMessagePayload, (err, data) => {
    const putUserPayload = {
      FunctionName: 'Tamagotchi_updateUser',
      Payload: JSON.stringify({ from: user.phone, lastAction: 'receiveMessage', hunger: user.hunger }, ctx, cb)
    };

    return lambda.invoke(putUserPayload, cb);
  });
}

function handleFeedResponse(e, ctx, cb, user) {
  const food = e.text.split(' ').splice(1).join(' ');
  recordInput('foods', food, { e, ctx, cb });

  const hunger = user.hunger === 0 ? 0 : user.hunger - 1;

  const putUserPayload = {
    FunctionName: 'Tamagotchi_updateUser',
    Payload: JSON.stringify({ hunger, from: user.phone, lastAction: 'feed' }, ctx, cb)
  };

  return lambda.invoke(putUserPayload, (err, data) => {
    const event = {
      to: user.phone,
      text: `Great! ${user.pet} has a hunger level of ${JSON.parse(data.Payload).Attributes.hunger}. Thanks for the ${food}!`,
    };

    const sendMessagePayload = {
      FunctionName: 'Tamagotchi_bandwidthSendMessage',
      Payload: JSON.stringify(event, ctx, cb)
    };

    return lambda.invoke(sendMessagePayload, cb);
  });
}

function handleSpeakResponse(e, ctx, cb, user) {}

function handleDefaultResponse(e, ctx, cb, user) {
  const event = {
    to: user.phone,
    text: `${user.pet} has a hunger level of ${user.hunger}. Don't let it get to 10! Try feeding it something. Ex: Feed Apple`,
  };

  const sendMessagePayload = {
    FunctionName: 'Tamagotchi_bandwidthSendMessage',
    Payload: JSON.stringify(event, ctx, cb)
  };

  return lambda.invoke(sendMessagePayload, cb);
}

function respondWithStatus(err, data, { e, ctx, cb }) {
  const user = JSON.parse(data.Payload).Item;
  const text = e.text.toLowerCase();

  if (user.lastAction === 'create') {
    return handleCreateResponse(e, ctx, cb, user);
  } else if (text.includes('feed')) {
    return handleFeedResponse(e, ctx, cb, user);
  } else if (text.includes('speak')) {
    return handleSpeakResponse(e, ctx, cb, user);
  } else {
    return handleDefaultResponse(e, ctx, cb, user);
  }
}

function handleUserPayload(err, data, args) {
  const user = JSON.parse(data.Payload).Item;

  if (!user) {
    const event = {
      from: args.e.from,
      pet: generatePetName(),
      lastAction: 'create',
      hunger: 5,
      // Define all pet attributes here
    };

    const putUserPayload = {
      FunctionName: 'Tamagotchi_putUser',
      Payload: JSON.stringify(event, args.ctx, args.cb)
    };

    return lambda.invoke(putUserPayload, (err, data) => {
      const getUserByPhonePayload = {
        FunctionName: 'Tamagotchi_getUserByPhone',
        Payload: JSON.stringify(args.e, args.ctx, args.cb)
      };

      return lambda.invoke(getUserByPhonePayload, (err, data) =>
        handleUserPayload(err, data, args));
    });
  } else {
    // Respond with current status of pet.
    return respondWithStatus(err, data, args);
  }
}


exports.handle = function(e, ctx, cb) {
  const getUserByPhonePayload = {
    FunctionName: 'Tamagotchi_getUserByPhone',
    Payload: JSON.stringify(e, ctx, cb)
  };

  return lambda.invoke(getUserByPhonePayload, (err, data) =>
    handleUserPayload(err, data, { e, ctx, cb }));
}
