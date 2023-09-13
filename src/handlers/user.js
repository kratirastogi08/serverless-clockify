

const middy = require('@middy/core')
const jsonBodyParser = require('@middy/http-json-body-parser')
const httpErrorHandler = require('@middy/http-error-handler')
const { registerSchema, exportFileSchema } = require('../validationSchema/user')
const { validate } = require("../middleware/validation")
const connectToDatabase = require("../config/database")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { ROLE, HTTP_STATUS_CODE, MESSAGES ,PERMITTED_HEADERS} = require("../utilities/constant")
const { ErrorResponse } = require("../utilities/errorResponse")
const { Op } = require('@sequelize/core')
const { sendEmailSES } = require("../utilities/ses")
const Stream = require('stream')
const ExcelJS = require('exceljs')
const { uploadExcelFile, downloadExcelFile,uploadImage } = require("../utilities/s3")
//const puppeteer = require('puppeteer-core')
const pdf = require("pdf-creator-node");
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const handlebars=require('handlebars')
const chromium = require('chrome-aws-lambda');
const parser = require('lambda-multipart-parser');
const XLSX = require('xlsx')
const csv = require('csvtojson')
const axios=require('axios')

module.exports.register = middy(async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { User, Auth, Workspace, UserWorkspace, sequelize } = await connectToDatabase()
  const t = await sequelize.transaction();
  try {

    await validate(registerSchema, event.body)
    const { email_id, password, first_name, last_name } = event.body
    const hashPassword = await bcrypt.hash(password, 10);
    const isUserExists = await User.findOne({
      where: {
        email_id
      }
    })
    if (isUserExists) {
      throw new ErrorResponse(MESSAGES.USER_EXISTS, HTTP_STATUS_CODE.CONFLICT)
    }
    const workspace = await Workspace.create({
      workspace_name: first_name + " " + last_name + "'s workspace",
      email_id
    }, {
      transaction: t
    })
    const user = await User.create({
      first_name,
      last_name,
      email_id,
      role_id: ROLE['ADMIN'],
      password: hashPassword,
      active_workspace_id: workspace.workspace_id
    }, { transaction: t })
    await UserWorkspace.create({
      user_id: user.user_id,
      workspace_id: workspace.workspace_id
    }, {
      transaction: t
    })
    const token = jwt.sign({ userId: user.dataValues.user_id, workspaceId: user.active_workspace_id }, process.env.JWT_SECRET);
    await Auth.create({
      access_token: token,
      user_id: user.user_id
    }, { transaction: t })
    await t.commit();
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'User created',
          token,
          data: user.dataValues,
        },
      ),
    };
  }
  catch (error) {
    await t.rollback();
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
module.exports.login = middy(async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { User, Auth } = await connectToDatabase()
  try {
    const { email, password } = event.body;
    const user = await User.findOne({
      where: {
        email_id: email
      }
    }, {
      raw: true
    })
    if (!user) {
      throw new ErrorResponse(MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS_CODE.UNAUTHORIZED)
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new ErrorResponse(MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS_CODE.UNAUTHORIZED)
    }
    const token = jwt.sign({ userId: user.dataValues.user_id }, process.env.JWT_SECRET);
    await Auth.destroy({
      where: {
        user_id: user.user_id
      }
    })
    await Auth.create({
      user_id: user.user_id,
      access_token: token
    })
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: user
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
module.exports.me = middy(async (event, context) => {
  try {
    context.callbackWaitsForEmptyEventLoop = false;
    const { User } = await connectToDatabase()
    const user = await User.findOne({
      where: {
        user_id: event.requestContext.authorizer.principalId.userId
      },
      raw: true
    })
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Success",
        data: user
      })
    }
  }
  catch (error) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({
        message: error.message
      })
    }
  }
}).use(jsonBodyParser())
  .use(httpErrorHandler())

