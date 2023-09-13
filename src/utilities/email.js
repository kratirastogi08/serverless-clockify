const nodemailer = require('nodemailer')
const { renderFile } = require('ejs')



const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'kratirastogi99196@gmail.com',
      pass: 'lsttogahubbcmjgv'
    }
  })

  const sendEmail = async (receiver, subject, content) => {
    return new Promise((resolve, reject) => {
      renderFile(
        // eslint-disable-next-line n/no-path-concat
        __dirname + '/../templates/email.ejs',
        { receiver, content },
        (err, data) => {
          if (err) {
            console.log(err,"err")
            reject(false)
          } else {
            console.log(data)
            console.log(receiver)
            const mailOptions = {
              from: 'kratirastogi99196@gmail.com',
              to: receiver,
              subject,
              html: data
            }
            transport.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error)
                reject(false)
              }
              console.log('Message sent: %s', info.messageId)
              resolve(true)
            })
          }
        }
      )
    })
  }
module.exports={
    sendEmail
}  