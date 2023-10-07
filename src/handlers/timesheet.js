const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const connectToDatabase = require("../config/database")
const { ErrorResponse } = require("../utilities/errorResponse")
const { Op } = require('@sequelize/core')
const _ = require("lodash"); 
const moment = require('moment');
const {convertMsToTime}=require('../utilities/helper')

module.exports.createTimesheet=middy(async(event,context)=>{
    context.callbackWaitsForEmptyEventLoop = false;
    const {TimeSheet,Project,TimesheetTags,sequelize}=await connectToDatabase()
    const t = await sequelize.transaction();
    try{
   
    const { workspaceId ,userId} = event.requestContext.authorizer.principalId
    const {project_id,tag_ids,...rest}=event.body;
    
    let project=null
    if(project_id)
    {
         project= await Project.findOne({
            where:{
                project_id
            },
            raw:true
        })
    }
    
   const timesheet= await TimeSheet.create({
        workspace_id: workspaceId,
        ...rest,
        project_id,
        client_id:project?.client_id,
        user_id:userId
    },{ transaction: t })
    const timesheetTag=[]
    if(tag_ids)
     tag_ids.map(t=>{
       timesheetTag.push({
         timesheet_id:timesheet?.timesheet_id,
          tag_id:t
       })
     })
    await TimesheetTags.bulkCreate(timesheetTag,{ transaction: t })
    await t.commit();
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Success"
        })
    }
    }
    catch(error)
    {   await t.rollback();
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

module.exports.timesheetList=middy(async(event,context)=>{
    context.callbackWaitsForEmptyEventLoop = false;
    try{
        const { workspaceId ,userId} = event.requestContext.authorizer.principalId
        const {TimeSheet,sequelize,Project,Client,Task,Tag}=await connectToDatabase()
        let data=await TimeSheet.findAll({
            where:{
                workspace_id:workspaceId,
                user_id: userId
            },
            attributes:[[sequelize.literal(`extract('isoyear' from work_date)`),"year"],[sequelize.literal(`EXTRACT('WEEK' FROM work_date)`),"weekno"]],
            group:["year","weekno"],
            raw:true
        })
       let timesheet= await TimeSheet.findAll({
            where:{
                workspace_id:workspaceId,
                user_id: userId  
            },
            include:[
                {
                   model:Project,
                   attributes:['project_id','project_name']
                },
                {
                    model:Client,
                    attributes:['client_id','client_name']
                 },
                 {
                    model:Task,
                    attributes:['task_id','task_name']
                 },
                 {
                    model:Tag,
                    as:"tags",
                    attributes:["tag_id","tag_name"],
                    through:{
                        attributes:[]
                    }
                 }

            ],
        })
        
        timesheet= JSON.parse(JSON.stringify(timesheet))
        data=data.map((d)=>{
            const startDate=moment().day("Monday").isoWeekYear(d.year).isoWeek(d.weekno)
            const endDate=moment(startDate).add(6, 'days')
            let weeklyData= timesheet.filter(t=>moment(t.work_date).isoWeek()==d.weekno && moment(t.work_date).isoWeekYear()==d.year)
          weeklyData=weeklyData.map((e)=>{
              const ms=moment.duration(moment(e.end_time).diff(moment(e.start_time))).asMilliseconds()
              const hours= convertMsToTime(ms)              
              return {
                ...e,
                millisec:ms,
                hours
              }
            })
          const totalMs=_.sumBy(weeklyData, function(o) { return o.millisec; });
          const totalHours=convertMsToTime(totalMs)
          return {
            startDate:moment(startDate).format('MMMM Do YYYY'),
            endDate:moment(endDate).format('MMMM Do YYYY'),
            totalHours,
            weeklyData
          }
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
        // if error not thrown by us
        if (!(err instanceof ErrorResponse)) {
            console.error(err);
            err = new ErrorResponse();
        }
        return err;
    }
}).use(jsonBodyParser())
.use(httpErrorHandler())
