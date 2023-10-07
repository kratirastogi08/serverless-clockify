const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const connectToDatabase = require("../config/database")
const { ErrorResponse } = require("../utilities/errorResponse")
const { Op } = require('@sequelize/core')
module.exports.createProject = middy(async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        const { workspaceId, userId } = event.requestContext.authorizer.principalId
        const { Project } = await connectToDatabase()
        const { project_name } = event.body;
        const exists = await Project.findOne({
            where: {
                project_name
            }
        })
        if (exists) {
            throw new ErrorResponse("project name already exists")
        }
        const project = await Project.create({
            ...event.body,
            workspace_id: workspaceId,
            created_by: userId
        })
        return {
            statusCode: 201,
            body: JSON.stringify({
                data: project
            })
        }
    }
    catch (error) {
        let err = error;
        if (!(err instanceof ErrorResponse)) {
            console.error(err);
            err = new ErrorResponse();
        }
        return err;
    }
}).use(jsonBodyParser())
    .use(httpErrorHandler())
module.exports.projectList = middy(async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        let is_active=((event || {}).queryStringParameters || {}).is_active || null
        let is_billable=((event || {}).queryStringParameters || {}).is_billable || null
        let client_ids=((event || {}).queryStringParameters || {}).client_ids|| null
        let access_ids=((event || {}).queryStringParameters || {}).access_ids|| null
        let search_term=((event || {}).queryStringParameters || {}).search_term|| null
        let {Project,Client}=await connectToDatabase()
        const {workspaceId}=event.requestContext.authorizer.principalId
        let filterArr=[];
        if(is_active)
        {
          filterArr.push({is_active})
        }
        if(is_billable)
        {
            filterArr.push({is_billable})
        }
        if(client_ids)
        {    client_ids=JSON.parse(client_ids)
             let OrCondition=[]
            if(client_ids.includes("without"))
            {  client_ids=client_ids.filter(c=>c!=="without")
              OrCondition.push({client_id:null})
            }
            if(client_ids.length)
            {  
               OrCondition.push({client_id:{[Op.in]:client_ids}}) 
            }
            filterArr.push({
                [Op.or]:OrCondition
            })

        }
        if(access_ids)
        {  access_ids=JSON.parse(access_ids)
            filterArr.push({[Op.or]:[
                {created_by:{[Op.in]:access_ids}},
                {access_ids:{[Op.contains]:access_ids}}
            ]})
        }
        if(search_term)
        {
            filterArr.push({
                project_name:{[Op.iLike]:`%${search_term}%`}
            })
        }
       const projects= await Project.findAll({
            where:{
              [Op.and]:[
                {
                    workspace_id:workspaceId,
                },
                ...filterArr
              ] 
            },
            include:
                {
                    model: Client,
                    as: "client",
                    attributes:["client_id","client_name"]
                }
        })
        return {
            statusCode:200,
            body:JSON.stringify({
                message:"Success",
                data:projects
            })
        }
    }
    catch (error) {
        let err = error;
        if (!(err instanceof ErrorResponse)) {
            console.error(err);
            err = new ErrorResponse();
        }
        return err;
    }
}).use(jsonBodyParser())
    .use(httpErrorHandler())

module.exports.addMembersToProject = middy(async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        let { access_ids } = event.body;
        const { project_id } = event.pathParameters;
        const { Project } = await connectToDatabase()
        const access = await Project.findOne({
            where: {
                project_id
            },
            attributes: ['access_ids'],
            raw: true
        })

        access_ids = Array.from(new Set([...access_ids, ...access.access_ids]))
        console.log(access_ids)
        await Project.update({
            access_ids,
            visibility:false
        }, {
            where: {
                project_id
            }
        })
        return {
            statusCode: 200,
            body:JSON.stringify({
                message: "Success"
            })
        }
        
    }
    catch (error) {
        let err = error;
        if (!(err instanceof ErrorResponse)) {
            console.error(err);
            err = new ErrorResponse();
        }
        return err;
    }
}).use(jsonBodyParser())
    .use(httpErrorHandler())

