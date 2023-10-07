const Sequelize = require('sequelize')
const { user } = require('../models/User')
const { role } = require('../models/Role')
const { auth } = require('../models/Auth')
const { workspace } = require("../models/Workspace")
const { userWorkspace } = require("../models/UserWorkspace")
const { project } = require("../models/Project")
const { client } = require("../models/Client")
const { task } = require("../models/Task")
const {tag}=require("../models/Tag")
const {timesheet}=require("../models/TimeSheet")
const { timesheetTags } = require("../models/TimesheetTags")
const pg = require("pg")
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: 'postgres',
        dialectModule: pg,
        host: process.env.DB_HSOT,
        port: process.env.DB_PORT,
        logging: console.log,
    }
)
const connection = {}
const User = user(sequelize, Sequelize)
const Role = role(sequelize, Sequelize)
const Auth = auth(sequelize, Sequelize)
const Workspace = workspace(sequelize, Sequelize)
const UserWorkspace = userWorkspace(sequelize, Sequelize)
const Project = project(sequelize, Sequelize)
const Client = client(sequelize, Sequelize)
const Task = task(sequelize, Sequelize)
const Tag=tag(sequelize,Sequelize)
const TimeSheet=timesheet(sequelize,Sequelize)
const TimesheetTags=timesheetTags(sequelize,Sequelize)
Workspace.hasMany(TimeSheet,{ foreignKey: 'workspace_id'})
TimeSheet.belongsTo(Workspace,{foreignKey:"workspace_id"})
User.hasMany(TimeSheet,{ foreignKey: 'user_id'})
TimeSheet.belongsTo(User,{foreignKey:"user_id"})
Project.hasMany(TimeSheet,{ foreignKey: 'project_id'})
TimeSheet.belongsTo(Project,{foreignKey:"project_id"})
Client.hasMany(TimeSheet,{ foreignKey: 'client_id'})
TimeSheet.belongsTo(Client,{foreignKey:"client_id"})
Task.hasMany(TimeSheet,{ foreignKey: 'task_id'})
TimeSheet.belongsTo(Task,{foreignKey:"task_id"})
Workspace.belongsToMany(User, { through: "User_Workspace", as:"users", foreignKey: "workspace_id" })
User.belongsToMany(Workspace, { through: "User_Workspace", as:"workspaces", foreignKey: "user_id" })
TimeSheet.belongsToMany(Tag,{through: "Timesheet_Tags", as:"tags", foreignKey: "timesheet_id"})
Tag.belongsToMany(TimeSheet,{through: "Timesheet_Tags", as:"timesheet", foreignKey: "tag_id"})
User.hasOne(Auth, { foreignKey: 'user_id' })
Auth.belongsTo(User, { foreignKey: 'user_id' })
Role.hasMany(User, {
    foreignKey: "role_id"
})
User.belongsTo(Role, {
    foreignKey: "role_id"
})
Client.hasMany(Project, {
    foreignKey: "client_id",
    as:"projects"
})
Project.belongsTo(Client, {
    foreignKey: "client_id",
    as: "client"
})
Workspace.hasMany(Client, {
    foreignKey: "workspace_id"
})
Client.belongsTo(Workspace, {
    foreignKey: "workspace_id"
})
Workspace.hasMany(Project, {
    foreignKey: "workspace_id"
})
Project.belongsTo(Workspace, {
    foreignKey: "workspace_id"
})
Project.hasMany(Task, {
    foreignKey: "project_id"
})
User.hasOne(Project,{
foreignKey:"created_by"
})
Task.belongsTo(Project, {
    foreignKey: "project_id"
})
User.hasOne(Task, {
    foreignKey: "created_by"
})
Workspace.hasMany(Tag,{
    foreignKey:"workspace_id"
})
Tag.belongsTo(Workspace,{
    foreignKey:"workspace_id"
})
User.hasOne(Tag,{
    foreignKey:"created_by"
})
const Models = {
    User,
    Role,
    Auth,
    Workspace,
    UserWorkspace,
    Project,
    Client,
    Task,
    Tag,
    TimeSheet,
    TimesheetTags,
    sequelize
}

module.exports = async () => {
    if (connection.isConnected) {
        console.log('=> Using existing connection.')
        return Models
    }

    await sequelize.sync({ alter: true })
    await sequelize.authenticate()
    connection.isConnected = true
    console.log('=> Created a new connection.')
    return Models
}
