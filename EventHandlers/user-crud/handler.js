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
            "Access-Control-Allow-Origin": "http://localhost:4200",
            "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify(data)
    };
}

module.exports.createUser = async (event, context) => {

    let data = JSON.parse(event.body);
    try {

        // will add email as a single entry so you can't repeat emails
        const params2 = {
            TableName: USER_TABLE_NAME,
            Item: {
                userId: data.email
            },
            ConditionExpression: "attribute_not_exists(userId)"
        };
        await documentClient.put(params2).promise();

        const uniqueRandomID = uuid.v4(); //create random id for user
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

        return send(201, data);

    } catch (err) {

        return send(500, err.message);

    }
};

module.exports.updateUser = async (event, context) => {
    
    let userId = event.pathParameters.id;
    let data = JSON.parse(event.body);
    try {
        const params = {
            TableName: USER_TABLE_NAME,
            Key: { userId },
            UpdateExpression: 'set #firstName = :firstName, #lastName = :lastName, #dateOfBirth = :dateOfBirth, #streetAddress1 = :streetAddress1, #streetAddress2 = :streetAddress2, #city = :city, #state = :state, #zipCode = :zipCode',
            ExpressionAttributeNames: {
                '#firstName': 'firstName',
                '#lastName': 'lastName',
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
        return send(200, data);
    } catch (err) {
        return send(500, err.message);
    }
};

module.exports.deleteUser = async (event, context) => {
    let userId = event.pathParameters.id;
    let data = JSON.parse(event.body);
    try {

        const params = {
            TableName: USER_TABLE_NAME,
            Key: { userId },
            ConditionExpression: 'attribute_exists(userId)'
        };
        await documentClient.delete(params).promise();

        const params2 = {
            TableName: USER_TABLE_NAME,
            Key: { userId: data.email },
            ConditionExpression: 'attribute_exists(userId)'
        };
        await documentClient.delete(params2).promise();

        return send(200, userId);

    } catch (err) {
        return send(500, err.message);
    }
};

module.exports.getUser = async (event, context) => {
    let userId = event.pathParameters.id;
    try {
        const params = {
            TableName: USER_TABLE_NAME,
            Key: { userId },
            ConditionExpression: 'attribute_exists(userId)'
        };
        const user = await documentClient.get(params).promise();
        return send(200, user);
    } catch (err) {
        return send(500, err.message);
    }
};

module.exports.getAllUsers = async (event, context) => {
    try {
        const params = {
            TableName: USER_TABLE_NAME
        };
        const users = await documentClient.scan(params).promise();
        return send(200, users);
    } catch (err) {
        return send(500, err.message);
    }
};