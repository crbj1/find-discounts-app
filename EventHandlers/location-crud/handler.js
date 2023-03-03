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
const FRONTEND_ANGULAR_APP_URL = process.env.FRONTEND_ANGULAR_APP_URL;

const send = (statusCode, data) => {
    return {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": FRONTEND_ANGULAR_APP_URL,
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify(data)
    };
}

module.exports.createLocation = async (event, context) => {
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
        return send(201, params.Item);
    } catch (err) {
        return send(500, err.message);
    }
};

module.exports.updateLocation = async (event, context) => {
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
        return send(200, data);
    } catch (err) {
        return send(500, err.message);
    }
};

module.exports.deleteLocation = async (event, context) => {
    let locationId = event.pathParameters.id;
    try {
        const params = {
            TableName: LOCATION_TABLE_NAME,
            Key: { locationId },
            ConditionExpression: 'attribute_exists(locationId)'
        };
        await documentClient.delete(params).promise();
        return send(200, locationId);
    } catch (err) {
        return send(500, err.message);
    }
};

module.exports.getLocation = async (event, context) => {
    let locationId = event.pathParameters.id;
    try {
        const params = {
            TableName: LOCATION_TABLE_NAME,
            Key: { locationId },
            ConditionExpression: 'attribute_exists(locationId)'
        };
        const location = await documentClient.get(params).promise();
        return send(200, location);
    } catch (err) {
        return send(500, err.message);
    }
};

module.exports.getAllLocations = async (event, context) => {
    try {
        const params = {
            TableName: LOCATION_TABLE_NAME
        };
        const locations = await documentClient.scan(params).promise();
        return send(200, locations);
    } catch (err) {
        return send(500, err.message);
    }
};