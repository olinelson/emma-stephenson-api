require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const mailgun = require('mailgun-js')({ apiKey: process.env.MAIL_GUN_API_KEY, domain: process.env.MAIL_GUN_DOMAIN })
const stripe = require('stripe')(process.env.STRIPE_API_KEY)
const endpointSecret = process.env.STRIPE_SIGNING_SECRET
const bodyParser = require('body-parser')

const sendCheckoutNotificationToSeller = async (event) => {
  const data = event.data.object
  const { amount, billing_details, currency, receipt_url } = data

  const emailData = {
    from: 'Piano With Miss Emma <pianowithmissemma@gmail.com>',
    to: 'emmagrace91@gmail.com',
    subject: 'You Have A New Order!',
    template: 'new_order',
    'v:owner_name': 'Emma',
    'v:company_name': 'Piano With Miss Emma',
    'v:customer_name': billing_details.name,
    'v:customer_email': billing_details.email,
    'v:amount': amount,
    'v:currency': currency,
    'v:receipt_url': receipt_url,
    'v:stripe_dashboard_link': 'https://dashboard.stripe.com/'

  }
  await mailgun.messages().send(emailData)
}

const sendGainedAccessEmailToCustomer = async (event) => {
  var { email, name } = event.data.object

  const emailData = {
    from: 'Piano With Miss Emma <pianowithmissemma@gmail.com>',
    to: email,
    subject: 'Access to PDFs',
    template: 'gained_access',
    'v:name': name
  }

  await mailgun.messages().send(emailData)
}

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
      sendGainedAccessEmailToCustomer(event)
      break

    case 'charge.succeeded':
      await sendCheckoutNotificationToSeller(event)
      break
    default:
      return res.status(400).send()
  }

  // Return a res to acknowledge receipt of the event
  res.json({ received: true })
})
