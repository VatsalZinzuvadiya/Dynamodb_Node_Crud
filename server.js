// /server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./app/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', userRoutes);

// Add more routes as needed

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


  const AWS = require('aws-sdk');

  AWS.config.update({
    region: 'enter_your_region', 
    accessKeyId: 'enter_your_id', 
    secretAccessKey: 'enter_your_key' 
   });
  
  
  const dynamoDB = new AWS.DynamoDB();

const params = {
  TableName: 'Authentication',
  KeySchema: [
    { AttributeName: 'UserID', KeyType: 'HASH' }, // Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: 'UserID', AttributeType: 'S' }, 
    { AttributeName: 'Strategy', AttributeType: 'S' }, 
    { AttributeName: 'Identity', AttributeType: 'S' }, 
    { AttributeName: 'created_at', AttributeType: 'N' },
    { AttributeName: 'updated_at', AttributeType: 'N' }, 
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'StrategyIndex',
      KeySchema: [
        { AttributeName: 'Strategy', KeyType: 'HASH' },
        { AttributeName: 'Identity', KeyType: 'RANGE' },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
  ],
};

dynamoDB.createTable(params, (err, data) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Table created successfully:', data);
  }
});
