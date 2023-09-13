/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/config/database.js":
/*!********************************!*\
  !*** ./src/config/database.js ***!
  \********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const Sequelize=__webpack_require__(/*! sequelize */ \"sequelize\")\r\nconst {user}=__webpack_require__(/*! ../models/User */ \"./src/models/User.js\")\r\nconst {role}=__webpack_require__(/*! ../models/Role */ \"./src/models/Role.js\")\r\nconst {auth}=__webpack_require__(/*! ../models/Auth */ \"./src/models/Auth.js\")\r\nconst {workspace}=__webpack_require__(/*! ../models/Workspace */ \"./src/models/Workspace.js\")\r\nconst {userWorkspace}=__webpack_require__(/*! ../models/UserWorkspace */ \"./src/models/UserWorkspace.js\")\r\n const pg=__webpack_require__(/*! pg */ \"pg\")\r\nconst sequelize=new Sequelize(\r\n    process.env.DB_NAME,\r\n    process.env.DB_USER,\r\n    process.env.DB_PASSWORD,\r\n    {\r\n        dialect:'postgres',\r\n        dialectModule: pg,\r\n        host:process.env.DB_HSOT,\r\n        port:process.env.DB_PORT,\r\n        logging:console.log,\r\n        query:{raw:true}\r\n    }\r\n)\r\nconst connection={}\r\nconst User=user(sequelize,Sequelize)\r\nconst Role=role(sequelize,Sequelize)\r\nconst Auth=auth(sequelize,Sequelize)\r\nconst Workspace=workspace(sequelize,Sequelize)\r\nconst UserWorkspace=userWorkspace(sequelize,Sequelize)\r\nWorkspace.belongsToMany(User,{through:\"User_Workspace\",as:\"workspaces\",foreignKey:\"workspace_id\"})\r\nUser.belongsToMany(Workspace,{through:\"User_Workspace\",as:\"users\",foreignKey:\"user_id\"})\r\nUser.hasOne(Auth,{foreignKey:'user_id'})\r\nAuth.belongsTo(User,{foreignKey:'user_id'})\r\nRole.hasMany(User,{\r\nforeignKey:\"role_id\"\r\n})\r\nUser.belongsTo(Role,{\r\n    foreignKey:\"role_id\"\r\n})\r\nconst Models={\r\n    User,\r\n    Role,\r\n    Auth,\r\n    Workspace,\r\n    UserWorkspace,\r\n    sequelize\r\n}\r\n\r\nmodule.exports = async () => {\r\n    if (connection.isConnected) {\r\n      console.log('=> Using existing connection.')\r\n      return Models\r\n    }\r\n  \r\n    await sequelize.sync({alter:true})\r\n    await sequelize.authenticate()\r\n    connection.isConnected = true\r\n    console.log('=> Created a new connection.')\r\n    return Models\r\n  }\r\n\n\n//# sourceURL=webpack:///./src/config/database.js?");

/***/ }),

