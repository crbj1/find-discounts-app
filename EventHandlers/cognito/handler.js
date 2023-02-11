'use strict';
const CognitoIdentityProviderClient = require("aws-sdk/clients/cognitoidentityserviceprovider");

const client = new CognitoIdentityProviderClient({
    region: "us-east-1",
    maxRetries: 3,
    httpOptions: {
        timeout: 5000
    }
});

const USER_POOL_ID = process.env.USER_POOL_ID;

const send = (statusCode, data) => {
    return {
        statusCode,
        body: JSON.stringify(data)
    };
}

module.exports.createCognitoUser = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false; //when callback is called, it is immediately executed
    let data = JSON.parse(event.body);
    try {
        const params = {
            UserPoolId: USER_POOL_ID,
            Username: data.email,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: data.email
                }
            ],
            TemporaryPassword: data.password,
            DesiredDeliveryMediums: [ EMAIL ]
        };
        const user = await client.adminCreateUser(params).promise();
        callback(null, send(201, user));
    } catch (err) {
        callback(null, send(500, err.message));
    }
};