module.exports.addMembersToTeam = middy(async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { User, UserWorkspace } = await connectToDatabase()
  try {
    let { emailIds } = event.body;
    emailIds = emailIds.split(",")
    const { workspaceId } = event.requestContext.authorizer.principalId

    const users = await User.findAll({
      where: {
        email_id: {
          [Op.in]: emailIds
        }
      }
    })
    const oldUsers = users.map(u => u.user_id)
    const checkDuplicateData = await UserWorkspace.findAndCountAll({
      where: {
        user_id: { [Op.in]: oldUsers },
        workspace_id: workspaceId
      }
    }, {
      raw: true
    })
    if (checkDuplicateData.count > 0) {
      const data = checkDuplicateData.rows.map(u => u.user_id)
      const duplicateEmails = users.filter(u => data.includes(u.user_id)).map(u => u.email_id).toString()
      throw new ErrorResponse("User exists in workspace", HTTP_STATUS_CODE.CONFLICT, duplicateEmails)
    }
    const newUsers = emailIds.filter(email => !users.find(u => u.email_id === email)).map((id) => {
      return { email_id: id, active_workspace_id: workspaceId, role_id: ROLE['MEMBER'] }
    })
    const data = await User.bulkCreate(newUsers)
    let userIds = await User.findAll({
      where: {
        email_id: emailIds
      },
      attributes: ['user_id']
    })
    console.log(userIds)
    userIds = userIds.map(d => {
      return {
        user_id: d.user_id,
        workspace_id: workspaceId
      }
    })
    await UserWorkspace.bulkCreate(userIds)
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Success"
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

module.exports.inviteEmail = middy(async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { User, UserWorkspace } = await connectToDatabase()
  try {
    let { emailIds } = event.body;
    emailIds = emailIds.split(",")
    const { workspaceId, userId } = event.requestContext.authorizer.principalId
    const users = await User.findAll({
      where: {
        email_id: { [Op.in]: emailIds }
      }
    })
    const userIds = users.map(u => u.user_id)
    const oldUsers = await UserWorkspace.findAll({
      where: {
        user_id: { [Op.in]: userIds },
        workspace_id: workspaceId
      }
    })
    let emails = oldUsers.map(u => {
      const user = users.find(user => user.user_id === u.user_id)
      return user.email_id
    })
    if (emails && emails.length) {
      throw new ErrorResponse("Users already exists in workspace", HTTP_STATUS_CODE.CONFLICT, emails.toString())
    }
    const currentUser = await User.findOne({
      where: {
        user_id: userId
      },
      attributes: ['first_name', 'last_name']
    })
    await Promise.allSettled(emailIds.map(async e => {
      return await sendEmail(e, 'Workspace Invitation', { name: currentUser.first_name + " " + currentUser.last_name, link: `http://${event.headers.Host}/${event.requestContext.stage}/acceptInvite/workspace?workspaceId=${workspaceId}&email=${e}` })
    }))
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Users have been invited"
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

module.exports.acceptInvite = middy(async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { User, UserWorkspace, sequelize } = await connectToDatabase()
  const t = await sequelize.transaction();
  try {
    const { workspaceId, email } = event.queryStringParameters;
    const user = await User.findOne({
      where: {
        email_id: email
      }
    })
    if (user) {
      await UserWorkspace.create({
        user_id: user.user_id,
        workspace_id: workspaceId,
      })
    }
    else {
      const newUser = await User.create({
        email_id: email,
        active_workspace_id: workspaceId,
        role_id: ROLE['MEMBER']
      }, {
        transaction: t
      })
      await UserWorkspace.create({
        user_id: newUser.user_id,
        workspace_id: workspaceId
      }, {
        transaction: t
      })
      await t.commit()
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "SUCCESS"
      })
    }

  }
  catch (error) {
    await t.rollback()
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

module.exports.ses = middy(async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { User, UserWorkspace } = await connectToDatabase()
  try {
    let { emailIds } = event.body;
    emailIds = emailIds.split(",")
    const { workspaceId, userId } = event.requestContext.authorizer.principalId
    const users = await User.findAll({
      where: {
        email_id: { [Op.in]: emailIds }
      }
    })
    const userIds = users.map(u => u.user_id)
    const oldUsers = await UserWorkspace.findAll({
      where: {
        user_id: { [Op.in]: userIds },
        workspace_id: workspaceId
      }
    })
    let emails = oldUsers.map(u => {
      const user = users.find(user => user.user_id === u.user_id)
      return user.email_id
    })
    if (emails && emails.length) {
      throw new ErrorResponse("Users already exists in workspace", HTTP_STATUS_CODE.CONFLICT, emails.toString())
    }
    const currentUser = await User.findOne({
      where: {
        user_id: userId
      },
      attributes: ['first_name', 'last_name']
    })
    await Promise.allSettled(emailIds.map(async e => {
      const d = await sendEmailSES(e, 'Workspace Invitation', { name: currentUser.first_name + " " + currentUser.last_name, link: `http://${event.headers.Host}/${event.requestContext.stage}/acceptInvite/workspace?workspaceId=${workspaceId}&email=${e}` }, "kratirastogi99196@gmail.com")
      console.log(d)
    }))
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Users have been invited"
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

module.exports.exportFile = middy(async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const stream = new Stream.PassThrough()
    await validate(exportFileSchema, event.queryStringParameters ?? {})
    const { User, sequelize } = await connectToDatabase()
    const { startDate, endDate } = event.queryStringParameters;
    const userId = event.requestContext.authorizer.principalId.userId
    const user = await User.findOne({
      attributes: ['email_id'],
      where: {
        user_id: userId
      }
    })
    let datefilter = []
    if (startDate) {
      datefilter.push(sequelize.where(sequelize.fn('DATE', sequelize.col('createdAt')), { [Op.gte]: startDate }))
    }
    if (endDate) {
      datefilter.push(sequelize.where(sequelize.fn('DATE', sequelize.col('createdAt')), { [Op.lte]: endDate }))
    }
    const users = await User.findAll({
      where: {
        [Op.and]: [
          ...datefilter,
          { isActive: true }
        ]
      }
    })
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Users')
    worksheet.columns = [
      { header: 'S.no', key: 's_no', width: 10 },
      { header: 'First Name', key: 'first_name', width: 10 },
      { header: 'Last Name', key: 'last_name', width: 10 },
      { header: 'Email', key: 'email_id', width: 10 }
    ]
    let count = 1
    users.forEach((user) => {
      user.s_no = count
      worksheet.addRow(user)
      count++
    })
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }
    })

    await workbook.xlsx.write(stream);
    const result = await uploadExcelFile(stream);
    const x = await downloadExcelFile(result.Key);
    await sendEmailSES(user.email_id, "User report", { name: user.email_id, link: x }, "kratirastogi99196@gmail.com")
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "success"
      })
    }
  }
  catch (error) {
    let err = error;
    // if error not thrown by us
    if (!(err instanceof ErrorResponse)) {
      err = new ErrorResponse();
    }
    return err;
  }
}).use(jsonBodyParser())
  .use(httpErrorHandler())

