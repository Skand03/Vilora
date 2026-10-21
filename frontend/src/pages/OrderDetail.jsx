import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper, Button } from '../components';
import { FiArrowLeft, FiTruck, FiAlertTriangle, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { ordersApi } from '../api/apiClient';
import toast from 'react-hot-toast';

const money = (value) => `₹${Math.round(value || 0).toLocaleString('en-IN')}`;

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-300',
  PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-300',
  DELIVERED: 'bg-green-100 text-green-800 border-green-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300',
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrder = async () => {
    try {
      const { data } = await ordersApi.getOrderById(id);
      setOrder(data.data);
    } catch (error) {
      toast.error('Failed to fetch order details.');
      navigate('/account/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await ordersApi.cancelOrder(id);
      toast.success('Order has been cancelled successfully.');
      setOrder(res.data?.data || { ...order, status: 'CANCELLED' });
      setShowCancelModal(false);
    } catch (err) {
      toast.error(err.message || 'Unable to cancel this order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-cream flex justify-center py-20">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-gold/30 border-t-gold" />
        </div>
      </PageWrapper>
    );
  }

  if (!order) return null;

  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

  return (
    <PageWrapper>
      <div className="min-h-screen bg-cream py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/account/orders')}
            className="mb-6 flex items-center text-sm font-semibold text-gold hover:underline"
          >
            <FiArrowLeft className="mr-2" /> Back to My Orders
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-semibold text-forest mb-1">Order Details</h1>
              <p className="text-forest/60 text-sm font-mono">Order ID: #{order.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                  STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {order.status}
              </span>
              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-3.5 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-xl border border-gold/20 overflow-hidden shadow-sm mb-6">
            <div className="p-6 border-b border-gold/20">
              <h2 className="text-lg font-semibold text-forest mb-4">Ordered Items</h2>
              <div className="divide-y divide-gold/15">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                    <img
                      src={item.productImage || 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=120'}
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg object-cover bg-sage/20 border border-gold/20 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-forest">{item.productName}</p>
                      <p className="text-forest/60 text-sm">
                        Qty: {item.quantity} × {money(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-forest">
                        {money(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-pale-gold/10 flex justify-between items-center text-lg font-semibold text-forest">
              <span>Total Amount</span>
              <span className="text-gold font-mono text-2xl font-bold">{money(order.totalAmount)}</span>
            </div>
          </div>

          {/* Delivery & Summary Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gold/20 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-forest flex items-center mb-4">
                <FiTruck className="mr-2 text-gold" /> Delivery Address
              </h2>
              {order.shippingAddress ? (
                <address className="not-italic text-sm text-forest/70 leading-relaxed">
                  <strong className="text-forest block mb-1 font-semibold">
                    {order.shippingAddress.fullName}
                  </strong>
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 && <><br />{order.shippingAddress.addressLine2}</>}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  <span className="mt-2 block font-mono text-forest/80">
                    Phone: {order.shippingAddress.phoneNumber}
                  </span>
                </address>
              ) : (
                <p className="text-sm text-forest/60">Address details not available.</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gold/20 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold text-forest mb-4">Payment & Timestamps</h2>
                <div className="space-y-3 text-sm text-forest/70">
                  <div className="flex justify-between">
                    <span>Order Date:</span>
                    <span className="font-medium text-forest">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-semibold text-forest uppercase">
                      {order.paymentMethod || 'Cash on Delivery (COD)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span className="font-semibold text-forest">
                      {order.paymentStatus || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>

              {order.status === 'CANCELLED' && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <FiAlertTriangle className="flex-shrink-0" /> This order was cancelled.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-deep/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gold/20">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <FiXCircle className="text-2xl" />
              <h3 className="text-lg font-bold">Cancel This Order</h3>
            </div>
            <p className="text-sm text-forest/70 mb-6">
              Are you sure you want to cancel Order #{order.id?.slice(0, 8)}? This cannot be undone once confirmed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-lg border border-gold/30 text-forest text-sm font-semibold hover:bg-cream"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default OrderDetail;