/***/ "./src/handlers/user.js":
/*!******************************!*\
  !*** ./src/handlers/user.js ***!
  \******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\r\n\r\nconst middy = __webpack_require__(/*! @middy/core */ \"@middy/core\")\r\nconst jsonBodyParser = __webpack_require__(/*! @middy/http-json-body-parser */ \"@middy/http-json-body-parser\")\r\nconst httpErrorHandler = __webpack_require__(/*! @middy/http-error-handler */ \"@middy/http-error-handler\")\r\nconst { registerSchema, exportFileSchema } = __webpack_require__(/*! ../validationSchema/user */ \"./src/validationSchema/user.js\")\r\nconst { validate } = __webpack_require__(/*! ../middleware/validation */ \"./src/middleware/validation.js\")\r\nconst connectToDatabase = __webpack_require__(/*! ../config/database */ \"./src/config/database.js\")\r\nconst bcrypt = __webpack_require__(/*! bcryptjs */ \"bcryptjs\")\r\nconst jwt = __webpack_require__(/*! jsonwebtoken */ \"jsonwebtoken\");\r\nconst { ROLE, HTTP_STATUS_CODE, MESSAGES ,PERMITTED_HEADERS} = __webpack_require__(/*! ../utilities/constant */ \"./src/utilities/constant.js\")\r\nconst { ErrorResponse } = __webpack_require__(/*! ../utilities/errorResponse */ \"./src/utilities/errorResponse.js\")\r\nconst { Op } = __webpack_require__(/*! @sequelize/core */ \"@sequelize/core\")\r\nconst { sendEmailSES } = __webpack_require__(/*! ../utilities/ses */ \"./src/utilities/ses.js\")\r\nconst Stream = __webpack_require__(/*! stream */ \"stream\")\r\nconst ExcelJS = __webpack_require__(/*! exceljs */ \"exceljs\")\r\nconst { uploadExcelFile, downloadExcelFile,uploadImage } = __webpack_require__(/*! ../utilities/s3 */ \"./src/utilities/s3.js\")\r\n//const puppeteer = require('puppeteer-core')\r\nconst pdf = __webpack_require__(/*! pdf-creator-node */ \"pdf-creator-node\");\r\nconst fs = __webpack_require__(/*! fs */ \"fs\")\r\nconst path = __webpack_require__(/*! path */ \"path\")\r\nconst ejs = __webpack_require__(/*! ejs */ \"ejs\")\r\nconst handlebars=__webpack_require__(/*! handlebars */ \"handlebars\")\r\nconst chromium = __webpack_require__(/*! chrome-aws-lambda */ \"chrome-aws-lambda\");\r\nconst parser = __webpack_require__(/*! lambda-multipart-parser */ \"lambda-multipart-parser\");\r\nconst XLSX = __webpack_require__(/*! xlsx */ \"xlsx\")\r\nconst csv = __webpack_require__(/*! csvtojson */ \"csvtojson\")\r\nconst axios=__webpack_require__(/*! axios */ \"axios\")\r\n\r\nmodule.exports.register = middy(async (event, context) => {\r\n  context.callbackWaitsForEmptyEventLoop = false;\r\n  const { User, Auth, Workspace, UserWorkspace, sequelize } = await connectToDatabase()\r\n  const t = await sequelize.transaction();\r\n  try {\r\n\r\n    await validate(registerSchema, event.body)\r\n    const { email_id, password, first_name, last_name } = event.body\r\n    const hashPassword = await bcrypt.hash(password, 10);\r\n    const isUserExists = await User.findOne({\r\n      where: {\r\n        email_id\r\n      }\r\n    })\r\n    if (isUserExists) {\r\n      throw new ErrorResponse(MESSAGES.USER_EXISTS, HTTP_STATUS_CODE.CONFLICT)\r\n    }\r\n    const workspace = await Workspace.create({\r\n      workspace_name: first_name + \" \" + last_name + \"'s workspace\",\r\n      email_id\r\n    }, {\r\n      transaction: t\r\n    })\r\n    const user = await User.create({\r\n      first_name,\r\n      last_name,\r\n      email_id,\r\n      role_id: ROLE['ADMIN'],\r\n      password: hashPassword,\r\n      active_workspace_id: workspace.workspace_id\r\n    }, { transaction: t })\r\n    await UserWorkspace.create({\r\n      user_id: user.user_id,\r\n      workspace_id: workspace.workspace_id\r\n    }, {\r\n      transaction: t\r\n    })\r\n    const token = jwt.sign({ userId: user.dataValues.user_id, workspaceId: user.active_workspace_id }, process.env.JWT_SECRET);\r\n    await Auth.create({\r\n      access_token: token,\r\n      user_id: user.user_id\r\n    }, { transaction: t })\r\n    await t.commit();\r\n    return {\r\n      statusCode: 200,\r\n      body: JSON.stringify(\r\n        {\r\n          message: 'User created',\r\n          token,\r\n          data: user.dataValues,\r\n        },\r\n      ),\r\n    };\r\n  }\r\n  catch (error) {\r\n    await t.rollback();\r\n    let err = error;\r\n    // if error not thrown by us\r\n    if (!(err instanceof ErrorResponse)) {\r\n      console.error(err);\r\n      err = new ErrorResponse();\r\n    }\r\n    return err;\r\n  }\r\n}).use(jsonBodyParser())\r\n  .use(httpErrorHandler())\r\nmodule.exports.login = middy(async (event, context, callback) => {\r\n  context.callbackWaitsForEmptyEventLoop = false;\r\n  const { User, Auth } = await connectToDatabase()\r\n  try {\r\n    const { email, password } = event.body;\r\n    const user = await User.findOne({\r\n      where: {\r\n        email_id: email\r\n      }\r\n    }, {\r\n      raw: true\r\n    })\r\n    if (!user) {\r\n      throw new ErrorResponse(MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS_CODE.UNAUTHORIZED)\r\n    }\r\n    const isMatch = await bcrypt.compare(password, user.password)\r\n    if (!isMatch) {\r\n      throw new ErrorResponse(MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS_CODE.UNAUTHORIZED)\r\n    }\r\n    const token = jwt.sign({ userId: user.dataValues.user_id }, process.env.JWT_SECRET);\r\n    await Auth.destroy({\r\n      where: {\r\n        user_id: user.user_id\r\n      }\r\n    })\r\n    await Auth.create({\r\n      user_id: user.user_id,\r\n      access_token: token\r\n    })\r\n    return {\r\n      statusCode: 200,\r\n      body: JSON.stringify({\r\n        data: user\r\n      })\r\n    }\r\n  }\r\n  catch (error) {\r\n    let err = error;\r\n    // if error not thrown by us\r\n    if (!(err instanceof ErrorResponse)) {\r\n      console.error(err);\r\n      err = new ErrorResponse();\r\n    }\r\n    return err;\r\n  }\r\n}).use(jsonBodyParser())\r\n  .use(httpErrorHandler())\r\nmodule.exports.me = middy(async (event, context) => {\r\n  try {\r\n    context.callbackWaitsForEmptyEventLoop = false;\r\n    const { User } = await connectToDatabase()\r\n    const user = await User.findOne({\r\n      where: {\r\n        user_id: event.requestContext.authorizer.principalId.userId\r\n      },\r\n      raw: true\r\n    })\r\n    return {\r\n      statusCode: 200,\r\n      body: JSON.stringify({\r\n        message: \"Success\",\r\n        data: user\r\n      })\r\n    }\r\n  }\r\n  catch (error) {\r\n    return {\r\n      statusCode: error.statusCode,\r\n      body: JSON.stringify({\r\n        message: error.message\r\n      })\r\n    }\r\n  }\r\n}).use(jsonBodyParser())\r\n  .use(httpErrorHandler())\r\n\r\nmodule.exports.addMembersToTeam = middy(async (event, context) => {\r\n  context.callbackWaitsForEmptyEventLoop = false;\r\n  const { User, UserWorkspace } = await connectToDatabase()\r\n  try {\r\n    let { emailIds } = event.body;\r\n    emailIds = emailIds.split(\",\")\r\n    const { workspaceId } = event.requestContext.authorizer.principalId\r\n\r\n    const users = await User.findAll({\r\n      where: {\r\n        email_id: {\r\n          [Op.in]: emailIds\r\n        }\r\n      }\r\n    })\r\n    const oldUsers = users.map(u => u.user_id)\r\n    const checkDuplicateData = await UserWorkspace.findAndCountAll({\r\n      where: {\r\n        user_id: { [Op.in]: oldUsers },\r\n        workspace_id: workspaceId\r\n      }\r\n    }, {\r\n      raw: true\r\n    })\r\n    if (checkDuplicateData.count > 0) {\r\n      const data = checkDuplicateData.rows.map(u => u.user_id)\r\n      const duplicateEmails = users.filter(u => data.includes(u.user_id)).map(u => u.email_id).toString()\r\n      throw new ErrorResponse(\"User exists in workspace\", HTTP_STATUS_CODE.CONFLICT, duplicateEmails)\r\n    }\r\n    const newUsers = emailIds.filter(email => !users.find(u => u.email_id === email)).map((id) => {\r\n      return { email_id: id, active_workspace_id: workspaceId, role_id: ROLE['MEMBER'] }\r\n    })\r\n    const data = await User.bulkCreate(newUsers)\r\n    let userIds = await User.findAll({\r\n      where: {\r\n        email_id: emailIds\r\n      },\r\n      attributes: ['user_id']\r\n    })\r\n    console.log(userIds)\r\n    userIds = userIds.map(d => {\r\n      return {\r\n        user_id: d.user_id,\r\n        workspace_id: workspaceId\r\n      }\r\n    })\r\n    await UserWorkspace.bulkCreate(userIds)\r\n    return {\r\n      statusCode: 200,\r\n      body: JSON.stringify({\r\n        message: \"Success\"\r\n      })\r\n    }\r\n  }\r\n  catch (error) {\r\n    let err = error;\r\n    // if error not thrown by us\r\n    if (!(err instanceof ErrorResponse)) {\r\n      console.error(err);\r\n      err = new ErrorResponse();\r\n    }\r\n    return err;\r\n  }\r\n}).use(jsonBodyParser())\r\n  .use(httpErrorHandler())\r\n\r\nmodule.exports.inviteEmail = middy(async (event, context) => {\r\n  context.callbackWaitsForEmptyEventLoop = false;\r\n  const { User, UserWorkspace } = await connectToDatabase()\r\n  try {\r\n    let { emailIds } = event.body;\r\n    emailIds = emailIds.split(\",\")\r\n    const { workspaceId, userId } = event.requestContext.authorizer.principalId\r\n    const users = await User.findAll({\r\n      where: {\r\n        email_id: { [Op.in]: emailIds }\r\n      }\r\n    })\r\n    const userIds = users.map(u => u.user_id)\r\n    const oldUsers = await UserWorkspace.findAll({\r\n      where: {\r\n        user_id: { [Op.in]: userIds },\r\n        workspace_id: workspaceId\r\n      }\r\n    })\r\n    let emails = oldUsers.map(u => {\r\n      const user = users.find(user => user.user_id === u.user_id)\r\n      return user.email_id\r\n    })\r\n    if (emails && emails.length) {\r\n      throw new ErrorResponse(\"Users already exists in workspace\", HTTP_STATUS_CODE.CONFLICT, emails.toString())\r\n    }\r\n    const currentUser = await User.findOne({\r\n      where: {\r\n        user_id: userId\r\n      },\r\n      attributes: ['first_name', 'last_name']\r\n    })\r\n    await Promise.allSettled(emailIds.map(async e => {\r\n      return await sendEmail(e, 'Workspace Invitation', { name: currentUser.first_name + \" \" + currentUser.last_name, link: `http://${event.headers.Host}/${event.requestContext.stage}/acceptInvite/workspace?workspaceId=${workspaceId}&email=${e}` })\r\n    }))\r\n    return {\r\n      statusCode: 200,\r\n      body: JSON.stringify({\r\n        message: \"Users have been invited\"\r\n      })\r\n    }\r\n  }\r\n  catch (error) {\r\n    let err = error;\r\n    // if error not thrown by us\r\n    if (!(err instanceof ErrorResponse)) {\r\n      console.error(err);\r\n      err = new ErrorResponse();\r\n    }\r\n    return err;\r\n  }\r\n}).use(jsonBodyParser())\r\n  .use(httpErrorHandler())\r\n\r\nmodule.exports.acceptInvite = middy(async (event, context) => {\r\n  context.callbackWaitsForEmptyEventLoop = false;\r\n  const { User, UserWorkspace, sequelize } = await connectToDatabase()\r\n  const t = await sequelize.transaction();\r\n  try {\r\n    const { workspaceId, email } = event.queryStringParameters;\r\n    const user = await User.findOne({\r\n      where: {\r\n        email_id: email\r\n      }\r\n    })\r\n    if (user) {\r\n      await UserWorkspace.create({\r\n        user_id: user.user_id,\r\n        workspace_id: workspaceId,\r\n      })\r\n    }\r\n    else {\r\n      const newUser = await User.create({\r\n        email_id: email,\r\n        active_workspace_id: workspaceId,\r\n        role_id: ROLE['MEMBER']\r\n      }, {\r\n        transaction: t\r\n      })\r\n      await UserWorkspace.create({\r\n        user_id: newUser.user_id,\r\n        workspace_id: workspaceId\r\n      }, {\r\n        transaction: t\r\n      })\r\n      await t.commit()\r\n    }\r\n    return {\r\n      statusCode: 200,\r\n      body: JSON.stringify({\r\n        message: \"SUCCESS\"\r\n      })\r\n    }\r\n\r\n  }\r\n  catch (error) {\r\n    await t.rollback()\r\n    let err = error;\r\n    // if error not thrown by us\r\n    if (!(err instanceof ErrorResponse)) {\r\n      console.error(err);\r\n      err = new ErrorResponse();\r\n    }\r\n    return err;\r\n  }\r\n}).use(jsonBodyParser())\r\n  .use(httpErrorHandler())\r\n\r\nmodule.exports.ses = middy(async (event, context) => {\r\n  context.callbackWaitsForEmptyEventLoop = false;\r\n  const { User, UserWorkspace } = await connectToDatabase()\r\n  try {\r\n    let { emailIds } = event.body;\r\n    emailIds = emailIds.split(\",\")\r\n    const { workspaceId, userId } = event.requestContext.authorizer.principalId\r\n    const users = await User.findAll({\r\n      where: {\r\n        email_id: { [Op.in]: emailIds }\r\n      }\r\n    })\r\n    const userIds = users.map(u => u.user_id)\r\n    const oldUsers = await UserWorkspace.findAll({\r\n      where: {\r\n        user_id: { [Op.in]: userIds },\r\n        workspace_id: workspaceId\r\n      }\r\n    })\r\n    let emails = oldUsers.map(u => {\r\n      const user = users.find(user => user.user_id === u.user_id)\r\n      return user.email_id\r\n    })\r\n    if (emails && emails.length) {\r\n      throw new ErrorResponse(\"Users already exists in workspace\", HTTP_STATUS_CODE.CONFLICT, emails.toString())\r\n    }\r\n    const currentUser = await User.findOne({\r\n      where: {\r\n        user_id: userId\r\n      },\r\n      attributes: ['first_name', 'last_name']\r\n    })\r\n    await Promise.allSettled(emailIds.map(async e => {\r\n      const d = await sendEmailSES(e, 'Workspace Invitation', { name: currentUser.first_name + \" \" + currentUser.last_name, link: `http://${event.headers.Host}/${event.requestContext.stage}/acceptInvite/workspace?workspaceId=${workspaceId}&email=${e}` }, \"kratirastogi99196@gmail.com\")\r\n      console.log(d)\r\n    }))\r\n    return {\r\n      statusCode: 200,\r\n      body: JSON.stringify({\r\n        message: \"Users have been invited\"\r\n      })\r\n    }\r\n  }\r\n  catch (error) {\r\n    let err = error;\r\n    // if error not thrown by us\r\n    if (!(err instanceof ErrorResponse)) {\r\n      console.error(err);\r\n      err = new ErrorResponse();\r\n    }\r\n    return err;\r\n  }\r\n}).use(jsonBodyParser())\r\n  .use(httpErrorHandler())\r\n\r\nmodule.exports.exportFile = middy(async (event, context) => {\r\n  context.callbackWaitsForEmptyEventLoop = false;\r\n  try {\r\n    const stream = new Stream.PassThrough()\r\n    await validate(exportFileSchema, event.queryStringParameters ?? {})\r\n    const { User, sequelize } = await connectToDatabase()\r\n    const { startDate, endDate } = event.queryStringParameters;\r\n    const userId = event.requestContext.authorizer.principalId.userId\r\n    const user = await User.findOne({\r\n      attributes: ['email_id'],\r\n      where: {\r\n        user_id: userId\r\n      }\r\n    })\r\n    let datefilter = []\r\n    if (startDate) {\r\n      datefilter.push(sequelize.where(sequelize.fn('DATE', sequelize.col('createdAt')), { [Op.gte]: startDate }))\r\n    }\r\n    if (endDate) {\r\n      datefilter.push(sequelize.where(sequelize.fn('DATE', sequelize.col('createdAt')), { [Op.lte]: endDate }))\r\n    }\r\n    const users = await User.findAll({\r\n      where: {\r\n        [Op.and]: [\r\n          ...datefilter,\r\n          { isActive: true }\r\n        ]\r\n      }\r\n    })\r\n    const workbook = new ExcelJS.Workbook()\r\n    const worksheet = workbook.addWorksheet('Users')\r\n    worksheet.columns = [\r\n      { header: 'S.no', key: 's_no', width: 10 },\r\n      { header: 'First Name', key: 'first_name', width: 10 },\r\n      { header: 'Last Name', key: 'last_name', width: 10 },\r\n      { header: 'Email', key: 'email_id', width: 10 }\r\n    ]\r\n    let count = 1\r\n    users.forEach((user) => {\r\n      user.s_no = count\r\n      worksheet.addRow(user)\r\n      count++\r\n    })\r\n    worksheet.getRow(1).eachCell((cell) => {\r\n      cell.font = { bold: true }\r\n    })\r\n\r\n    await workbook.xlsx.write(stream);\r\n    const result = await uploadExcelFile(stream);\r\n    const x = await downloadExcelFile(result.Key);\r\n    await sendEmailSES(user.email_id, \"User report\", { name: user.email_id, link: x }, \"kratirastogi99196@gmail.com\")\r\n    return {\r\n      statusCode: 200,\r\n      body: JSON.stringify({\r\n        message: \"success\"\r\n      })\r\n    }\r\n  }\r\n  catch (error) {\r\n    let err = error;\r\n    // if error not thrown by us\r\n    if (!(err instanceof ErrorResponse)) {\r\n      err = new ErrorResponse();\r\n    }\r\n    return err;\r\n  }\r\n}).use(jsonBodyParser())\r\n  .use(httpErrorHandler())\r\n\r\nmodule.exports.generatePdf = middy(async (event, context) => {\r\n  context.callbackWaitsForEmptyEventLoop = false;\r\n  try {\r\n    const {User}=await connectToDatabase()\r\n    const users=await User.findAll({raw:true})\r\n    let browser = null\r\n  \r\n    browser = await chromium.puppeteer.launch({\r\n      args: chromium.args,\r\n      defaultViewport: chromium.defaultViewport,\r\n      executablePath: await chromium.executablePath,\r\n      headless: chromium.headless\r\n    })\r\n    const filename=path.resolve(__dirname,\"../templates/users.ejs\")\r\n    const ejsData=await ejs.renderFile(filename,{content:{headers:['FirstName','LastName','Email'],users:users}})\r\n    const page = await browser.newPage()\r\n    page.setContent(ejsData)\r\n\r\n    // 4. Create pdf file with puppeteer\r\n    const pdf = await page.pdf({\r\n      format: 'A4',\r\n      printBackground: true,\r\n      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }\r\n    })\r\n\r\n    // 5. Return PDf as base64 string\r\n    return {\r\n      headers: {\r\n        'Content-type': 'application/pdf',\r\n        'content-disposition': 'attachment; filename=test.pdf'\r\n      },\r\n      statusCode: 200,\r\n      body: pdf.toString('base64'),\r\n      isBase64Encoded: true\r\n    }\r\n\r\n  }\r\n  catch (error) {\r\n    console.log(error)\r\n    let err = error;\r\n    // if error not thrown by us\r\n    if (!(err instanceof ErrorResponse)) {\r\n      err = new ErrorResponse();\r\n    }\r\n    return err;\r\n  }\r\n}).use(jsonBodyParser())\r\n  .use(httpErrorHandler())\r\n\r\nmodule.exports.updateProfileImage=middy(async(event,context)=>{\r\n  context.callbackWaitsForEmptyEventLoop = false;\r\n  try{\r\n    const { User } = await connectToDatabase()\r\n    const result = await parser.parse(event);\r\n    const { userId } = event.requestContext.authorizer.principalId\r\n    const file=result.files[0]\r\n    const data=await uploadImage(file)\r\n    await User.update({profileImageUploaded:data.Location},{where:{\r\n      user_id:userId\r\n    }})\r\n    return {\r\n      statusCode:201,\r\n      body:JSON.stringify({\r\n        message:\"Updated\",\r\n        data:data.Location\r\n      })\r\n    }\r\n  }\r\n  catch(error)\r\n  {\r\n    console.log(error)\r\n    let err = error;\r\n    // if error not thrown by us\r\n    if (!(err instanceof ErrorResponse)) {\r\n      err = new ErrorResponse();\r\n    }\r\n    return err;\r\n\r\n  }\r\n}).use(jsonBodyParser())\r\n.use(httpErrorHandler())\r\n\r\nmodule.exports.importFile=middy(async(event,context)=>{\r\n  context.callbackWaitsForEmptyEventLoop = false;\r\n  try{\r\n    const result = await parser.parse(event);\r\n    const file=result.files[0]\r\n    const {User}=await connectToDatabase()\r\n    let data=[]\r\n    if (file.filename.includes('xlsx')) {\r\n      const res = XLSX.read(file.content, { type: 'buffer' })\r\n      const w = XLSX.utils.sheet_to_csv(res.Sheets[res.SheetNames[0]], { raw: true })\r\n      data = await csv().fromString(w)\r\n    } else if (file.filename.includes('csv')) {\r\n      data = await csv().fromString(file.content.toString())\r\n    }\r\n    console.log(data)\r\n     if(!data.length)\r\n     {\r\n     throw new ErrorResponse(\"Missing Data\",400)\r\n     }\r\n     const headers=Object.keys(data[0])\r\n     if(PERMITTED_HEADERS.length!==headers.length)\r\n     {\r\n      throw new ErrorResponse(\"Invalid Headers\",400)\r\n     }\r\n     headers.forEach(h=>{\r\n      if(!PERMITTED_HEADERS.includes(h))\r\n      throw new ErrorResponse(\"Invalid Headers\",400)\r\n     })\r\n     const userList=[]\r\n     await Promise.all(data.map(async e=>{\r\n      if(e.FirstName==''||e.LastName==''||e.Email=='')\r\n      {\r\n        throw new ErrorResponse(\"Invalid Data\",400)\r\n      }\r\n      userList.push({\r\n        first_name:e.FirstName,\r\n        last_name:e.LastName,\r\n        email_id:e.Email,\r\n        active_workspace_id:3\r\n      })\r\n     }))\r\n    const emails=userList.map(u=>u.emailIds)\r\n   const users= await User.findAll({\r\n      where:{\r\n        user_id:{\r\n          [Op.in]:emails\r\n        }\r\n      }\r\n    })\r\n     if(users.length)\r\n     {\r\n      throw new ErrorResponse(\"Duplicate Emails\",400)\r\n     }\r\n     await User.bulkCreate(userList)\r\n     return {\r\n      statusCode:200,\r\n      body:JSON.stringify({\r\n        message:\"Users created\"\r\n      })\r\n     }\r\n  }\r\n  catch(error)\r\n  {\r\n     console.log(error)\r\n     let err = error;\r\n    // if error not thrown by us\r\n    if (!(err instanceof ErrorResponse)) {\r\n      err = new ErrorResponse();\r\n    }\r\n    return err;\r\n  }\r\n}).use(jsonBodyParser())\r\n.use(httpErrorHandler())\r\n\r\nmodule.exports.thirdPartyApi=middy(async (event,context)=>{\r\n  context.callbackWaitsForEmptyEventLoop = false;\r\n  try{\r\n    const url=\"https://fakestoreapi.com/products/categories\"\r\n    const result=await axios.get(url)\r\n    const categories=result.data;\r\n    const categoryURL=\"https://fakestoreapi.com/products/category/\"\r\n    let catArr=[];\r\n   const promises= categories.flatMap(c=>{\r\n       catArr.push({category:c})\r\n      return getCategorywiseProducts(categoryURL,c)\r\n    })\r\n   const response= await Promise.all(promises)\r\n   response.forEach((e,i)=>{\r\n    let obj=catArr[i]\r\n    obj.data=e.data\r\n   })\r\n   return {\r\n    statusCode:200,\r\n    body:JSON.stringify({data:catArr})\r\n   }\r\n  }\r\n  catch(error)\r\n  {\r\n    let err = error;\r\n    if (!(err instanceof ErrorResponse)) {\r\n      err = new ErrorResponse();\r\n    }\r\n    return err;\r\n  }\r\n}).use(jsonBodyParser())\r\n.use(httpErrorHandler())\r\n\r\nconst getCategorywiseProducts=async (url,category)=>{\r\n  return new Promise((resolve,reject)=>{\r\n       try{\r\n        const axiosInstance=axios.get(`${url}${category}`)\r\n        resolve(axiosInstance)\r\n       }\r\n       catch(error)\r\n       {\r\n        reject(error)\r\n       }\r\n  })\r\n}\r\n\r\n\r\n\r\n\r\n\n\n//# sourceURL=webpack:///./src/handlers/user.js?");

