import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from "sonner";
import axios from "axios";
import { JWT_HOST_API } from 'configs/auth.config';
import { Spinner,  Button } from 'components/ui';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const CheckoutSuccess = () => {
  // const user = getUserData()
  const token = localStorage.getItem('authToken')
  const subscriptionAmount = sessionStorage.getItem('subscription_amount')
  const navigate = useNavigate()
  const device = localStorage.getItem('device_type')
  const [loading, setLoading] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null);
  // const location = useLocation();

  const getOrderDetails = async (sessionId) => {
    setLoading(true)
    const config = {
      method: "get",
      url: `${JWT_HOST_API}/stripe/session/${sessionId}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-platform': device
      }
    }
    axios(config).then(async (response) => {
      setLoading(false)
      if (response.data.status === 200) {
        setOrderDetails(response.data.data)
      } else if (response.data.status === 401) {
        toast.error(response.data.message);
      } else if (response.data.status === 204) {
        return null
      } else {
        toast.error(response.data.message);
      }
    }).catch((error) => {
      setLoading(false)
      if (error && error.message) {
        toast.error(error.message);
      }
      else {
        toast.error("This Service is not available at the moment..please try again later");
      }
    })
  }

  useEffect(() => {
    const sessionId = sessionStorage.getItem('session_id')
    if (sessionId) {
      getOrderDetails(sessionId)
    }
  }, []);

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100 px-4'>
    <div className="max-w-[750px] mx-auto rounded-lg shadow-md bg-white p-6 text-center">
      <CheckCircleIcon className="mx-auto mb-5 h-28 w-28 text-green-500" />

      <h2 className="text-2xl font-semibold mb-1">Subscription Successful!</h2>

      <p className="text-gray-500 mb-2">
        {orderDetails?.payment_status === 'no_payment_required' ? 'Thank you for your purchase. Your subscription has been received and is being processed.' : 'Thank you for your purchase. Your order has been received and is being processed.'}
      </p>

      {loading && <Spinner />}

      {orderDetails && (
        <div className="mt-4 text-left">
          <h5 className="text-lg font-medium mb-2">Order Details</h5>
          <p className="text-gray-700">Order ID: {orderDetails?.invoice_id || orderDetails?.subscription_id}</p>
          <p className="text-gray-700">Amount: ${ subscriptionAmount || orderDetails?.amount_total}</p>
          <p className="text-gray-700" style={{textTransform: 'capitalize'}}>Payment Status: {orderDetails?.payment_status === 'no_payment_required' ? 'In Progress' : orderDetails?.payment_status}</p>
        </div>
      )}

      <div className="mt-6">
        <Button
          color='primary'
          onClick={() => navigate('/subscriptions')}
          className="inline-block rounded-md px-5 py-2 text-white hover:bg-blue-700 transition"
        >
          Return to Subscriptions
        </Button>
      </div>
    </div>
    </div>
  );
};

export default CheckoutSuccess; 