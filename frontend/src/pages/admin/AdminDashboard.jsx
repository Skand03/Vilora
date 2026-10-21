import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag,
  FiBox,
  FiFolder,
  FiDollarSign,
  FiArrowRight,
  FiPlus,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiRefreshCw
} from 'react-icons/fi';
import { ordersApi, productsApi, categoriesApi } from '../../api/apiClient';
import toast from 'react-hot-toast';

const money = (val) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes, categoriesRes] = await Promise.all([
        ordersApi.getAdminOrders().catch(() => ({ data: { data: [] } })),
        productsApi.getAll().catch(() => ({ data: { data: [] } })),
        categoriesApi.getAll().catch(() => ({ data: { data: [] } })),
      ]);

      setOrders(ordersRes.data?.data || []);
      setProducts(productsRes.data?.data || []);
      setCategories(categoriesRes.data?.data || []);
    } catch (err) {
      toast.error('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING');
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');
  const outOfStockCount = products.filter((p) => !p.inStock || (p.stockQuantity !== null && p.stockQuantity <= 0));

  const statusStyles = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
    DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <div className="space-y-8">
      {/* Header with Refresh button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-forest">Store Performance</h2>
          <p className="text-xs text-slate-500">Real-time metrics connected directly to Supabase REST APIs</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:border-gold hover:text-forest text-slate-700 shadow-sm transition-all"
        >
          <FiRefreshCw className={loading ? 'animate-spin text-gold' : 'text-slate-400'} />
          Refresh Metrics
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Sales</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiDollarSign className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-forest">{money(totalRevenue)}</p>
          <p className="text-xs text-slate-400 mt-2">Active non-cancelled orders</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiShoppingBag className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-forest">{orders.length}</p>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-amber-600 font-semibold">{pendingOrders.length} pending</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-600 font-semibold">{deliveredOrders.length} delivered</span>
          </div>
        </div>

        {/* Catalog Products */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Products</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FiBox className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-forest">{products.length}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            {outOfStockCount.length > 0 ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <FiAlertTriangle /> {outOfStockCount.length} out of stock
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <FiCheckCircle /> All items in stock
              </span>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Categories</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FiFolder className="text-xl" />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-forest">{categories.length}</p>
          <p className="text-xs text-slate-400 mt-2">Active catalog taxonomy</p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-gradient-to-r from-forest to-forest-deep rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-display font-bold text-gold">Quick Management Actions</h3>
            <p className="text-xs text-cream/70 mt-1">Direct access to catalog creation, category updates, and order fulfillment</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/products"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold text-forest-deep text-xs font-bold hover:bg-gold-light transition-all shadow-sm"
            >
              <FiPlus /> Add Product
            </Link>
            <Link
              to="/admin/categories"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              <FiFolder /> New Category
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              <FiShoppingBag /> View Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-forest">Recent Orders</h3>
            <p className="text-xs text-slate-400">Latest customer orders requiring fulfillment or review</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-gold hover:text-gold-light flex items-center gap-1 transition-colors"
          >
            View All ({orders.length}) <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gold/30 border-t-gold" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <FiClock className="mx-auto text-3xl mb-2 opacity-50" />
            No customer orders recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Order ID</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Items</th>
                  <th className="py-3 px-6">Total</th>
                  <th className="py-3 px-6">Payment</th>
                  <th className="py-3 px-6">Fulfillment</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-mono font-semibold text-forest">
                      {order.id?.slice(0, 8)}...
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-slate-800">
                        {order.items?.length || 0} items
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-forest">
                      {money(order.totalAmount)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {order.paymentMethod || 'COD'} ({order.paymentStatus || 'PENDING'})
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          statusStyles[order.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to="/admin/orders"
                        className="text-xs font-semibold text-gold hover:underline"
                      >
                        Manage &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
