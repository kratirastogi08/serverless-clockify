module.exports.project=(sequelize,type)=>{
    return sequelize.define('Project',{
        project_id:{
            type:type.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        project_name:{
            type:type.STRING,
            allowNull:false
        },
        is_billable:{
            type:type.BOOLEAN,
            defaultValue:true
        },
        is_active:{
            type:type.BOOLEAN,
            defaultValue:true
        },
        is_delete:{
            type:type.BOOLEAN,
            defaultValue:false 
        },
        hourly_rate:{
            type:type.INTEGER,
            defaultValue:0
        },
        project_color:{
            type:type.STRING,
            allowNull:false
        },
        visibility:{
            type:type.BOOLEAN,
            defaultValue: true
        },
        access_ids:{
            type:type.JSONB,
            defaultValue:[]
        },

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