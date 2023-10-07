module.exports.client=(sequelize,type)=>{
    return sequelize.define('Client',{
        client_id:{
            type:type.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        client_name:{
            type:type.STRING,
            allowNull:false
        },
        is_active:{
            type:type.BOOLEAN,
            defaultValue:true
        },
        email_id:{
            type:type.STRING,
            unique:true
        },
        address:{
            type:type.STRING,
        }

    },{
        timestamps:true,
        freezeTableName:true,
        defaultScope: {
            attributes: {
              exclude: ['createdAt','updatedAt']
            }
          }
    })
}