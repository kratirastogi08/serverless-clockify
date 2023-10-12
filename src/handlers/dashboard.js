const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const connectToDatabase = require("../config/database")
const { ErrorResponse } = require("../utilities/errorResponse")
const { Op } = require('@sequelize/core')
const { QueryTypes } = require('sequelize');
const _ = require("lodash"); 
const moment = require('moment');
const {convertMsToTime,getDaysBwDtaes}=require('../utilities/helper')

module.exports.dashboard=middy(async(event,context)=>{
    context.callbackWaitsForEmptyEventLoop = false;
    try{
     const {startDate,endDate,type,access}=event.queryStringParameters;
     const { workspaceId, userId } = event.requestContext.authorizer.principalId
     const {TimeSheet,Project,Client,UserWorkspace,User,Task,sequelize}=await connectToDatabase()
     const days=moment(endDate).diff(moment(startDate),'days')+1;
     const where={}
     if(access==="me")
     {
      where['user_id']=userId
     }
    let timesheet= await TimeSheet.findAll({
         where:{
           work_date:{
            [Op.between]:[startDate,endDate]            
          },
           workspace_id:workspaceId,
           ...where
         },
         include:[
          {
            model:Project,
            include:{
              model: Client,
              as:'client'
            }
          },
          
         ]
     })
    timesheet=JSON.parse(JSON.stringify(timesheet))
    
    const allDays=getDaysBwDtaes(startDate,endDate)
    const dates=Array.from(new Set(timesheet.map(t=>t.work_date)))
    allDays.forEach(d=>{
      if(!dates.includes(d))
      {
        timesheet.push({work_date:d})
      }
    })
    timesheet.sort((a,b)=>{
      return new Date(a.work_date)-new Date(b.work_date)
    })
    let data=[];
    const conditionalFun=[
      ()=>{
        if(days<365)
        {
          return daywise(timesheet,type)
        }
        else
        {
          return yearwise(timesheet,type)
        }
      },
      ()=>{
         return pieChart(timesheet,type)
      },
      ()=>{
        if(access==="team")
        {
          return latestActivity(workspaceId,timesheet,User,UserWorkspace,sequelize)
        }
        else if(access==="me")
        {
          return mostTracked(startDate,endDate,workspaceId,where)
        }
      }
    ]
   data=await Promise.all(conditionalFun.map(fun=>fun()))   
     return {
      statusCode: 200,
      body:JSON.stringify({
        data:{
          barchart:data[0],
          piechart:data[1],
          latestActivity:access==="team"?data[2]:undefined,
          mostTracked:access==="me"?data[2]:undefined
        }
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

const daywise=(timesheet,type)=>{
  return new Promise((resolve,reject)=>{
    try{
  
      const result=_.groupBy(timesheet,'work_date')
      const arr=[];
      switch(type){
        case 'billability':
        Object.keys(result).map(e=>{
          const data= result[e]
        const billableSeconds=  _.sumBy(data,(obj)=>{
            return obj?.is_billable?moment(obj.end_time).diff(moment(obj.start_time),'seconds'):0
          })
          const nonbillableSeconds= _.sumBy(data,(obj)=>{
            return !obj?.is_billable?moment(obj.end_time).diff(moment(obj.start_time),'seconds'):0
          })
          const billableHours=convertMsToTime(billableSeconds*1000)
          const nonbillableHours=convertMsToTime(nonbillableSeconds*1000)
          const billableHoursInDec=billableSeconds/3600;
          const totalSeconds=billableSeconds+nonbillableSeconds;
          const billablePercent=(billableSeconds/totalSeconds)*100;
          const nonbillablePercent=(nonbillableSeconds/totalSeconds)*100;
          arr.push({
            date:e,
            billableSeconds,
            nonbillableSeconds,
            billableHoursInDec,
            billableHours,
            nonbillableHours,
            billablePercent,
            nonbillablePercent,
            totalSeconds
          })
        })
          break;
        case 'project':
          Object.keys(result).map(e=>{
             const data=result[e]
             const totalSeconds=_.sumBy(data,(o)=>{
                          return moment(o?.end_time).diff(moment(o?.start_time),'seconds')
                         })
             const projectGrouping= _.groupBy(data,'project_id')
             const projectArr=[]
             Object.keys(projectGrouping).filter(r=>r!=='undefined').map(p=>{
              console.log(p)
              const res=projectGrouping[p]
              const seconds=  _.sumBy(res,(obj)=>{
                  return moment(obj?.end_time).diff(moment(obj?.start_time),'seconds')
                })
                const hrsInDec=seconds/3600;
                const hrs=convertMsToTime(seconds*1000)
                const sharePercent=(seconds/totalSeconds)*100;
                projectArr.push({
                    project_id:res[0]?.project_id,
                    project_name:res[0]?.Project?.project_name??"without project",
                    client:res[0]?.Project?.client,
                    hrsInDec,
                    hrs,
                    seconds,
                    sharePercent
                })
             })
             arr.push({
                date: e,
                projects:projectArr 
             })
          })
          break;
      }
      return resolve(arr);
    }
    catch(error)
    {
        reject(error);
    }
  })
}
const yearwise=(timesheet,type)=>{
  return new Promise((resolve,reject)=>{
    try{
      const result= _.groupBy(timesheet,(o)=>{
        return moment(o.work_date).format('MMMM')
      })
      const arr=[]
      switch(type){
        case 'billability':
          Object.keys(result).map(e=>{
            const res= result[e]
            const billableSeconds=  _.sumBy(res,(obj)=>{
              return obj?.is_billable?moment(obj.end_time).diff(moment(obj.start_time),'seconds'):0
            })
            const nonbillableSeconds= _.sumBy(res,(obj)=>{
              return !obj?.is_billable?moment(obj.end_time).diff(moment(obj.start_time),'seconds'):0
            })
          const billableHours=convertMsToTime(billableSeconds*1000)
          const nonbillableHours=convertMsToTime(nonbillableSeconds*1000)
          const billableHoursInDec=billableSeconds/3600;
          const totalSeconds=billableSeconds+nonbillableSeconds;
          const billablePercent=(billableSeconds/totalSeconds)*100;
          const nonbillablePercent=(nonbillableSeconds/totalSeconds)*100;
          arr.push({
            date:e,
            billableSeconds,
            nonbillableSeconds,
            billableHoursInDec,
            billableHours,
            nonbillableHours,
            billablePercent,
            nonbillablePercent,
            totalSeconds
          })
          })
          
          break;
        case 'project':
          Object.keys(result).map(e=>{
            const data=result[e]
            const totalSeconds=_.sumBy(data,(o)=>{
                         return moment(o?.end_time).diff(moment(o?.start_time),'seconds')
                        })
            const projectGrouping= _.groupBy(data,'project_id')
            const projectArr=[]
            Object.keys(projectGrouping).filter(r=>r!=='undefined').map(p=>{
             const res=projectGrouping[p]
             const seconds=  _.sumBy(res,(obj)=>{
                 return moment(obj?.end_time).diff(moment(obj?.start_time),'seconds')
               })
               const hrsInDec=seconds/3600;
               const hrs=convertMsToTime(seconds*1000)
               const sharePercent=(seconds/totalSeconds)*100;
               projectArr.push({
                   project_id:res[0]?.project_id,
                   project_name:res[0]?.Project?.project_name??"without project",
                   client:res[0]?.Project?.client,
                   hrsInDec,
                   hrs,
                   seconds,
                   sharePercent
               })
            })
            arr.push({
               date: e,
               projects:projectArr 
            })
         })
          break;
      }
      return resolve(arr);
    }
    catch(error)
    {
       reject(error)
    }
  })
 

}
const pieChart=(timesheet,type)=>{
  return new Promise((resolve,reject)=>{
    try{
      const result=_.groupBy(timesheet,'project_id')
      const arr=[]
      let data={};
      switch(type)
      {
        case "billability":
          Object.keys(result).filter(r=>r!=='undefined').map(e=>{
              const data=result[e]
              const billableSeconds=  _.sumBy(data,(obj)=>{
                return obj?.is_billable?moment(obj.end_time).diff(moment(obj.start_time),'seconds'):0
              })
              const nonbillableSeconds= _.sumBy(data,(obj)=>{
                return !obj?.is_billable?moment(obj.end_time).diff(moment(obj.start_time),'seconds'):0
              })
              const seconds=billableSeconds+nonbillableSeconds
              const hrs=convertMsToTime(seconds*1000)
              const billableHoursInDec=billableSeconds/3600;
              const amount=billableHoursInDec*(data[0]?.Project?.hourly_rate??0)
              const billableHours=convertMsToTime(billableSeconds*1000)
              const nonbillableHours=convertMsToTime(nonbillableSeconds*1000)
              const billablePercent=(billableSeconds/seconds)*100;
              const nonbillablePercent=(nonbillableSeconds/seconds)*100
              arr.push({
                project_id:e,
                project_name:data[0]?.Project?.project_name??"without project",
                client:data[0]?.Project?.client,
                billableHours,
                nonbillableHours,
                billablePercent,
                nonbillablePercent,
                hrs,
                amount,
                seconds,
                billableSeconds,
                nonbillableSeconds
              })
          })
          const totalSeconds= _.sumBy(arr,(o)=>{
            return o?.seconds
           })
           const totalBillableSeconds= _.sumBy(arr,(o)=>{
            return o.billableSeconds
           })
           const totalNonBillableSeconds= _.sumBy(arr,(o)=>{
            return o.nonbillableSeconds
           })
           const totalAmt= _.sumBy(arr,(o)=>{
            return o?.amount
           })
           const totalBillableHrs=convertMsToTime(totalBillableSeconds*1000);
           const totalNonBillableHrs=convertMsToTime(totalNonBillableSeconds*1000);
           const totalHrs=convertMsToTime(totalSeconds*1000);
           const billablePercent=(totalBillableSeconds/totalSeconds)*100
           data={
            totalBillableHrs,
            totalNonBillableHrs,
            totalHrs,
            totalAmt,
            billablePercent,
            data:arr
           }
          break;
        case "project":
        const totalSec=  _.sumBy(timesheet,(obj)=>{
            return moment(obj?.end_time).diff(moment(obj?.start_time),'seconds')
          })
          Object.keys(result).filter(r=>r!=='undefined').map(e=>{
             const data=result[e]
             const seconds=  _.sumBy(data,(obj)=>{
              return moment(obj?.end_time).diff(moment(obj?.start_time),'seconds')
            })
             const projectHrs=convertMsToTime(seconds*1000)
             const projectHrsInDec=seconds/3600;
             const sharePercent=(seconds/totalSec)*100
             const amount=(data[0]?.Project?.hourly_rate??0)*projectHrsInDec
             arr.push({
              project_id:e,
              project_name:data[0]?.Project?.project_name??"without project",
              client:data[0]?.Project?.client,
              projectHrs,
              sharePercent,
              amount,
              seconds
             })
          })
          const totalHours=convertMsToTime(totalSec*1000)
          const max_obj = _.maxBy(arr, function(o) { return o.projectHrs; }); 
          const topProject=max_obj?.project_name
          const topClient=max_obj?.client?.client_name??null
          data={
            totalHours,
            topProject,
            topClient,
            data:arr
          }
          break;
      }   
      return resolve(data)
    }
    catch(error)
    {
      reject(error);
    }
  })
 
}
const latestActivity=(workspaceId,timesheet,User,UserWorkspace,sequelize)=>{
  return new Promise(async(resolve,reject)=>{
    try{
      const users= await UserWorkspace.findAll({
        where:{
          workspace_id:workspaceId
        },
        raw:true
       })
     let user=users.map(u=>u.user_id).toString()
     let latestActivity= await sequelize.query(`Select ts.description, "ts"."createdAt", p.project_id, p.project_name, c.client_id, c.client_name, ta.task_id, ta.task_name, n.email_id ,ts.user_id , extract(epoch from (ts.end_time::timestamp - ts.start_time::timestamp)) as duration from "TimeSheet" ts INNER JOIN (Select t.user_id, u.email_id ,t.workspace_id , max("t"."createdAt") as date from "TimeSheet" t INNER JOIN "User" u ON t.user_id=u.user_id where t.workspace_id=${workspaceId} AND t.user_id IN (${user}) group by t.workspace_id, t.user_id, u.email_id) as n ON "ts"."createdAt"=n.date LEFT JOIN "Project" p ON ts.project_id=p.project_id LEFT JOIN "Client" c ON ts.client_id=c.client_id LEFT JOIN "Task" ta ON ts.task_id=ta.task_id
     `,{ type: QueryTypes.SELECT })
    latestActivity=latestActivity.map(l=>{
      const now = moment(new Date()); //todays date
      const end = moment(l.createdAt); // another date
      const seconds = moment.duration(now.diff(end)).asSeconds();
      if(seconds>=60 && seconds < 3600)
      l.time=Math.floor(seconds/60) + " min ago";
      else if(seconds>=3600 && seconds< 86400)
      {
        l.time=Math.floor(seconds/3600) +" hour ago";
      }
      else {
        l.time=Math.floor(seconds/86400) + " day ago"
      }
      l.duration=convertMsToTime(Number(l.duration)*1000)
      return l
     })
      const userGrouping= _.groupBy(timesheet,'user_id')
      const userArr=[]
      Object.keys(userGrouping).map(e=>{
         const result= userGrouping[e]
         const totalSeconds=  _.sumBy(result,(obj)=>{
           return moment(obj?.end_time).diff(moment(obj?.start_time),'seconds')
         })
         const projGroup=_.groupBy(result,'project_id')
         const arr=[]
         Object.keys(projGroup).map(p=>{
           const pro= projGroup[p]
           const seconds=  _.sumBy(pro,(obj)=>{
             return moment(obj?.end_time).diff(moment(obj?.start_time),'seconds')
           })
            const projectHrs=convertMsToTime(seconds*1000)
            const sharePercent=(seconds/totalSeconds)*100;
            arr.push({
             project_id: pro[0]?.project_id,
             project_name: pro[0]?.Project?.project_name??"without project",
             projectHrs,
             sharePercent
            })
         })
         const totalHrs=convertMsToTime(totalSeconds*1000)
         userArr.push({
           user_id:result[0]?.user_id,
           totalHrs,
           data:arr
         })
      })
     latestActivity= latestActivity.map(l=>{
        const user=userArr.find(u=>u.user_id==l.user_id)
        if(user)
        {
           l.user=user
        }
        else{
         l.user=null
        }
        return l
      })
      
      user=user.split(",")
      const members=await User.findAll({
       where:{
         user_id:{[Op.in]:user}
       },
       raw:true
      })   
      user.map(u=>{
      const us= latestActivity.find(l=>l.user_id==u)
      const m= members.find(f=>f.user_id==u)
      if(!us)
      {
       latestActivity.push({
          user_id:u,
          email_id:m.email_id
       })
      }
       
      })
      return resolve(latestActivity)
    }
    catch(error)
    {
      reject(error);
    }
  })
  
}
const mostTracked=(startDate,endDate,workspaceId,where)=>{
  return new Promise(async(resolve,reject)=>{
    try{
      const {TimeSheet,Project,Client,Task,sequelize}=await connectToDatabase()
      let mostTracked=await TimeSheet.findAll({
         where:{
           work_date:{[Op.between]:[startDate,endDate]},
           workspace_id:workspaceId,
           ...where
         },
         attributes:['description',sequelize.col('TimeSheet.project_id'),sequelize.col('TimeSheet.client_id'),sequelize.col('TimeSheet.task_id'),sequelize.col('TimeSheet.is_billable'),[sequelize.literal(`SUM(extract(epoch from (end_time::timestamp - start_time::timestamp)))`),"seconds"]],
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
           }
           
          ],
          group:['description',sequelize.col('TimeSheet.project_id'),sequelize.col('Project.project_id'),sequelize.col('Client.client_id'),sequelize.col('TimeSheet.client_id'),sequelize.col('Task.task_id'),sequelize.col('TimeSheet.task_id'),sequelize.col('TimeSheet.is_billable')]
        })
       mostTracked=JSON.parse(JSON.stringify(mostTracked))
       mostTracked= mostTracked.map(m=>{
         m.hours=convertMsToTime(m.seconds*1000)
         return m;
        })
        return resolve(mostTracked)
     }
     catch(error)
     {
        reject(error)
     }
  })
  
}

