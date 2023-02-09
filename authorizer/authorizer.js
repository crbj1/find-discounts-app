import { CognitoJwtVerifier } from "aws-jwt-verify";
const COGNITO_USERPOOL_ID = process.env.COGNITO_USERPOOL_ID;
const COGNITO_WEB_CLIENT_ID = process.env.COGNITO_WEB_CLIENT_ID;

const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: COGNITO_USERPOOL_ID,
    tokenUse: "id",
    clientId: COGNITO_WEB_CLIENT_ID
});

const generatePolicy = (principalId, effect, resource) => {
    var tmp = resource.split(':');
    var apiGatewayArnTmp = tmp[5].split('/');
    var resource = tmp[0] + ":" + tmp[1] + ":" + tmp[2] + ":" + tmp[3] + ":" + tmp[4] + ":" + apiGatewayArnTmp[0] + '/*/*';
    var authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        let policyDocument = {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: effect,
                    Resource: resource,
                    Action: "execute-api:Invoke"
                }
            ]
        };
        authResponse.policyDocument = policyDocument;
    }
    authResponse.context = {
        foo: "bar"
    };
    return authResponse;
};

export async function handler(event, context, callback) {
    //lambda authorizer code
    var token = event.authorizationToken;
    // Validate the token
    try {
        const payload = await jwtVerifier.verify(token);
        callback(null, generatePolicy("user", "Allow", event.methodArn));
    } catch (err) {
        callback("Error: Invalid token");
    }
}