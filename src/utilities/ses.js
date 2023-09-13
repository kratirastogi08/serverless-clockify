const { SendEmailCommand, SESClient } = require('@aws-sdk/client-ses');
const { join } = require('path')
const { renderFile } = require('ejs')

const client = new SESClient({
  region: process.env.SES_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY1,
    secretAccessKey: process.env.AWS_SECRET_KEY1,
  },
});
async function generateTemplate({ name, content }) {
  return renderFile(
    join(__dirname + '/../templates/', `${name}.ejs`),
    content,
  );
}
const sendEmailSES = async (to, subject, message, from) => {
  const sendEmailCommand = new SendEmailCommand({
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: await generateTemplate({ name: "exportFile", content: message })
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    ReturnPath: from,
    Source: from
  })
  try {
   const d= await client.send(sendEmailCommand);
   console.log(d,"we")
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = { sendEmailSES }