module.exports.generatePdf = middy(async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const {User}=await connectToDatabase()
    const users=await User.findAll({raw:true})
    let browser = null
  
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    })
    const filename=path.resolve(__dirname,"../templates/users.ejs")
    const ejsData=await ejs.renderFile(filename,{content:{headers:['FirstName','LastName','Email'],users:users}})
    const page = await browser.newPage()
    page.setContent(ejsData)

    // 4. Create pdf file with puppeteer
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    })

    // 5. Return PDf as base64 string
    return {
      headers: {
        'Content-type': 'application/pdf',
        'content-disposition': 'attachment; filename=test.pdf'
      },
      statusCode: 200,
      body: pdf.toString('base64'),
      isBase64Encoded: true
    }

  }
  catch (error) {
    console.log(error)
    let err = error;
    // if error not thrown by us
    if (!(err instanceof ErrorResponse)) {
      err = new ErrorResponse();
    }
    return err;
  }
}).use(jsonBodyParser())
  .use(httpErrorHandler())

module.exports.updateProfileImage=middy(async(event,context)=>{
  context.callbackWaitsForEmptyEventLoop = false;
  try{
    const { User } = await connectToDatabase()
    const result = await parser.parse(event);
    const { userId } = event.requestContext.authorizer.principalId
    const file=result.files[0]
    const data=await uploadImage(file)
    await User.update({profileImageUploaded:data.Location},{where:{
      user_id:userId
    }})
    return {
      statusCode:201,
      body:JSON.stringify({
        message:"Updated",
        data:data.Location
      })
    }
  }
  catch(error)
  {
    console.log(error)
    let err = error;
    // if error not thrown by us
    if (!(err instanceof ErrorResponse)) {
      err = new ErrorResponse();
    }
    return err;

  }
}).use(jsonBodyParser())
.use(httpErrorHandler())

