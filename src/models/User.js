
module.exports.user=(sequelize,type)=>{
    return sequelize.define('User',
    {
        user_id:{
            type:type.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        first_name:{
            type:type.STRING,
        },
        last_name:{
            type:type.STRING,
        },
        full_name:{
            type:  new type.VIRTUAL(type.STRING, ['first_name','last_name']),
            get() {
              return `${this.first_name} ${this.last_name}`;
            },
        },
        email_id:{
            type:type.STRING,
            allowNull:false,
            unique:true
        },
        profileImageUploaded:{
            type:type.STRING
        },
        isActive:{
            type:type.BOOLEAN,
            defaultValue:true
        },
        password:{
            type:type.STRING,
        },
        active_workspace_id:{
            type:type.INTEGER,
            allowNull:false
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