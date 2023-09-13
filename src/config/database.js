const Sequelize=require('sequelize')
const {user}=require('../models/User')
const {role}=require('../models/Role')
const {auth}=require('../models/Auth')
const {workspace}=require("../models/Workspace")
const {userWorkspace}=require("../models/UserWorkspace")
 const pg=require("pg")
const sequelize=new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect:'postgres',
        dialectModule: pg,
        host:process.env.DB_HSOT,
        port:process.env.DB_PORT,
        logging:console.log,
        query:{raw:true}
    }
)
const connection={}
const User=user(sequelize,Sequelize)
const Role=role(sequelize,Sequelize)
const Auth=auth(sequelize,Sequelize)
const Workspace=workspace(sequelize,Sequelize)
const UserWorkspace=userWorkspace(sequelize,Sequelize)
Workspace.belongsToMany(User,{through:"User_Workspace",as:"workspaces",foreignKey:"workspace_id"})
User.belongsToMany(Workspace,{through:"User_Workspace",as:"users",foreignKey:"user_id"})
User.hasOne(Auth,{foreignKey:'user_id'})
Auth.belongsTo(User,{foreignKey:'user_id'})
Role.hasMany(User,{
foreignKey:"role_id"
})
User.belongsTo(Role,{
    foreignKey:"role_id"
})
const Models={
    User,
    Role,
    Auth,
    Workspace,
    UserWorkspace,
    sequelize
}

module.exports = async () => {
    if (connection.isConnected) {
      console.log('=> Using existing connection.')
      return Models
    }
  
    await sequelize.sync({alter:true})
    await sequelize.authenticate()
    connection.isConnected = true
    console.log('=> Created a new connection.')
    return Models
  }