/***/ }),

/***/ "./src/middleware/validation.js":
/*!**************************************!*\
  !*** ./src/middleware/validation.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const { ErrorResponse } = __webpack_require__(/*! ../utilities/errorResponse */ \"./src/utilities/errorResponse.js\")\r\n const validate = async(schema,data)=> {\r\n    try {\r\n      const { error } = schema.validate(data, { abortEarly: false });\r\n      const valid = error == null;\r\n      if (valid)\r\n      {\r\n        return Promise.resolve({\r\n            status:true\r\n        })\r\n      }\r\n      else\r\n      {\r\n        const { details } = error;\r\n        let message = details.map((i) => i.message).join(',')\r\n         throw new ErrorResponse(\r\n            message=message,\r\n            statusCode=400,\r\n        )\r\n        }\r\n    } \r\n    catch (error) {\r\n      console.log(error,\"err\")\r\n       throw new ErrorResponse(\r\n        message=JSON.parse(error?.body)?.message|| \"Internal server error\",\r\n        statusCode=error.statusCode||500,\r\n      )\r\n    }\r\n   }\r\n\r\n   module.exports={\r\n    validate\r\n   }\n\n//# sourceURL=webpack:///./src/middleware/validation.js?");

/***/ }),

/***/ "./src/models/Auth.js":
/*!****************************!*\
  !*** ./src/models/Auth.js ***!
  \****************************/
