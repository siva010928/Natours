const stripe = Stripe(
  'pk_test_51IibuMSCXtL5yOrlVd1j68ZPkoUTrPPSBYnrqjIHasD7pxp5ZzcYUt0rw6qYDnAF5o2dswemdsbgDhNXRwtxZEho00ycDgTOSe'
);
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const session = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
