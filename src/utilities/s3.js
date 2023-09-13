require('dotenv').config()
const S3 = require('aws-sdk/clients/s3')
const { ErrorResponse } = require('./errorResponse')

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY1,
  secretAccessKey: process.env.AWS_SECRET_KEY1,
  region: process.env.AWS_BUCKET_REGION
})

function uploadExcelFile (stream) {
    const uploadParams = {
      Key: `${Date.now()}_users.xlsx`,
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: stream,
      ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
    try{
      return s3.upload(uploadParams).promise()
    }
    catch(error)
    {
      return Promise.reject({status:false})
    }
    
  }
  function downloadExcelFile (key) {
    const params = {
      Key: key,
      Bucket: process.env.AWS_BUCKET_NAME,
      Expires: 60 * 5,
      ResponseContentDisposition: 'attachement; filename="' + key + '"'
    }
    try {
      return new Promise((resolve, reject) => {
        s3.getSignedUrl('getObject', params, (err, url) => {
          if (err) {
            reject(err)
          }
          resolve(url)
        })
      })
    } catch (error) {
      return Promise.reject({status:false})
    }
  }

 async function uploadImage(fileObj){
  const params={
     Body:fileObj.content,
     Key:"imageUpload/"+fileObj.filename,
     ContentType:fileObj.ContentType,
     Bucket:process.env.AWS_BUCKET_NAME,
    // ACL:'public-read'
  }
  try{
    return s3.upload(params).promise()
  }
  catch(error)
  { console.log(error)
    throw error
  }
 
}
module.exports={
    uploadExcelFile,
    downloadExcelFile,
    uploadImage
}