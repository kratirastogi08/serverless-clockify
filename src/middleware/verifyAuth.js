const jwt = require("jsonwebtoken");
const {HTTP_STATUS_CODE,MESSAGES}=require("../utilities/constant")
const {ErrorResponse}=require("../utilities/errorResponse")
const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
      const policyDocument = {};
      policyDocument.Version = '2012-10-17';
      policyDocument.Statement = [];
      const statementOne = {};
      statementOne.Action = 'execute-api:Invoke';
      statementOne.Effect = effect;
      statementOne.Resource = resource;
      policyDocument.Statement[0] = statementOne;
      authResponse.policyDocument = policyDocument;
    }
    return authResponse;
  }
module.exports.auth = (event, context, callback) => {

    // check header or url parameters or post parameters for token
    try{
        const token = event.authorizationToken;
        console.log(token,"token")
        if (!token)
        
          return callback(null, {statusCode:401,message:'Unauthorized'});
      
        // verifies secret and checks exp
        jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
          console.log(error,"error")
            if (error) {
                switch (error.name) {
                    case "TokenExpiredError":
                        return callback(null,{ statusCode:HTTP_STATUS_CODE.UNAUTHORIZED,message: MESSAGES.TOKEN_EXPIRED})
                    case "JsonWebTokenError":
                      console.log(error.message,"msg")
                       return callback(
                            null,
                            {
                                statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
                                message: MESSAGES.INVALID_TOKEN
                            }                        
                        );
                        
                }
                } 
          // if everything is good, save to request for use in other routes
          return callback(null, generatePolicy({userId:decoded.userId,workspaceId:decoded.workspaceId}, 'Allow', event.methodArn))
        });
    }
    catch(error)
    {
        return {
            statusCode:error.statusCode||500,
            body:JSON.stringify({
                statusCode:500,
                body:JSON.stringify({
                  message: "Internal server error" 
                })
            })
        }
    }
  
  };