/***/ ((module) => {

eval("module.exports.auth=(sequelize,type)=>{\r\n    return sequelize.define('Auth',{\r\n        auth_id:{\r\n            type:type.INTEGER,\r\n            primaryKey:true,\r\n            autoIncrement:true\r\n        },\r\n        access_token:{\r\n            type:type.STRING,\r\n            allowNull:false\r\n        }\r\n    },{\r\n        timestamps:true,\r\n        freezeTableName:true\r\n    })\r\n}\n\n//# sourceURL=webpack:///./src/models/Auth.js?");

/***/ }),

/***/ "./src/models/Role.js":
/*!****************************!*\
  !*** ./src/models/Role.js ***!
  \****************************/
/***/ ((module) => {

eval("module.exports.role=(sequelize,type)=>{\r\n    return sequelize.define('Role',{\r\n        role_id:{\r\n            type:type.INTEGER,\r\n            primaryKey:true,\r\n            autoIncrement:true\r\n        },\r\n        role_name:{\r\n            type:type.ENUM,\r\n             values:['Admin','Member']\r\n        }\r\n    },{\r\n        timestamps:true,\r\n        freezeTableName:true\r\n    })\r\n}\n\n//# sourceURL=webpack:///./src/models/Role.js?");

/***/ }),

/***/ "./src/models/User.js":
/*!****************************!*\
  !*** ./src/models/User.js ***!
  \****************************/
