const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const connectToDatabase = require("../config/database")
const { ErrorResponse } = require("../utilities/errorResponse")
const { Op } = require('@sequelize/core')

module.exports.createTag=middy(async (event, context)=>{
    context.callbackWaitsForEmptyEventLoop = false;
    try{
     const {Tag}=await connectToDatabase()
     const { workspaceId } = event.requestContext.authorizer.principalId
     const tag=await Tag.create({
        ...event.body,
        workspace_id:workspaceId
     })
     return {
        statusCode: 200,
        body: JSON.stringify({
            message:"Success",
            data:tag
        })
     }
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

module.exports.tagList=middy(async (event, context)=>{
    context.callbackWaitsForEmptyEventLoop = false;
    try{
     const {Tag}= await connectToDatabase()
     const { workspaceId } = event.requestContext.authorizer.principalId
     let is_active=((event || {}).queryStringParameters || {}).is_active || null
     let search_term=((event || {}).queryStringParameters || {}).search_term || null
     const filter={}
     if(is_active)
     {
      filter["is_active"]=is_active
     }
     if(search_term)
     {
      filter["tag_name"]={[Op.iLike]:`%${search_term}%`}
     }
    const tags= await Tag.findAll({
        where:{
          workspace_id: workspaceId,
          ...filter
        },
        raw:true
     })
      return {
        statusCode: 200,
        body: JSON.stringify({
            data: tags
        })
      }
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

module.exports.updateTag=middy(async (event, context)=>{
    context.callbackWaitsForEmptyEventLoop = false;
    try{
     const {tag_id}=event.pathParameters;
      const {Tag}=await connectToDatabase()
      await Tag.update({
        ...event.body
      },{
        where:{
            tag_id
        }
      })
      return {
        statusCode: 201,
        body: JSON.stringify({
            message: "Success"
        })
      }
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