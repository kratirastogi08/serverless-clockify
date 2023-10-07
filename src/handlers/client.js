const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const connectToDatabase = require("../config/database")
const { ErrorResponse } = require("../utilities/errorResponse")
const { Op } = require('@sequelize/core')
const _ = require("lodash"); 
module.exports.createClient=middy(async (event,context)=>{
    context.callbackWaitsForEmptyEventLoop = false;
    try{
     const { workspaceId } = event.requestContext.authorizer.principalId
     const {Client}= await connectToDatabase()
     const {client_name}=event.body;
     const exists= await Client.findOne({
      where:{
        client_name
      }
     })
     if(exists)
     {
      throw new ErrorResponse("Client name already exists", 409)
     }
     const client= await Client.create({
        ...event.body,
        workspace_id:workspaceId
     })
     return {
      statusCode: 201,
      body:JSON.stringify({
        data:client
      })
     }
    }
    catch(error)
    {
        let err = error;
        if (!(err instanceof ErrorResponse)) {
          console.error(err);
          err = new ErrorResponse();
        }
        return err;
    }
}).use(jsonBodyParser())
.use(httpErrorHandler())

module.exports.clientList=middy(async (event,context)=>{
  context.callbackWaitsForEmptyEventLoop = false;
  try{
    const { workspaceId } = event.requestContext.authorizer.principalId
    const {Client} =await connectToDatabase()
    let is_active=((event || {}).queryStringParameters || {}).is_active || null
    let search_term=((event || {}).queryStringParameters || {}).search_term || null
    const filter={}
    if(is_active)
    {
      filter['is_active']=is_active
    }
    if(search_term)
    {
      filter['client_name']={[Op.iLike]:`%${search_term}%`}
    }
    const clients=await Client.findAll({
      where:{
        workspace_id: workspaceId,
        ...filter
      },
      raw:true
    })
    console.log(clients)
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: clients
      })
    }
  }
  catch(error)
  {
    let err = error;
    if (!(err instanceof ErrorResponse)) {
      console.error(err);
      err = new ErrorResponse();
    }
    return err;
  }
}).use(jsonBodyParser())
.use(httpErrorHandler())

module.exports.updateClient=middy(async (event,context)=>{
  context.callbackWaitsForEmptyEventLoop = false;
  try{
     const {client_id}= event.pathParameters;
     const { workspaceId } = event.requestContext.authorizer.principalId
     const {Client}=await connectToDatabase()
     await Client.update({
      ...event.body
     },{
      where:{
        client_id,
        workspace_id: workspaceId
      }
     })
     return {
      statusCode: 201,
      body: JSON.stringify({
        message:"Update"
      })
     }
  }
  catch(error)
  {
    let err = error;
    if (!(err instanceof ErrorResponse)) {
      console.error(err);
      err = new ErrorResponse();
    }
    return err;
  }
}).use(jsonBodyParser())
.use(httpErrorHandler())

module.exports.clientwiseProjectList=middy(async (event,context)=>{
  context.callbackWaitsForEmptyEventLoop = false;
  try{
    const { workspaceId } = event.requestContext.authorizer.principalId
    const {sequelize}=await connectToDatabase()
    const clients= await sequelize.query(`select p.project_id,p.project_name,c.client_id,c.client_name,t.task_id,t.task_name from "Project" as p LEFT JOIN "Client" as c ON p.client_id=c.client_id LEFT JOIN "Task" as t ON p.project_id=t.project_id where p.workspace_id=${workspaceId}`     
    )
   const data= _.groupBy(clients[0],"client_id")
   const grouping=[]
  Object.keys(data).map(e=>{
    const projectGrouping=data[e];
    const d=  _.groupBy(projectGrouping,"project_id")
    const projects=[]
    Object.keys(d).map(o=>{
       const taskGrouping=d[o]
       const tasks=[]
       taskGrouping.forEach(t=>{
        if(t?.task_id)
        {
          tasks.push({
            task_id:t?.task_id,
            task_name:t?.task_name
          })
        }       
       })
       projects.push({
          project_id:o,
          project_name:taskGrouping[0].project_name,
          tasks:tasks.length?tasks:null
       })
    })
    grouping.push({
      client_id:e,
      client_name:projectGrouping[0]?.client_name??"without client",
      projects
    })
    
   })
    return {
      statusCode:200,
      body: JSON.stringify({
        data:grouping
      })
    }
    
  }
  catch(error)
  {
    let err = error;
    if (!(err instanceof ErrorResponse)) {
      console.error(err);
      err = new ErrorResponse();
    }
    return err;
  }
}).use(jsonBodyParser())
.use(httpErrorHandler())