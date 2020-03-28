require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000

const mailgun = require('mailgun-js')({ apiKey: process.env.MAIL_GUN_API_KEY, domain: process.env.MAIL_GUN_DOMAIN })

app.use(express.json())

app.get('/ping', (req, res) => {
  res.status(200).send({ pong: true })
})

app.post('/customer_created', async (req, res) => {
  try {
    const { email, name } = req.body.data[0]

    const emailData = {
      from: 'Piano With Miss Emma <pianowithmissemma@gmail.com>',
      to: email,
      subject: 'Access to PDFs',
      text: `
          Hi, ${name}

          Thanks for purchasing the starter kit for Piano With Miss Emma!

          I am processing your order now and your package should arrive within 10 days of your purchase.As indicated on the order page, you will be charged for postage when I have processed your order.Estimates for postage costs are available on the order page and I will notify you prior to posting if the postage fee deviates significantly from those estimates.

          You are now granted access to this folder of my PDF resources, including my booklet of coloured finger number arrangements of songs that kids know and love.These resources can be used in conjunction with the kit that you just purchased, and the videos on the Piano with Miss Emma youtube channel.Here's the link:

          https://drive.google.com/drive/folders/18CbfbT89S7OdZWeJpsJNGzpjFke1R91z?usp=sharing

              Please feel free to email me with questions

          pianowithmissemma@gmail.com

          Many thanks!
          Emma
          `
    }

    await mailgun.messages().send(emailData)
  } catch (error) {
    res.status(200).send()
  }
})
app.get('/test', async (req, res) => {
  try {
    email = 'olinelson93@gmail.com'
    name = 'Olaf Olafson'

    const emailData = {
      from: 'Piano With Miss Emma <pianowithmissemma@gmail.com>',
      to: email,
      subject: 'Access to PDFs',
      text: `
Hi ${name},

Thanks for purchasing the starter kit for Piano With Miss Emma!

I am processing your order now and your package should arrive within 10 days of your purchase. As indicated on the order page, you will be charged for postage when I have processed your order. Estimates for postage costs are available on the order page and I will notify you prior to posting if the postage fee deviates significantly from those estimates.

You are now granted access to this folder of my PDF resources, including my booklet of coloured finger number arrangements of songs that kids know and love.These resources can be used in conjunction with the kit that you just purchased, and the videos on the Piano with Miss Emma youtube channel.Here's the link:

https://drive.google.com/drive/folders/18CbfbT89S7OdZWeJpsJNGzpjFke1R91z?usp=sharing

Please feel free to email me with questions

pianowithmissemma@gmail.com

Many thanks!
Emma
`
    }

    await mailgun.messages().send(emailData)
    res.status(200).send()
  } catch (error) {
    res.status(500).send()
  }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
