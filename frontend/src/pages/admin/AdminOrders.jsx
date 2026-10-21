import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiEye, FiCheckCircle, FiClock, FiTruck, 
  FiXCircle, FiRefreshCw, FiDollarSign, FiPackage, FiMapPin, FiX
} from 'react-icons/fi';
import { ordersApi } from '../../api/apiClient';
import toast from 'react-hot-toast';

const money = (val) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-300',
  PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-300',
  DELIVERED: 'bg-green-100 text-green-800 border-green-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300',
};

const PAYMENT_STATUS_COLORS = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const ORDER_STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const PAYMENT_STATUS_OPTIONS = ['PENDING', 'PAID', 'FAILED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // View Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getAdminOrders();
      setOrders(res.data?.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch customer orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    setUpdatingId(orderId);
    try {
      await ordersApi.updatePaymentStatus(orderId, newPaymentStatus);
      toast.success(`Payment status updated to ${newPaymentStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, paymentStatus: newPaymentStatus }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update payment status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress?.phoneNumber?.includes(search);
    const matchesStatus = !statusFilter || o.status === statusFilter;
    const matchesPayment = !paymentFilter || o.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Order Management</h1>
          <p className="text-sm text-forest/65">
            Track customer orders, manage COD payment states, and update fulfillment milestones.
          </p>
        </div>
        <div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gold/30 bg-white text-forest text-sm font-semibold hover:bg-pale-gold/30 transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh Orders
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-gold/20 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/40" />
          <input
            type="text"
            placeholder="Search by Order ID, Name, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gold/25 text-sm text-forest outline-none focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gold/25 text-sm text-forest bg-white outline-none focus:border-gold"
          >
            <option value="">All Fulfillment Statuses</option>
            {ORDER_STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gold/25 text-sm text-forest bg-white outline-none focus:border-gold"
          >
            <option value="">All Payment Statuses</option>
            {PAYMENT_STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gold/20 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-forest/60">
            <span className="h-10 w-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-4" />
            <p>Loading customer orders from backend...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FiPackage className="mx-auto text-4xl text-gold/50 mb-3" />
            <p className="text-forest/60 text-base mb-2">No orders found matching your filters.</p>
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setPaymentFilter(''); }}
              className="text-sm font-semibold text-gold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-forest">
              <thead className="bg-pale-gold/30 border-b border-gold/20 font-semibold text-forest text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order Details</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/15">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-cream/40 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono text-xs font-bold text-forest block">
                        #{o.id ? o.id.slice(0, 8).toUpperCase() : 'N/A'}
                      </span>
                      <span className="text-xs text-forest/50">
                        {o.createdAt ? new Date(o.createdAt).toLocaleString() : 'Recent'}
                      </span>
                      <span className="block text-[11px] text-forest/40">
                        {o.items?.length || 0} item(s)
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-forest">
                        {o.shippingAddress?.fullName || 'Guest Customer'}
                      </p>
                      <p className="text-xs text-forest/60">
                        {o.shippingAddress?.city}, {o.shippingAddress?.state}
                      </p>
                      <p className="text-xs text-forest/50 font-mono">
                        {o.shippingAddress?.phoneNumber}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-mono font-bold text-forest text-base">
                        {money(o.totalAmount)}
                      </div>
                      <span className="text-[11px] text-forest/50 uppercase font-semibold">
                        {o.paymentMethod || 'COD'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${
                          STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ORDER_STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={o.paymentStatus || 'PENDING'}
                        disabled={updatingId === o.id}
                        onChange={(e) => handlePaymentStatusChange(o.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${
                          PAYMENT_STATUS_COLORS[o.paymentStatus] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {PAYMENT_STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 hover:bg-gold/30 text-forest text-xs font-semibold transition-colors"
                      >
                        <FiEye /> View Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-deep/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gold/20 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gold/20">
              <div>
                <h2 className="font-display text-xl font-bold text-forest">Order Overview</h2>
                <p className="text-xs font-mono text-forest/50">ID: {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-forest/50 hover:text-forest hover:bg-cream"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="overflow-y-auto pr-2 mt-4 space-y-6 flex-1 text-sm text-forest">
              {/* Order Items */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-forest/60 mb-3">
                  Purchased Items ({selectedOrder.items?.length || 0})
                </h3>
                <div className="divide-y divide-gold/15 border border-gold/20 rounded-xl overflow-hidden">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center gap-3 bg-white">
                      <img
                        src={item.productImage || 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=80'}
                        alt={item.productName}
                        className="w-12 h-12 rounded-lg object-cover bg-sage/20 border border-gold/20"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-forest truncate">{item.productName}</p>
                        <p className="text-xs text-forest/60">
                          Qty: {item.quantity} × {money(item.price)}
                        </p>
                      </div>
                      <div className="font-mono font-bold text-forest">
                        {money(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-forest/60 mb-2 flex items-center gap-1.5">
                  <FiMapPin className="text-gold" /> Delivery Address
                </h3>
                {selectedOrder.shippingAddress ? (
                  <div className="p-4 rounded-xl border border-gold/20 bg-pale-gold/10">
                    <p className="font-bold text-forest">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-xs text-forest/75 mt-0.5">
                      {selectedOrder.shippingAddress.addressLine1}
                      {selectedOrder.shippingAddress.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                    </p>
                    <p className="text-xs text-forest/75">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                      {selectedOrder.shippingAddress.pincode}
                    </p>
                    <p className="text-xs text-forest/75 font-mono mt-1">
                      Phone: {selectedOrder.shippingAddress.phoneNumber}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-forest/50">Address information unavailable.</p>
                )}
              </div>

              {/* Status Update Quick Bar */}
              <div className="p-4 rounded-xl border border-gold/20 bg-cream/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-forest/70 mb-1">
                    Fulfillment Status
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gold/30 bg-white text-xs font-semibold"
                  >
                    {ORDER_STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-forest/70 mb-1">
                    Payment Status (COD)
                  </label>
                  <select
                    value={selectedOrder.paymentStatus || 'PENDING'}
                    onChange={(e) => handlePaymentStatusChange(selectedOrder.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gold/30 bg-white text-xs font-semibold"
                  >
                    {PAYMENT_STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-center pt-4 border-t border-gold/20">
                <div>
                  <span className="text-xs text-forest/55 uppercase font-bold block">
                    Payment Mode: {selectedOrder.paymentMethod || 'Cash on Delivery'}
                  </span>
                  <span className="text-xs text-forest/55">
                    Ordered on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-forest/60 block">Grand Total</span>
                  <span className="font-display text-2xl font-bold text-gold font-mono">
                    {money(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
