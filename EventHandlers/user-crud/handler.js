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

const USER_TABLE_NAME = process.env.USER_TABLE_NAME;

const send = (statusCode, data) => {
    return {
        statusCode,
        headers: {
            AccessControlAllowOrigin: [ 'http://localhost:4200']
        },
        body: JSON.stringify(data)
    };
}

module.exports.createUser = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false; //when callback is called, it is immediately executed
    let data = JSON.parse(event.body);
    try {
        const uniqueRandomID = uuid.v4();
        const params = {
            TableName: USER_TABLE_NAME,
            Item: {
                userId: uniqueRandomID,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                dateOfBirth: data.dateOfBirth,
                streetAddress1: data.streetAddress1,
                streetAddress2: data.streetAddress2,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode
            },
            ConditionExpression: "attribute_not_exists(userId)"
        };
        await documentClient.put(params).promise();
        callback(null, send(201, data));
    } catch (err) {
        callback(null, send(500, err.message));
    }
};

module.exports.updateUser = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let userId = event.pathParameters.id;
    let data = JSON.parse(event.body);
    try {
        const params = {
            TableName: USER_TABLE_NAME,
            Key: { userId },
            UpdateExpression: 'set #firstName = :firstName, #lastName = :lastName, #email = :email, #dateOfBirth = :dateOfBirth, #streetAddress1 = :streetAddress1, #streetAddress2 = :streetAddress2, #city = :city, #state = :state, #zipCode = :zipCode',
            ExpressionAttributeNames: {
                '#firstName': 'firstName',
                '#lastName': 'lastName',
                '#email': 'email',
                '#dateOfBirth': 'dateOfBirth',
                '#streetAddress1': 'streetAddress1',
                '#streetAddress2': 'streetAddress2',
                '#city': 'city',
                '#state': 'state',
                '#zipCode': 'zipCode'
            },
            ExpressionAttributeValues: {
                ':firstName': data.firstName,
                ':lastName': data.lastName,
                ':email': data.email,
                ':dateOfBirth': data.dateOfBirth,
                ':streetAddress1': data.streetAddress1,
                ':streetAddress2': data.streetAddress2,
                ':city': data.city,
                ':state': data.state,
                ':zipCode': data.zipCode
            },
            ConditionExpression: 'attribute_exists(userId)'
        };
        await documentClient.update(params).promise();
        callback(null, send(200, data));
    } catch (err) {
        callback(null, send(500, err.message));
    }
};

module.exports.deleteUser = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let userId = event.pathParameters.id;
    try {
        const params = {
            TableName: USER_TABLE_NAME,
            Key: { userId },
            ConditionExpression: 'attribute_exists(userId)'
        };
        await documentClient.delete(params).promise();
        callback(null, send(200, userId));
    } catch (err) {
        callback(null, send(500, err.message));
    }
};

module.exports.getUser = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let userId = event.pathParameters.id;
    try {
        const params = {
            TableName: USER_TABLE_NAME,
            Key: { userId },
            ConditionExpression: 'attribute_exists(userId)'
        };
        const user = await documentClient.get(params).promise();
        callback(null, send(200, user));
    } catch (err) {
        callback(null, send(500, err.message));
    }
};

module.exports.getAllUsers = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        const params = {
            TableName: USER_TABLE_NAME
        };
        const users = await documentClient.scan(params).promise();
        callback(null, send(200, users));
    } catch (err) {
        callback(null, send(500, err.message));
    }
};