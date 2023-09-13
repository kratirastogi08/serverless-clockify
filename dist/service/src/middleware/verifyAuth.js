/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/middleware/verifyAuth.js":
/*!**************************************!*\
  !*** ./src/middleware/verifyAuth.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const jwt = __webpack_require__(/*! jsonwebtoken */ \"jsonwebtoken\");\r\nconst {HTTP_STATUS_CODE,MESSAGES}=__webpack_require__(/*! ../utilities/constant */ \"./src/utilities/constant.js\")\r\nconst {ErrorResponse}=__webpack_require__(/*! ../utilities/errorResponse */ \"./src/utilities/errorResponse.js\")\r\nconst generatePolicy = (principalId, effect, resource) => {\r\n    const authResponse = {};\r\n    authResponse.principalId = principalId;\r\n    if (effect && resource) {\r\n      const policyDocument = {};\r\n      policyDocument.Version = '2012-10-17';\r\n      policyDocument.Statement = [];\r\n      const statementOne = {};\r\n      statementOne.Action = 'execute-api:Invoke';\r\n      statementOne.Effect = effect;\r\n      statementOne.Resource = resource;\r\n      policyDocument.Statement[0] = statementOne;\r\n      authResponse.policyDocument = policyDocument;\r\n    }\r\n    return authResponse;\r\n  }\r\nmodule.exports.auth = (event, context, callback) => {\r\n\r\n    // check header or url parameters or post parameters for token\r\n    try{\r\n        const token = event.authorizationToken;\r\n        console.log(token,\"token\")\r\n        if (!token)\r\n        \r\n          return callback(null, {statusCode:401,message:'Unauthorized'});\r\n      \r\n        // verifies secret and checks exp\r\n        jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {\r\n          console.log(error,\"error\")\r\n            if (error) {\r\n                switch (error.name) {\r\n                    case \"TokenExpiredError\":\r\n                        return callback(null,{ statusCode:HTTP_STATUS_CODE.UNAUTHORIZED,message: MESSAGES.TOKEN_EXPIRED})\r\n                    case \"JsonWebTokenError\":\r\n                      console.log(error.message,\"msg\")\r\n                       return callback(\r\n                            null,\r\n                            {\r\n                                statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,\r\n                                message: MESSAGES.INVALID_TOKEN\r\n                            }                        \r\n                        );\r\n                        \r\n                }\r\n                } \r\n          // if everything is good, save to request for use in other routes\r\n          return callback(null, generatePolicy({userId:decoded.userId,workspaceId:decoded.workspaceId}, 'Allow', event.methodArn))\r\n        });\r\n    }\r\n    catch(error)\r\n    {\r\n        return {\r\n            statusCode:error.statusCode||500,\r\n            body:JSON.stringify({\r\n                statusCode:500,\r\n                body:JSON.stringify({\r\n                  message: \"Internal server error\" \r\n                })\r\n            })\r\n        }\r\n    }\r\n  \r\n  };\r\n\n\n//# sourceURL=webpack:///./src/middleware/verifyAuth.js?");

/***/ }),

/***/ "./src/utilities/constant.js":
/*!***********************************!*\
  !*** ./src/utilities/constant.js ***!
  \***********************************/
