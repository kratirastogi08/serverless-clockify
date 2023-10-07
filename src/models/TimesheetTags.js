module.exports.timesheetTags=(sequelize,type)=>{
    return sequelize.define('Timesheet_Tags',{
        timesheet_id:{
            type:type.INTEGER,
            allowNull:false
        },
        tag_id:{
          type:type.INTEGER,
          allowNull:false
        }
    },{
        timestamps:false,
        freezeTableName:true
    })
}