/***/ ((module) => {

eval("\r\nmodule.exports.user=(sequelize,type)=>{\r\n    return sequelize.define('User',\r\n    {\r\n        user_id:{\r\n            type:type.INTEGER,\r\n            primaryKey:true,\r\n            autoIncrement:true\r\n        },\r\n        first_name:{\r\n            type:type.STRING,\r\n        },\r\n        last_name:{\r\n            type:type.STRING,\r\n        },\r\n        email_id:{\r\n            type:type.STRING,\r\n            allowNull:false,\r\n            unique:true\r\n        },\r\n        profileImageUploaded:{\r\n            type:type.STRING\r\n        },\r\n        isActive:{\r\n            type:type.BOOLEAN,\r\n            defaultValue:true\r\n        },\r\n        password:{\r\n            type:type.STRING,\r\n        },\r\n        active_workspace_id:{\r\n            type:type.INTEGER,\r\n            allowNull:false\r\n        }\r\n\r\n    },{\r\n        timestamps:true,\r\n        freezeTableName:true\r\n    })\r\n}\n\n//# sourceURL=webpack:///./src/models/User.js?");

/***/ }),

/***/ "./src/models/UserWorkspace.js":
/*!*************************************!*\
  !*** ./src/models/UserWorkspace.js ***!
  \*************************************/
