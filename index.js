require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const mailgun = require('mailgun-js')({ apiKey: process.env.MAIL_GUN_API_KEY, domain: process.env.MAIL_GUN_DOMAIN })
const stripe = require('stripe')(process.env.STRIPE_API_KEY)
const endpointSecret = process.env.STRIPE_SIGNING_SECRET

app.use(express.json())

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.get('/ping', (req, res) => {
  res.status(200).send({ pong: true })
})

app.post('/stripe_events', async (req, res) => {
  const sig = req.headers['stripe-signature']

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case 'customer.created':
      var { email, name } = req.body.data.object

      var emailData = {
        from: 'Piano With Miss Emma <pianowithmissemma@gmail.com>',
        to: email,
        template: 'gained_access',
        'v:customerName': name
      }

      await mailgun.messages().send(emailData)
      res.status(200).send()

      break
    default:
      return res.status(400).end()
  }

  // Return a res to acknowledge receipt of the event
  res.json({ received: true })
})
