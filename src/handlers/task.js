const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const connectToDatabase = require("../config/database")
const { ErrorResponse } = require("../utilities/errorResponse")
const { Op } = require('@sequelize/core')
const { ConsoleMessage } = require('puppeteer')


module.exports.createTask = middy(async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        const { project_id } = event.pathParameters
        const { userId } = event.requestContext.authorizer.principalId
        const { Task } = await connectToDatabase()
        await Task.create({
            ...event.body,
            project_id,
            created_by: userId
        })
        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Task created"
            })
        }
    }
    catch (error) {
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

module.exports.assignTaskToUsers = middy(async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        const { assignee_ids } = event.body;
        const { task_id } = event.pathParameters
        const { Task } = await connectToDatabase()
        await Task.update({
            assignee_ids
        }, {
            where: {
                task_id
            }
        })
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Task updated"
            })
        }
    }
    catch (error) {
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

module.exports.taskList = middy(async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        const {project_id}=event.pathParameters
        const { workspaceId } = event.requestContext.authorizer.principalId
        let is_active=((event || {}).queryStringParameters || {}).is_active || null
        let search_term=((event || {}).queryStringParameters || {}).search_term || null
        const filterObj={}
        if(is_active)
        {
         filterObj['is_active']=is_active
        }
        if(search_term)
        {
        filterObj['task_name']={[Op.iLike]:`%${search_term}%`}
        }
        const { Task,Project,UserWorkspace,User } = await connectToDatabase()
        let task= await Task.findAll({
            where:{
               project_id,
               ...filterObj
            },
            attributes:["assignee_ids",'task_id','task_name'],
            raw:true
        })
        const access = await Project.findOne({
            where: {
                project_id
            },
            attributes: ['access_ids', 'created_by', "visibility"]
        })
        let users = []
        if (access.visibility) {
            users = await UserWorkspace.findAll({
                where: {
                    workspace_id: workspaceId
                }
            })
            users = users.map(u => u.user_id)
        }
        else if (!access.visibility) {
            users = [...access.access_ids, access.created_by]
        }
        const userDetails = await User.findAll({
            where: {
                user_id: { [Op.in]: users }
            },
            attributes: ['user_id', 'email_id']
        })
        
       task=task.map(t=>{
           let assignee=t?.assignee_ids ?? [];
           users=users.filter(u=>!assignee.includes(u))
           const assigneeDetails=[];
           const nonAssigneeDetails=[]
           userDetails.forEach(u=>{
            if(assignee.includes(u.user_id))
            {
               assigneeDetails.push(u)
            }
            if(users.includes(u.user_id))
            {
             nonAssigneeDetails.push(u)
            }
           })
           delete t.assignee_ids
           t['assignee'] = assigneeDetails;
           t['nonAssignee']=nonAssigneeDetails
           return t;
        })
        return {
            statusCode: 200,
            body: JSON.stringify({
                 data:task
            })
        }

    }
    catch (error) {
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

module.exports.updateTaskStatus=middy(async (event, context)=>{
    context.callbackWaitsForEmptyEventLoop = false;
    try{
       const {Task}=await connectToDatabase()
       const {task_id}=event.pathParameters
       const {is_active}=event.body;
       await Task.update({
          is_active
       },{
         where: {
            task_id
         }
       })
       return {
        statusCode: 201,
        body: JSON.stringify({
            message: "Updated"
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