/***/ ((module) => {

eval("module.exports.userWorkspace=(sequelize,type)=>{\r\n    return sequelize.define('User_Workspace',{\r\n        user_id:{\r\n            type:type.INTEGER,\r\n            allowNull:false\r\n        },\r\n        workspace_id:{\r\n          type:type.INTEGER,\r\n          allowNull:false\r\n        }\r\n    },{\r\n        timestamps:true,\r\n        freezeTableName:true\r\n    })\r\n}\n\n//# sourceURL=webpack:///./src/models/UserWorkspace.js?");

/***/ }),

/***/ "./src/models/Workspace.js":
/*!*********************************!*\
  !*** ./src/models/Workspace.js ***!
  \*********************************/
/***/ ((module) => {

eval("module.exports.workspace=(sequelize,type)=>{\r\n    return sequelize.define('Workspace',{\r\n        workspace_id:{\r\n            type:type.INTEGER,\r\n            primaryKey:true,\r\n            autoIncrement:true\r\n        },\r\n        workspace_name:{\r\n            type:type.STRING,\r\n            allowNull:false\r\n        },\r\n        email_id:{\r\n            type:type.STRING,\r\n            allowNull:false,\r\n            unique:true\r\n        }\r\n    },{\r\n        timestamps:true,\r\n        freezeTableName:true\r\n    })\r\n}\n\n//# sourceURL=webpack:///./src/models/Workspace.js?");

/***/ }),

/***/ "./src/utilities/constant.js":
/*!***********************************!*\
  !*** ./src/utilities/constant.js ***!
  \***********************************/
