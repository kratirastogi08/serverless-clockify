const { ErrorResponse } = require("../utilities/errorResponse")
 const validate = async(schema,data)=> {
    try {
      const { error } = schema.validate(data, { abortEarly: false });
      const valid = error == null;
      if (valid)
      {
        return Promise.resolve({
            status:true
        })
      }
      else
      {
        const { details } = error;
        let message = details.map((i) => i.message).join(',')
         throw new ErrorResponse(
            message=message,
            statusCode=400,
        )
        }
    } 
    catch (error) {
      console.log(error,"err")
       throw new ErrorResponse(
        message=JSON.parse(error?.body)?.message|| "Internal server error",
        statusCode=error.statusCode||500,
      )
    }
   }

   module.exports={
    validate
   }