/***/ ((module) => {

eval("const HTTP_STATUS_CODE = {\r\n    OK: 200,\r\n    CREATED: 201,\r\n    UPDATED: 202,\r\n    CONFLICT:409,\r\n    NO_CONTENT: 204,\r\n    PARTIAL_CONTENT: 206,\r\n    BAD_REQUEST: 400,\r\n    UNAUTHORIZED: 401,\r\n    PAYMENY_REQUIRED: 402,\r\n    ACCESS_FORBIDDEN: 403,\r\n    URL_NOT_FOUND: 404,\r\n    METHOD_NOT_ALLOWED: 405,\r\n    NOT_ACCEPTABLE: 406,\r\n    UNREGISTERED: 410,\r\n    PAYLOAD_TOO_LARGE: 413,\r\n    SOCIAL_ACCOUNT_NOT_EXIST: 424,\r\n    CONCURRENT_LIMITED_EXCEEDED: 429,\r\n    EMAIL_NOT_VERIFIED: 432,\r\n    MOBILE_NUMBER_NOT_VERIFIED: 433,\r\n    USER_BLOCKED: 434,\r\n    USER_DELETED: 435,\r\n    INTERNAL_SERVER_ERROR: 500,\r\n    BAD_GATEWAY: 502,\r\n    SHUTDOWN: 503,\r\n    INTRO__VIDEO_ONE: 511,\r\n    INTRO__VIDEO_TWO: 512,\r\n    INTRO__VIDEO_THREE: 513, // not in use\r\n    PROFILE_AGE: 514,\r\n    PROFILE_GOAL: 515,\r\n    CHALLENGE_SCREEN: 516,\r\n    HOME_SCREEN: 517,\r\n  };\r\n  const MESSAGES = {\r\n    SIGNUP_SUCCESSFUL: \"User registered successfully\",\r\n    LOGIN_SUCCESSFUL: \"User logged in successfully\",\r\n    USER_REGISTERED_LOGIN:\r\n      \"User registered successfully. Please login to verify your account.\",\r\n    API_SUCCESS: \"Success\",\r\n    LOGOUT_SUCCESSFUL: \"User logged out successfully\",\r\n    PASSWORD_UPDATED: \"Password has been Updated!\",\r\n    FORGOT_PASSWORD: \"Reset link Sent on your mail\",\r\n    NOT_MATCHED: \"Not Matched Yet\",\r\n    DELETED: \"Deleted successfully.'\",\r\n    OTP_SENT: \"'Otp sent successfully'\",\r\n    EMAIL_VERIFIED: \"'Email successfully verified '\",\r\n    P_UPDATE: \" 'Profile update successfully'\",\r\n    UPDATE_EMAIL: \" 'Email update successfully'\",\r\n    TOKEN_EXPIRED: \"'Token Expired '\",\r\n    ALREADY_REGISTERED: \" 'An account has already been created.\",\r\n    REG_ALREADY_REGISTERED:\r\n      \"'An account has already been created with this registration number.'\",\r\n    UPDATE_ERROR: \" 'Error in updating data.'\",\r\n    API_ERROR: \" 'Error in Api Execution.'\",\r\n    VALIDATION_ERROR: \" 'Validation error.'\",\r\n    FAILED_TO_ADD: \" 'Failed to Add Data.'\",\r\n    INVALID_CREDENTIALS: \"'Invalid Credentials'\",\r\n    EMAIL_FAILURE: \" 'Email not sent.'\",\r\n    EMAIL_ALREADY_EXISTS: \" 'Email already exists.'\",\r\n    USER_NOT_FOUND: \" 'User Not Found'\",\r\n    UNAUTHORIZED: \"'Unauthorized Access.'\",\r\n    FAILED_TO_UPDATE: \"Failed to Update.\",\r\n    FAILED_TO_DELETE: \"'Failed to Delete Data.'\",\r\n    SOMETHING_WRONG: \"Something went wrong\",\r\n    INVALID_EMAIL: \"'invalid email id'\",\r\n    INVALID_OTP: \"'invalid otp'\",\r\n    SIGNUP_FAILED: \"'Your signUp failed'\",\r\n    EMAIL_NOT_VERIFIED: \"'Email is not verified'\",\r\n    INVALID_TOKEN: \"'Your token is invalid.'\",\r\n    EMAIL_v_FAILED: \"'Email verification is failed'\",\r\n    MISSING_TOKEN: \"'Missing token'\",\r\n    MISSING_P: \"'Missing parameter'\",\r\n    OTP_NOT_SEND: \"Otp not send successfully\",\r\n    OTP_EXPIRED: \"Otp has expired\",\r\n    NOT_FOUND: \"Data not found\",\r\n    TOTAL_LOGIN:\r\n      \"You've reached the maximum login limits. Please logout of other devices and login again.\",\r\n    WRONG_PASSWORD: \"'Incorrect password'\",\r\n    INVALID_ROUTE: \"Invalid route\",\r\n    MISSING_API_KEY: \"Missing API key\",\r\n    INVALID_API_KEY: \"Api key is invalid\",\r\n    USER_BLOCKED: \"User is blocked\",\r\n    OTP_VERIFIED: \" otp verified\",\r\n    UPDATED_SUCCESS: \"Updated successfully\",\r\n    OTP_INCORRECT: \"Otp incorrect\",\r\n    PHONE_NO_EXISTS: \"Phone number already exists\",\r\n    BAD_REQUEST: \"Bad request\",\r\n    INTERNAL_SERVER_ERROR:\"Internal Server Error\",\r\n    INVALID_HEADERS:\"Invalid columns\",\r\n    EMPTY_FILE:\"File is empty\",\r\n    MISSING_DATA:\"Missing data\",\r\n    DATA_ALREADY_EXISTS:\"Data already exist\",\r\n    INVALID_CREDENTIALS:\"Email or password did not match\",\r\n    USER_EXISTS:\"User already exixts\"\r\n  };\r\n  const ROLE={\r\n    ADMIN:1,\r\n    MEMBER:2\r\n  }\r\n  const PERMITTED_HEADERS=['FirstName','LastName','Email']\r\n  module.exports={\r\n    HTTP_STATUS_CODE,\r\n    MESSAGES,\r\n    ROLE,\r\n    PERMITTED_HEADERS\r\n  }\n\n//# sourceURL=webpack:///./src/utilities/constant.js?");

/***/ }),

/***/ "./src/utilities/errorResponse.js":
/*!****************************************!*\
  !*** ./src/utilities/errorResponse.js ***!
  \****************************************/
/***/ ((module) => {

eval(" class ErrorResponse {\r\n    constructor(\r\n      message = 'Something went wrong',\r\n      statusCode = 500,\r\n      data={}      \r\n    ) {\r\n      const body = JSON.stringify({ message,data });\r\n      this.statusCode = statusCode;\r\n      this.body = body;\r\n      this.headers = {\r\n        'Content-Type': 'application/json',\r\n      };\r\n    }\r\n  }\r\n\r\nmodule.exports= {\r\n    ErrorResponse\r\n  }\n\n//# sourceURL=webpack:///./src/utilities/errorResponse.js?");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("jsonwebtoken");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/middleware/verifyAuth.js");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;