/***/ ((module) => {

eval("const HTTP_STATUS_CODE = {\r\n    OK: 200,\r\n    CREATED: 201,\r\n    UPDATED: 202,\r\n    CONFLICT:409,\r\n    NO_CONTENT: 204,\r\n    PARTIAL_CONTENT: 206,\r\n    BAD_REQUEST: 400,\r\n    UNAUTHORIZED: 401,\r\n    PAYMENY_REQUIRED: 402,\r\n    ACCESS_FORBIDDEN: 403,\r\n    URL_NOT_FOUND: 404,\r\n    METHOD_NOT_ALLOWED: 405,\r\n    NOT_ACCEPTABLE: 406,\r\n    UNREGISTERED: 410,\r\n    PAYLOAD_TOO_LARGE: 413,\r\n    SOCIAL_ACCOUNT_NOT_EXIST: 424,\r\n    CONCURRENT_LIMITED_EXCEEDED: 429,\r\n    EMAIL_NOT_VERIFIED: 432,\r\n    MOBILE_NUMBER_NOT_VERIFIED: 433,\r\n    USER_BLOCKED: 434,\r\n    USER_DELETED: 435,\r\n    INTERNAL_SERVER_ERROR: 500,\r\n    BAD_GATEWAY: 502,\r\n    SHUTDOWN: 503,\r\n    INTRO__VIDEO_ONE: 511,\r\n    INTRO__VIDEO_TWO: 512,\r\n    INTRO__VIDEO_THREE: 513, // not in use\r\n    PROFILE_AGE: 514,\r\n    PROFILE_GOAL: 515,\r\n    CHALLENGE_SCREEN: 516,\r\n    HOME_SCREEN: 517,\r\n  };\r\n  const MESSAGES = {\r\n    SIGNUP_SUCCESSFUL: \"User registered successfully\",\r\n    LOGIN_SUCCESSFUL: \"User logged in successfully\",\r\n    USER_REGISTERED_LOGIN:\r\n      \"User registered successfully. Please login to verify your account.\",\r\n    API_SUCCESS: \"Success\",\r\n    LOGOUT_SUCCESSFUL: \"User logged out successfully\",\r\n    PASSWORD_UPDATED: \"Password has been Updated!\",\r\n    FORGOT_PASSWORD: \"Reset link Sent on your mail\",\r\n    NOT_MATCHED: \"Not Matched Yet\",\r\n    DELETED: \"Deleted successfully.'\",\r\n    OTP_SENT: \"'Otp sent successfully'\",\r\n    EMAIL_VERIFIED: \"'Email successfully verified '\",\r\n    P_UPDATE: \" 'Profile update successfully'\",\r\n    UPDATE_EMAIL: \" 'Email update successfully'\",\r\n    TOKEN_EXPIRED: \"'Token Expired '\",\r\n    ALREADY_REGISTERED: \" 'An account has already been created.\",\r\n    REG_ALREADY_REGISTERED:\r\n      \"'An account has already been created with this registration number.'\",\r\n    UPDATE_ERROR: \" 'Error in updating data.'\",\r\n    API_ERROR: \" 'Error in Api Execution.'\",\r\n    VALIDATION_ERROR: \" 'Validation error.'\",\r\n    FAILED_TO_ADD: \" 'Failed to Add Data.'\",\r\n    INVALID_CREDENTIALS: \"'Invalid Credentials'\",\r\n    EMAIL_FAILURE: \" 'Email not sent.'\",\r\n    EMAIL_ALREADY_EXISTS: \" 'Email already exists.'\",\r\n    USER_NOT_FOUND: \" 'User Not Found'\",\r\n    UNAUTHORIZED: \"'Unauthorized Access.'\",\r\n    FAILED_TO_UPDATE: \"Failed to Update.\",\r\n    FAILED_TO_DELETE: \"'Failed to Delete Data.'\",\r\n    SOMETHING_WRONG: \"Something went wrong\",\r\n    INVALID_EMAIL: \"'invalid email id'\",\r\n    INVALID_OTP: \"'invalid otp'\",\r\n    SIGNUP_FAILED: \"'Your signUp failed'\",\r\n    EMAIL_NOT_VERIFIED: \"'Email is not verified'\",\r\n    INVALID_TOKEN: \"'Your token is invalid.'\",\r\n    EMAIL_v_FAILED: \"'Email verification is failed'\",\r\n    MISSING_TOKEN: \"'Missing token'\",\r\n    MISSING_P: \"'Missing parameter'\",\r\n    OTP_NOT_SEND: \"Otp not send successfully\",\r\n    OTP_EXPIRED: \"Otp has expired\",\r\n    NOT_FOUND: \"Data not found\",\r\n    TOTAL_LOGIN:\r\n      \"You've reached the maximum login limits. Please logout of other devices and login again.\",\r\n    WRONG_PASSWORD: \"'Incorrect password'\",\r\n    INVALID_ROUTE: \"Invalid route\",\r\n    MISSING_API_KEY: \"Missing API key\",\r\n    INVALID_API_KEY: \"Api key is invalid\",\r\n    USER_BLOCKED: \"User is blocked\",\r\n    OTP_VERIFIED: \" otp verified\",\r\n    UPDATED_SUCCESS: \"Updated successfully\",\r\n    OTP_INCORRECT: \"Otp incorrect\",\r\n    PHONE_NO_EXISTS: \"Phone number already exists\",\r\n    BAD_REQUEST: \"Bad request\",\r\n    INTERNAL_SERVER_ERROR:\"Internal Server Error\",\r\n    INVALID_HEADERS:\"Invalid columns\",\r\n    EMPTY_FILE:\"File is empty\",\r\n    MISSING_DATA:\"Missing data\",\r\n    DATA_ALREADY_EXISTS:\"Data already exist\",\r\n    INVALID_CREDENTIALS:\"Email or password did not match\",\r\n    USER_EXISTS:\"User already exixts\"\r\n  };\r\n  const ROLE={\r\n    ADMIN:1,\r\n    MEMBER:2\r\n  }\r\n  const PERMITTED_HEADERS=['FirstName','LastName','Email']\r\n  module.exports={\r\n    HTTP_STATUS_CODE,\r\n    MESSAGES,\r\n    ROLE,\r\n    PERMITTED_HEADERS\r\n  }\n\n//# sourceURL=webpack:///./src/utilities/constant.js?");

/***/ }),

/***/ "./src/utilities/errorResponse.js":
/*!****************************************!*\
  !*** ./src/utilities/errorResponse.js ***!
  \****************************************/
/***/ ((module) => {

eval(" class ErrorResponse {\r\n    constructor(\r\n      message = 'Something went wrong',\r\n      statusCode = 500,\r\n      data={}      \r\n    ) {\r\n      const body = JSON.stringify({ message,data });\r\n      this.statusCode = statusCode;\r\n      this.body = body;\r\n      this.headers = {\r\n        'Content-Type': 'application/json',\r\n      };\r\n    }\r\n  }\r\n\r\nmodule.exports= {\r\n    ErrorResponse\r\n  }\n\n//# sourceURL=webpack:///./src/utilities/errorResponse.js?");

/***/ }),

/***/ "./src/utilities/s3.js":
/*!*****************************!*\
  !*** ./src/utilities/s3.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("(__webpack_require__(/*! dotenv */ \"dotenv\").config)()\r\nconst S3 = __webpack_require__(/*! aws-sdk/clients/s3 */ \"aws-sdk/clients/s3\")\r\nconst { ErrorResponse } = __webpack_require__(/*! ./errorResponse */ \"./src/utilities/errorResponse.js\")\r\n\r\nconst s3 = new S3({\r\n  accessKeyId: process.env.AWS_ACCESS_KEY1,\r\n  secretAccessKey: process.env.AWS_SECRET_KEY1,\r\n  region: process.env.AWS_BUCKET_REGION\r\n})\r\n\r\nfunction uploadExcelFile (stream) {\r\n    const uploadParams = {\r\n      Key: `${Date.now()}_users.xlsx`,\r\n      Bucket: process.env.AWS_BUCKET_NAME,\r\n      Body: stream,\r\n      ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'\r\n    }\r\n    try{\r\n      return s3.upload(uploadParams).promise()\r\n    }\r\n    catch(error)\r\n    {\r\n      return Promise.reject({status:false})\r\n    }\r\n    \r\n  }\r\n  function downloadExcelFile (key) {\r\n    const params = {\r\n      Key: key,\r\n      Bucket: process.env.AWS_BUCKET_NAME,\r\n      Expires: 60 * 5,\r\n      ResponseContentDisposition: 'attachement; filename=\"' + key + '\"'\r\n    }\r\n    try {\r\n      return new Promise((resolve, reject) => {\r\n        s3.getSignedUrl('getObject', params, (err, url) => {\r\n          if (err) {\r\n            reject(err)\r\n          }\r\n          resolve(url)\r\n        })\r\n      })\r\n    } catch (error) {\r\n      return Promise.reject({status:false})\r\n    }\r\n  }\r\n\r\n async function uploadImage(fileObj){\r\n  const params={\r\n     Body:fileObj.content,\r\n     Key:\"imageUpload/\"+fileObj.filename,\r\n     ContentType:fileObj.ContentType,\r\n     Bucket:process.env.AWS_BUCKET_NAME,\r\n    // ACL:'public-read'\r\n  }\r\n  try{\r\n    return s3.upload(params).promise()\r\n  }\r\n  catch(error)\r\n  { console.log(error)\r\n    throw error\r\n  }\r\n \r\n}\r\nmodule.exports={\r\n    uploadExcelFile,\r\n    downloadExcelFile,\r\n    uploadImage\r\n}\n\n//# sourceURL=webpack:///./src/utilities/s3.js?");