module.exports.addMembersList=middy(async (event, context) =>{
    context.callbackWaitsForEmptyEventLoop = false;
    try{
        const { workspaceId } = event.requestContext.authorizer.principalId
        const {project_id}=event.pathParameters;
        const {UserWorkspace,Project,User}=await connectToDatabase()
        let users= await UserWorkspace.findAll({
            where:{
                workspace_id:workspaceId,
            },
            raw:true
        })
        
       users= users.map(u=>u.user_id)
       console.log(users)
       let access=  await Project.findOne({
        where:{
            project_id
        },
        attributes:['access_ids','created_by'],
        raw:true
       })
       console.log(access)
       access=Array.from(new Set([...access.access_ids,access.created_by]))
      users=users.filter(u=>{
            if(!access.includes(u))
                return u
       })
       console.log(users)
       const members=await User.findAll({
        where:{
            user_id:{
                [Op.in]:users
            }
        },
        raw:true
       })
       return {
        statusCode: 200,
        body: JSON.stringify({
           data:members   
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

module.exports.projectMembers=middy(async (event, context)=>{
    context.callbackWaitsForEmptyEventLoop = false;
    try{
       const {project_id}=event.pathParameters
       const {Project,User}=await connectToDatabase()
       const data=await Project.findOne({
        where:{
            project_id
        },
        attributes:['access_ids','created_by'],
        raw:true
       })
       const ids=[...data.access_ids,data.created_by]
      const users= await User.findAll({
        where:{
            user_id:{
                [Op.in]:ids
            }
        },
        attributes:['user_id','email_id']
       })
       return {
        statusCode:200,
        body:JSON.stringify({
            data:users,
            message:"Success"
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

module.exports.projectStatus=middy(async (event, context)=>{
    context.callbackWaitsForEmptyEventLoop = false;
    try{
   const {Task,User}=await connectToDatabase();
   let [track,task]=await Promise.all([getProjectTrackedStatus(event),getProjectTrackedTask(event)])
   const taskIds=task.map(t=>t.task_id)
   const tasks=await Task.findAll({
       where:{
        task_id:{[Op.in]:taskIds}
       },
       attributes:['task_id','task_name','assignee_ids'],
       raw:true
   })
   let assignee_ids=[]
   tasks.map(t=>
    {
         if(t.assignee_ids)
        assignee_ids.push(...Array.from(t.assignee_ids))
    }   
    )
   assignee_ids=Array.from(new Set([...assignee_ids]))
   const users=await User.findAll({
    where:{
       user_id:{[Op.in]:assignee_ids} 
    },
    attributes:['user_id','email_id']
   })
   console.log(users)
  task= task.map(t=>{
    const task=tasks.find(e=>e.task_id==t.task_id)
    console.log(task)
    const assignee= users.filter(u=>
    {   if(task?.assignee_ids)
       return task?.assignee_ids.includes(u.user_id)
    }  
    )
   return {
    ...t,
    task,
    assignee
   }
   })
   const result={tracked:track,task:task}
      return {
        statusCode: 200,
        body:JSON.stringify({
            data:result           
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

const getProjectTrackedStatus=async(event)=>{
    return new Promise(async (resolve,reject)=>{
        try{
        
            const { workspaceId } = event.requestContext.authorizer.principalId
            const {project_id}=event.pathParameters
            const {Project,TimeSheet,sequelize}=await connectToDatabase()
            let timesheet= await TimeSheet.findAll({
                where:{
                   workspace_id:workspaceId,
                   project_id
                },
                attributes:["timesheet_id","start_time","end_time","is_billable",[sequelize.literal(`extract(epoch from (end_time::timestamp - start_time::timestamp))`),"sec"]],
                include:{
                  model: Project,
                  attributes:["project_id","project_name","hourly_rate"]
                }
             })
             timesheet=JSON.parse(JSON.stringify(timesheet)) 
              let totalBillableHrs=0;
              let totalNonBillableHrs=0;
              let totalAmount=0
              timesheet.map(t=>{
                if(t.is_billable)
                {
                  const billableHours=Number(t.sec)/3600
                  const amount=billableHours*t?.Project?.hourly_rate
                  totalBillableHrs=totalBillableHrs+billableHours;
                  totalAmount=totalAmount+amount
                }
                else{
                    const nonbillableHours=Number(t.sec)/3600;
                    totalNonBillableHrs=totalNonBillableHrs+nonbillableHours
                }
              })
              const totalTrackedHrs=totalBillableHrs+totalNonBillableHrs;
              resolve({
                totalBillableHrs,
                totalNonBillableHrs,
                totalAmount,
                totalTrackedHrs
              }) 
            }
            catch(error){
                reject(error)
            }   
    })
    
}

const getProjectTrackedTask=async(event)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            const { workspaceId } = event.requestContext.authorizer.principalId
            const {project_id}=event.pathParameters
            let filter=((event || {}).queryStringParameters || {}).filter || null
            let filterObj={}
            let where={};
            if(filter)
            {
                switch(filter){
                    case "active":
                    filterObj["is_active"]=true
                    break;
                    case  "done":
                    filterObj["is_active"]=false
                    break;   
                }
                where['where']=filterObj
            }
            const {Project,TimeSheet,Task,sequelize}=await connectToDatabase()
           const task= await TimeSheet.findAll({
                where:{
                    workspace_id: workspaceId,
                    project_id
                },
                attributes:['task_id',[sequelize.literal(`(SUM(extract(epoch from (end_time::timestamp - start_time::timestamp))::INTEGER))/3600`),"tracked hrs"],[sequelize.literal(`(CASE WHEN "TimeSheet"."is_billable"=true THEN (SUM(extract(epoch from (end_time::timestamp - start_time::timestamp))::INTEGER))/3600 ELSE 0 END) * hourly_rate`),"amount"]],   
                group:[sequelize.col("TimeSheet.task_id"),sequelize.col("TimeSheet.is_billable"),'hourly_rate',sequelize.col("Task.is_active")],
                include:[{
                  model: Project,
                  attributes:['hourly_rate']
                },
                {
                    model: Task,
                    attributes:['is_active'],
                    ...where
                }
            ],
                raw:true
            })
            resolve(task);
        }
        catch(error)
        {
              reject(error)
        }
    })
    
}
