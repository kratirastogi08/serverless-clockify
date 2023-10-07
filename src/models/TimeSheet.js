module.exports.timesheet=(sequelize,type)=>{
    return sequelize.define('TimeSheet',{
        timesheet_id:{
            type:type.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        description:{
           type: type.STRING,
           allowNull: false
        },
        work_date:{
            type:type.DATEONLY,
            allowNull:false
        },
        start_time:{
            type:type.DATE,
            allowNull: false
        },
        end_time:{
            type:type.DATE,
            allowNull: false
        },
        is_billable:{
            type:type.BOOLEAN,
            defaultValue: false
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