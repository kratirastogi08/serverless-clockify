const aws = require('aws-sdk')

aws.config.update({
    region: 'eu-north-1',
    accessKeyId: process.env.AWS_ACCESS_KEY1,
    secretAccessKey: process.env.AWS_SECRET_KEY1
  })