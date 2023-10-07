const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const connectToDatabase = require("../config/database")
const { ErrorResponse } = require("../utilities/errorResponse")
const { Op } = require('@sequelize/core')
const _ = require("lodash"); 
const moment = require('moment');
const {convertMsToTime}=require('../utilities/helper')

module.exports.dashboard=middy(async(event,context)=>{
    context.callbackWaitsForEmptyEventLoop = false;
    try{

    }
    catch(error)
    {
        let err = error;
        // if error not thrown by us
        if (!(err instanceof ErrorResponse)) {
          console.error(err);
          err = new ErrorResponse();
        }
        return err;
    }
}).use(jsonBodyParser())
.use(httpErrorHandler())