'use strict';
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
        body: JSON.stringify(data)
    };
}

module.exports.createUser = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false; //when callback is called, it is immediately executed
    let data = JSON.parse(event.body);
    try {
        const params = {
            TableName: USER_TABLE_NAME,
            Item: {
                userId: data.id,
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