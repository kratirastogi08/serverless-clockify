module.exports.auth=(sequelize,type)=>{
    return sequelize.define('Auth',{
        auth_id:{
            type:type.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        access_token:{
            type:type.STRING,
            allowNull:false
        }
    },{
        timestamps:true,
        freezeTableName:true
    })
}