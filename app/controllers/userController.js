const Redis = require('ioredis');
const redis = new Redis();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const AWS = require('aws-sdk');
const uuid = require('uuid');

AWS.config.update({
  region: 'enter_your_region', 
  accessKeyId: 'enter_your_id', 
  secretAccessKey: 'enter_your_key' 
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const tableName = 'demo'; 

exports.getUser = async (req, res) => {
  const params = {
    TableName: tableName
  };

  try {
    const users = await dynamoDB.scan(params).promise();
    res.json(users.Items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createUser = async (req, res) => {
  const { username, email, password } = req.body;
  const userId = uuidv4();

  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if the user already exists in the cache
  const cachedUser = await redis.get(userId.toString());

  if (cachedUser) {
    // If user exists in the cache, return cached data
    return res.status(200).json(JSON.parse(cachedUser));
  }

  const params = {
    TableName: tableName,
    Item: {
      id: userId,
      username: username,
      email: email,
      password: hashedPassword
    }
  };

  console.log("params", params);

  try {
    // Save user data to DynamoDB
    await dynamoDB.put(params).promise();

    // Save user data to Redis cache with a TTL of 60 seconds (adjust as needed)
    await redis.set(userId.toString(), JSON.stringify(params.Item), 'EX', 60);
    res.status(201).json(params.Item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
console.log("req", req.body);
  // Query DynamoDB to find the user by email
  const params = {
    TableName: tableName,
    IndexName: 'email', // Assuming you have an index on the 'email' attribute
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  };
  console.log("params", params)

  try {
    const result = await dynamoDB.query(params).promise();

    if (result.Items.length === 0) {
      // User not found
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare the entered password with the hashed password from the database
    const user = result.Items[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Passwords do not match
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Passwords match, user is authenticated
    res.json({ message: 'Login successful', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
