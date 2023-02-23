'use strict';
const uuid = require('uuid');
const DynamoDB = require("aws-sdk/clients/dynamodb");

const documentClient = new DynamoDB.DocumentClient({
    region: "us-east-1",
    maxRetries: 3,
    httpOptions: {
        timeout: 5000
    }
});

const LOCATION_TABLE_NAME = process.env.LOCATION_TABLE_NAME;

const send = (statusCode, data) => {
    return {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": "http://localhost:4200",
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify(data)
    };
}

module.exports.createLocation = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false; //when callback is called, it is immediately executed
    let data = JSON.parse(event.body);
    try {
        const uniqueRandomID = uuid.v4();
        const params = {
            TableName: LOCATION_TABLE_NAME,
            Item: {
                locationId: uniqueRandomID,
                name: data.name,
                address: data.address,
                createdByRestUserId: data.createdByRestUserId
            },
            ConditionExpression: "attribute_not_exists(locationId)"
        };
        await documentClient.put(params).promise();
        callback(null, send(201, data));
    } catch (err) {
        callback(null, send(500, err.message));
    }
};

module.exports.updateLocation = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let locationId = event.pathParameters.id;
    let data = JSON.parse(event.body);
    try {
        const params = {
            TableName: LOCATION_TABLE_NAME,
            Key: { locationId },
            UpdateExpression: 'set #name = :name, #address = :address',
            ExpressionAttributeNames: {
                '#name': 'name',
                '#address': 'address'
            },
            ExpressionAttributeValues: {
                ':name': data.name,
                ':address': data.address
            },
            ConditionExpression: 'attribute_exists(locationId)'
        };
        await documentClient.update(params).promise();
        callback(null, send(200, data));
    } catch (err) {
        callback(null, send(500, err.message));
    }
};

module.exports.deleteLocation = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let locationId = event.pathParameters.id;
    try {
        const params = {
            TableName: LOCATION_TABLE_NAME,
            Key: { locationId },
            ConditionExpression: 'attribute_exists(locationId)'
        };
        await documentClient.delete(params).promise();
        callback(null, send(200, locationId));
    } catch (err) {
        callback(null, send(500, err.message));
    }
};

module.exports.getLocation = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let locationId = event.pathParameters.id;
    try {
        const params = {
            TableName: LOCATION_TABLE_NAME,
            Key: { locationId },
            ConditionExpression: 'attribute_exists(locationId)'
        };
        const location = await documentClient.get(params).promise();
        callback(null, send(200, location));
    } catch (err) {
        callback(null, send(500, err.message));
    }
};

module.exports.getAllLocations = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        const params = {
            TableName: LOCATION_TABLE_NAME
        };
        const locations = await documentClient.scan(params).promise();
        callback(null, send(200, locations));
    } catch (err) {
        callback(null, send(500, err.message));
    }
};