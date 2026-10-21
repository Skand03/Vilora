import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiCheck, FiArrowRight, FiTruck, FiPackage, FiShoppingBag } from 'react-icons/fi';
import { PageWrapper, Button, LoadingSpinner } from '../components';
import { ordersApi } from '../api/apiClient';

const money = (val) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

export default function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await ordersApi.getOrderById(id);
        setOrder(data.data);
      } catch (err) {
        console.error('Failed to load order confirmation:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center py-20">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-forest/70 font-semibold text-sm">Loading order confirmation...</p>
        </div>
      </PageWrapper>
    );
  }

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <PageWrapper>
      <div className="min-h-screen bg-cream py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Banner */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <FiCheck className="text-4xl" strokeWidth={3} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">
              Order Confirmed
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-forest">
              Thank You for Your Order!
            </h1>
            <p className="mt-2 text-forest/65 text-sm sm:text-base">
              We&apos;ve received your order and are carefully packing your fresh organic dry fruits.
            </p>
            <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-pale-gold border border-gold/30 text-forest text-xs font-mono font-bold">
              Order ID: #{id}
            </div>
          </div>

          {/* Delivery & Payment Info Bar */}
          <div className="bg-white rounded-2xl border border-gold/20 p-6 shadow-sm mb-6 grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-pale-gold/40 text-forest rounded-xl">
                <FiTruck className="text-xl text-gold" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-forest/50">Estimated Delivery</p>
                <p className="font-semibold text-forest text-sm mt-0.5">{formattedDelivery}</p>
                <p className="text-xs text-forest/60">Delivered via Blue Dart Express</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-3 bg-pale-gold/40 text-forest rounded-xl">
                <FiPackage className="text-xl text-gold" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-forest/50">Payment Method</p>
                <p className="font-semibold text-forest text-sm mt-0.5">
                  {order?.paymentMethod || 'Cash on Delivery (COD)'}
                </p>
                <p className="text-xs text-amber-700 font-medium">Payment status: {order?.paymentStatus || 'PENDING'}</p>
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-2xl border border-gold/20 overflow-hidden shadow-sm mb-8">
            <div className="p-6 border-b border-gold/20 flex justify-between items-center">
              <h2 className="font-display text-lg font-bold text-forest">Ordered Dry Fruits</h2>
              <span className="text-xs font-semibold text-forest/60 font-mono">
                {order?.items?.length || 0} item(s)
              </span>
            </div>

            <div className="divide-y divide-gold/15 p-6">
              {order?.items?.map((item, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=120'}
                    alt={item.productName}
                    className="w-16 h-16 rounded-xl object-cover bg-sage/20 border border-gold/20 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-forest text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-forest/60 mt-0.5">
                      Qty: {item.quantity} × {money(item.price)}
                    </p>
                  </div>
                  <div className="font-mono font-bold text-forest text-sm">
                    {money(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Footer */}
            <div className="p-6 bg-pale-gold/15 border-t border-gold/20 flex justify-between items-center">
              <div>
                <span className="text-xs text-forest/60 uppercase font-bold block">Total Amount Due</span>
                <span className="text-xs text-forest/50">Pay via cash/UPI upon parcel delivery</span>
              </div>
              <span className="font-display text-2xl font-bold text-forest font-mono">
                {money(order?.totalAmount)}
              </span>
            </div>
          </div>

          {/* Shipping Address */}
          {order?.shippingAddress && (
            <div className="bg-white rounded-2xl border border-gold/20 p-6 shadow-sm mb-8">
              <h3 className="font-display text-base font-bold text-forest mb-3 flex items-center gap-2">
                <FiTruck className="text-gold" /> Delivery Destination
              </h3>
              <p className="text-sm font-semibold text-forest">{order.shippingAddress.fullName}</p>
              <p className="text-xs text-forest/70 mt-1 leading-relaxed">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p className="text-xs font-mono text-forest/70 mt-2">
                Phone: {order.shippingAddress.phoneNumber}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/account/orders/${id}`}>
              <Button variant="secondary" className="w-full sm:w-auto">
                View Order Details
              </Button>
            </Link>
            <Link to="/shop">
              <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
                Continue Shopping <FiArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