/***/ }),

/***/ "./src/utilities/ses.js":
/*!******************************!*\
  !*** ./src/utilities/ses.js ***!
  \******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const { SendEmailCommand, SESClient } = __webpack_require__(/*! @aws-sdk/client-ses */ \"@aws-sdk/client-ses\");\r\nconst { join } = __webpack_require__(/*! path */ \"path\")\r\nconst { renderFile } = __webpack_require__(/*! ejs */ \"ejs\")\r\n\r\nconst client = new SESClient({\r\n  region: process.env.SES_REGION,\r\n  credentials: {\r\n    accessKeyId: process.env.AWS_ACCESS_KEY1,\r\n    secretAccessKey: process.env.AWS_SECRET_KEY1,\r\n  },\r\n});\r\nasync function generateTemplate({ name, content }) {\r\n  return renderFile(\r\n    join(__dirname + '/../templates/', `${name}.ejs`),\r\n    content,\r\n  );\r\n}\r\nconst sendEmailSES = async (to, subject, message, from) => {\r\n  const sendEmailCommand = new SendEmailCommand({\r\n    Destination: {\r\n      ToAddresses: [to]\r\n    },\r\n    Message: {\r\n      Body: {\r\n        Html: {\r\n          Charset: 'UTF-8',\r\n          Data: await generateTemplate({ name: \"exportFile\", content: message })\r\n        }\r\n      },\r\n      Subject: {\r\n        Charset: 'UTF-8',\r\n        Data: subject\r\n      }\r\n    },\r\n    ReturnPath: from,\r\n    Source: from\r\n  })\r\n  try {\r\n   const d= await client.send(sendEmailCommand);\r\n   console.log(d,\"we\")\r\n  } catch (error) {\r\n    throw new Error(error);\r\n  }\r\n}\r\n\r\nmodule.exports = { sendEmailSES }\n\n//# sourceURL=webpack:///./src/utilities/ses.js?");

/***/ }),

/***/ "./src/validationSchema/user.js":
/*!**************************************!*\
  !*** ./src/validationSchema/user.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const Joi = (__webpack_require__(/*! joi */ \"joi\").extend)(__webpack_require__(/*! @joi/date */ \"@joi/date\"));\r\n\r\nconst registerSchema = Joi.object().keys({\r\n    first_name: Joi.string().required().empty(''),\r\n    last_name: Joi.string().required().empty(''),\r\n    email_id: Joi.string().email().required().empty(''),\r\n    password: Joi.string().min(8).max(15).required().empty(''),\r\n})\r\n\r\nconst exportFileSchema=Joi.object({\r\n    startDate: Joi.date().format('YYYY-MM-DD'),\r\n    endDate: Joi.date().format('YYYY-MM-DD'),\r\n    isActive: Joi.boolean()\r\n}).or('startDate','endDate')\r\n\r\nmodule.exports = {\r\n    registerSchema,\r\n    exportFileSchema\r\n}\n\n//# sourceURL=webpack:///./src/validationSchema/user.js?");

/***/ }),

/***/ "@aws-sdk/client-ses":
/*!**************************************!*\
  !*** external "@aws-sdk/client-ses" ***!
  \**************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@aws-sdk/client-ses");

/***/ }),

/***/ "@joi/date":
/*!****************************!*\
  !*** external "@joi/date" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("@joi/date");

/***/ }),

/***/ "@middy/core":
/*!******************************!*\
  !*** external "@middy/core" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("@middy/core");

/***/ }),

/***/ "@middy/http-error-handler":
/*!********************************************!*\
  !*** external "@middy/http-error-handler" ***!
  \********************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@middy/http-error-handler");

/***/ }),

/***/ "@middy/http-json-body-parser":
/*!***********************************************!*\
  !*** external "@middy/http-json-body-parser" ***!
  \***********************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@middy/http-json-body-parser");

/***/ }),

/***/ "@sequelize/core":
/*!**********************************!*\
  !*** external "@sequelize/core" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@sequelize/core");

/***/ }),

/***/ "aws-sdk/clients/s3":
/*!*************************************!*\
  !*** external "aws-sdk/clients/s3" ***!
  \*************************************/
/***/ ((module) => {

"use strict";
module.exports = require("aws-sdk/clients/s3");

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("axios");

/***/ }),

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("bcryptjs");

/***/ }),

/***/ "chrome-aws-lambda":
/*!************************************!*\
  !*** external "chrome-aws-lambda" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("chrome-aws-lambda");

/***/ }),

/***/ "csvtojson":
/*!****************************!*\
  !*** external "csvtojson" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("csvtojson");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("dotenv");

/***/ }),

/***/ "ejs":
/*!**********************!*\
  !*** external "ejs" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("ejs");

/***/ }),

/***/ "exceljs":
/*!**************************!*\
  !*** external "exceljs" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("exceljs");

/***/ }),

/***/ "handlebars":
/*!*****************************!*\
  !*** external "handlebars" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("handlebars");

/***/ }),

/***/ "joi":
/*!**********************!*\
  !*** external "joi" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("joi");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("jsonwebtoken");

/***/ }),

/***/ "lambda-multipart-parser":
/*!******************************************!*\
  !*** external "lambda-multipart-parser" ***!
  \******************************************/
/***/ ((module) => {

"use strict";
module.exports = require("lambda-multipart-parser");

/***/ }),

/***/ "pdf-creator-node":
/*!***********************************!*\
  !*** external "pdf-creator-node" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("pdf-creator-node");

/***/ }),

/***/ "pg":
/*!*********************!*\
  !*** external "pg" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("pg");

/***/ }),

/***/ "sequelize":
/*!****************************!*\
  !*** external "sequelize" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("sequelize");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "xlsx":
/*!***********************!*\
  !*** external "xlsx" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("xlsx");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/handlers/user.js");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;