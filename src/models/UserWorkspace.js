module.exports.userWorkspace=(sequelize,type)=>{
    return sequelize.define('User_Workspace',{
        user_id:{
            type:type.INTEGER,
            allowNull:false
        },
        workspace_id:{
          type:type.INTEGER,
          allowNull:false
        }
    },{
        timestamps:true,
        freezeTableName:true
    })
}