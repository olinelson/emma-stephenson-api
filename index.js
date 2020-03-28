require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const mailgun = require('mailgun-js')({ apiKey: process.env.MAIL_GUN_API_KEY, domain: process.env.MAIL_GUN_DOMAIN })
const stripe = require('stripe')(process.env.STRIPE_API_KEY)
const endpointSecret = process.env.STRIPE_SIGNING_SECRET
const bodyParser = require('body-parser')

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.post('/stripe_events', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
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
      var { email, name } = event.data.object

      var emailData = {
        from: 'Piano With Miss Emma <pianowithmissemma@gmail.com>',
        to: email,
        subject: 'Access to PDFs',
        template: 'gained_access',
        'v:name': name
      }

      await mailgun.messages().send(emailData)
      res.status(200).send()

      break
    default:
      return res.status(400).end()
  }

  // Return a res to acknowledge receipt of the event
  // token
  res.json({ received: true })
})