module.exports.importFile=middy(async(event,context)=>{
  context.callbackWaitsForEmptyEventLoop = false;
  try{
    const result = await parser.parse(event);
    const file=result.files[0]
    const {User}=await connectToDatabase()
    let data=[]
    if (file.filename.includes('xlsx')) {
      const res = XLSX.read(file.content, { type: 'buffer' })
      const w = XLSX.utils.sheet_to_csv(res.Sheets[res.SheetNames[0]], { raw: true })
      data = await csv().fromString(w)
    } else if (file.filename.includes('csv')) {
      data = await csv().fromString(file.content.toString())
    }
    console.log(data)
     if(!data.length)
     {
     throw new ErrorResponse("Missing Data",400)
     }
     const headers=Object.keys(data[0])
     if(PERMITTED_HEADERS.length!==headers.length)
     {
      throw new ErrorResponse("Invalid Headers",400)
     }
     headers.forEach(h=>{
      if(!PERMITTED_HEADERS.includes(h))
      throw new ErrorResponse("Invalid Headers",400)
     })
     const userList=[]
     await Promise.all(data.map(async e=>{
      if(e.FirstName==''||e.LastName==''||e.Email=='')
      {
        throw new ErrorResponse("Invalid Data",400)
      }
      userList.push({
        first_name:e.FirstName,
        last_name:e.LastName,
        email_id:e.Email,
        active_workspace_id:3
      })
     }))
    const emails=userList.map(u=>u.emailIds)
   const users= await User.findAll({
      where:{
        user_id:{
          [Op.in]:emails
        }
      }
    })
     if(users.length)
     {
      throw new ErrorResponse("Duplicate Emails",400)
     }
     await User.bulkCreate(userList)
     return {
      statusCode:200,
      body:JSON.stringify({
        message:"Users created"
      })
     }
  }
  catch(error)
  {
     console.log(error)
     let err = error;
    // if error not thrown by us
    if (!(err instanceof ErrorResponse)) {
      err = new ErrorResponse();
    }
    return err;
  }
}).use(jsonBodyParser())
.use(httpErrorHandler())

module.exports.thirdPartyApi=middy(async (event,context)=>{
  context.callbackWaitsForEmptyEventLoop = false;
  try{
    const url="https://fakestoreapi.com/products/categories"
    const result=await axios.get(url)
    const categories=result.data;
    const categoryURL="https://fakestoreapi.com/products/category/"
    let catArr=[];
   const promises= categories.flatMap(c=>{
       catArr.push({category:c})
      return getCategorywiseProducts(categoryURL,c)
    })
   const response= await Promise.all(promises)
   response.forEach((e,i)=>{
    let obj=catArr[i]
    obj.data=e.data
   })
   return {
    statusCode:200,
    body:JSON.stringify({data:catArr})
   }
  }
  catch(error)
  {
    let err = error;
    if (!(err instanceof ErrorResponse)) {
      err = new ErrorResponse();
    }
    return err;
  }
}).use(jsonBodyParser())
.use(httpErrorHandler())

const getCategorywiseProducts=async (url,category)=>{
  return new Promise((resolve,reject)=>{
       try{
        const axiosInstance=axios.get(`${url}${category}`)
        resolve(axiosInstance)
       }
       catch(error)
       {
        reject(error)
       }
  })
}




