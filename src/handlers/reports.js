const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const connectToDatabase = require("../config/database")
const { ErrorResponse } = require("../utilities/errorResponse")
const { Op } = require('@sequelize/core')
const { QueryTypes } = require('sequelize');
const _ = require("lodash"); 
const moment = require('moment');
const {convertMsToTime}=require('../utilities/helper')


module.exports.summary=middy(async(event,context)=>{
    context.callbackWaitsForEmptyEventLoop = false;
    try{
     const {TimeSheet,sequelize,Tag}=await connectToDatabase()
     
     const { workspaceId } = event.requestContext.authorizer.principalId
     const filterArr=[]
     const include=[]
     let users=JSON.parse(((event || {}).queryStringParameters || {}).users) || []
     let projects=JSON.parse(((event || {}).queryStringParameters || {}).projects) || []
     let clients=JSON.parse(((event || {}).queryStringParameters || {}).clients) || []
     let tasks=JSON.parse(((event || {}).queryStringParameters || {}).tasks) || []
     let tags=JSON.parse(((event || {}).queryStringParameters || {}).tags) || []
     let description=((event || {}).queryStringParameters || {}).description || null
     let status=((event || {}).queryStringParameters || {}).status || null
        if(users.length)
        {  
          filterArr.push({
            user_id:{[Op.in]:users}
          })
        }
        if(projects.length)
        {  const arr=[]
            
            if(projects.includes("without"))
            {
                arr.push({
                    project_id:null
                })
               projects= projects.filter(p=>p!=="without")
            }
            arr.push({
                project_id:projects
            })
            filterArr.push({
                [Op.or]:arr
            })
        }
        
        if(clients.length)
        {   
            const arr=[]
            if(clients.includes("without"))
            {
                arr.push({
                    client_id:null
                })
               clients= clients.filter(p=>p!=="without")
            }
            arr.push({
                client_id:clients
            })
            filterArr.push({
                [Op.or]:arr
            })
        }
       
        if(tasks.length)
        {  
            const arr=[]
            if(tasks.includes("without"))
            {
                arr.push({
                    task_id:null
                })
               tasks= tasks.filter(p=>p!=="without")
            }
            arr.push({
                task_id:tasks
            })
            filterArr.push({
                [Op.or]:arr
            })
        }
       
        if(tags.length)
        {  
            const arr=[]
            if(tags.includes("without"))
            {
                arr.push({
                    'tags.tag_id':null
                })
               tags= tags.filter(p=>p!=="without")
            }
            arr.push({
                'tags.tag_id':tags
            })
            filterArr.push({
                [Op.or]:arr
            })
            include.push({
                model: Tag,
                as:"tags",
                required:true,
                attributes:[]
            })
        }
     
    const data=await TimeSheet.findAll({
       where:{
        [Op.and]:[
            {workspace_id:workspaceId},
            ...filterArr
        ]
    },
    })
    return {
        statusCode:200,
        body:JSON.stringify({
            data
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