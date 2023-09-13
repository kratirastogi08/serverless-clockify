module.exports.role=(sequelize,type)=>{
    return sequelize.define('Role',{
        role_id:{
            type:type.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        role_name:{
            type:type.ENUM,
             values:['Admin','Member']
        }
    },{
        timestamps:true,
        freezeTableName:true
    })
}