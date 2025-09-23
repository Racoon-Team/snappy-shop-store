import requests from './httpServices';

const PaymentServices = {
  getBankToken: async () => {
    const res = await requests.post('/payment/token', {
      accountId: '123456789',
      authorizationId: 'AUTH-987654',
    });
    return res.data ?? res;
  },

  createPaymentQr: async ({ token, amount, orderId }) => {
    const res = await requests.post(
      '/payment/qr',
      { amount, orderId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data ?? res;
  },
};

export default PaymentServices;
