const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const connectToDatabase=require('../config/database')
module.exports.addRole=middy(async(event,context)=>{
    try{
      context.callbackWaitsForEmptyEventLoop = false;
      const {Role}=await connectToDatabase()
      const {roleName}=event.body;
      const role= await Role.create({
        role_name:roleName
      },{
        raw:true
      })
      return {
        statusCode: 200,
        body:JSON.stringify({
           message:"Role created",
           data:role
        })
      }
    }
    catch(error)
    {
        return {
            statusCode:error.statusCode,
            body:JSON.stringify({
              message:error.message
            })
          }
    }
}).use(jsonBodyParser())
.use(httpErrorHandler())