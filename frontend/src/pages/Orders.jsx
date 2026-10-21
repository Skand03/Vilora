import React, { useEffect, useState } from 'react';
import { PageWrapper, Button } from '../components';
import { FiBox, FiClock, FiCheckCircle, FiXCircle, FiTruck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const money = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
    DELIVERED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200'
  };
  
  const icons = {
    PENDING: <FiClock className="mr-1" />,
    PROCESSING: <FiBox className="mr-1" />,
    SHIPPED: <FiTruck className="mr-1" />,
    DELIVERED: <FiCheckCircle className="mr-1" />,
    CANCELLED: <FiXCircle className="mr-1" />
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.PENDING}`}>
      {icons[status] || icons.PENDING}
      {status}
    </span>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data.data || []);
      } catch (error) {
        toast.error('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-cream py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-display font-semibold text-forest mb-8">My Orders</h1>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-gold/30 border-t-gold" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gold/20">
              <FiBox className="mx-auto text-5xl text-gold/50 mb-4" />
              <h2 className="text-xl font-display font-semibold text-forest">No orders yet</h2>
              <p className="text-forest/60 mt-2 mb-6">When you place an order, it will appear here.</p>
              <Button onClick={() => navigate('/shop')}>Start Shopping</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl border border-gold/20 overflow-hidden shadow-sm">
                  <div className="bg-pale-gold/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gold/20">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-forest/60">Order Placed</p>
                      <p className="text-sm font-medium text-forest">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-forest/60">Total</p>
                      <p className="text-sm font-medium text-forest">{money(order.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-forest/60">Order ID</p>
                      <p className="text-sm font-mono text-forest">{order.id.split('-')[0].toUpperCase()}</p>
                    </div>
                    <div className="flex-1 text-right">
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/account/orders/${order.id}`)}>View Details</Button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <StatusBadge status={order.status} />
                    </div>
                    
                    <div className="divide-y divide-gold/15">
                      {order.items.map((item) => (
                        <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                          <img src={item.productImage || 'https://via.placeholder.com/80?text=V'} alt={item.productName} className="w-16 h-16 rounded-lg object-cover bg-sage" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-forest text-sm">{item.productName}</p>
                            <p className="text-forest/60 text-xs mt-1">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-sm font-semibold text-forest">{money(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Orders;
