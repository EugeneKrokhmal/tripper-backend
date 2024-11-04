const paypal = require('@paypal/checkout-server-sdk');

let environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
let client = new paypal.core.PayPalHttpClient(environment);

async function createPayout(email, amount) {
  const requestBody = {
    sender_batch_header: {
      recipient_type: 'EMAIL',
      email_subject: 'You have a payout!',
      email_message: 'You have received a payout!'
    },
    items: [
      {
        recipient_type: 'EMAIL',
        amount: {
          value: amount,
          currency: 'USD'
        },
        receiver: email,
        note: 'Thank you!',
        sender_item_id: 'item-1'
      }
    ]
  };

  // Ensure the correct initialization of the PayoutsPostRequest
  const request = new paypal.payouts.PayoutsPostRequest();
  request.requestBody(requestBody);

  try {
    const response = await client.execute(request);
    return response.result;
  } catch (error) {
    console.error('Payout creation failed:', error);
    throw error;
  }
}

module.exports = {
  createPayout
};
