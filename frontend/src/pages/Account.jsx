import React, { useState, useEffect } from 'react';
import { PageWrapper, Button } from '../components';
import { 
  FiUser, FiMail, FiPhone, FiLogOut, FiMapPin, FiPlus, 
  FiEdit2, FiTrash2, FiCheck, FiCheckCircle, FiShield, FiBriefcase 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { userApi, addressesApi } from '../api/apiClient';
import toast from 'react-hot-toast';

const initialAddressForm = {
  fullName: '',
  phoneNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

const Account = ({ defaultTab = 'profile' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'profile' | 'addresses'
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ fullName: '', phone: '', address: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [savingAddress, setSavingAddress] = useState(false);

  const logout = useAuthStore((state) => state.logoutUser);
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin?.() || user?.role === 'ROLE_ADMIN');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    setLoading(true);
    try {
      const [profileRes, addrRes] = await Promise.allSettled([
        userApi.getProfile(),
        addressesApi.getAll(),
      ]);

      if (profileRes.status === 'fulfilled') {
        const p = profileRes.value.data?.data;
        setProfile(p);
        setProfileFormData({
          fullName: p?.fullName || '',
          phone: p?.phone || p?.phoneNumber || '',
          address: p?.address || '',
        });
      }

      if (addrRes.status === 'fulfilled') {
        setAddresses(addrRes.value.data?.data || []);
      }
    } catch (err) {
      console.error('Error fetching account data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileFormData.fullName.trim()) {
      return toast.error('Full name is required');
    }

    setSavingProfile(true);
    try {
      const res = await userApi.updateProfile({
        fullName: profileFormData.fullName.trim(),
        phone: profileFormData.phone.trim(),
        address: profileFormData.address.trim(),
      });
      setProfile(res.data?.data || { ...profile, ...profileFormData });
      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm(initialAddressForm);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName || '',
      phoneNumber: addr.phoneNumber || addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      isDefault: addr.isDefault || false,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.fullName.trim() || !addressForm.addressLine1.trim() || !addressForm.city.trim()) {
      return toast.error('Please fill in all required address fields.');
    }

    setSavingAddress(true);
    try {
      if (editingAddressId) {
        await addressesApi.update(editingAddressId, addressForm);
        toast.success('Address updated successfully');
      } else {
        await addressesApi.create(addressForm);
        toast.success('New address added');
      }
      setIsAddressModalOpen(false);
      const res = await addressesApi.getAll();
      setAddresses(res.data?.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await addressesApi.setDefault(id);
      toast.success('Default address updated');
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to set default address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await addressesApi.delete(id);
      toast.success('Address deleted');
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete address');
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-cream py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-display font-semibold text-forest">My Account</h1>
              <p className="text-sm text-forest/65">
                Manage your personal details, saved shipping addresses, and preferences.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-forest text-gold hover:bg-forest-deep text-sm font-bold shadow-sm transition-all"
                >
                  <FiShield /> Admin Portal
                </button>
              )}
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
              >
                <FiLogOut className="mr-2" /> Logout
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gold/25 mb-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'profile'
                  ? 'border-gold text-forest'
                  : 'border-transparent text-forest/50 hover:text-forest'
              }`}
            >
              Profile &amp; Security
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'addresses'
                  ? 'border-gold text-forest'
                  : 'border-transparent text-forest/50 hover:text-forest'
              }`}
            >
              Saved Addresses
              <span className="bg-pale-gold text-forest-deep px-2 py-0.5 rounded-full text-xs font-bold">
                {addresses.length}
              </span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-gold/30 border-t-gold" />
            </div>
          ) : (
            <>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gold/20 p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-forest flex items-center">
                        <FiUser className="mr-2 text-gold" /> Personal Information
                      </h2>
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline"
                      >
                        <FiEdit2 /> Edit Profile
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 text-forest/80">
                      <div>
                        <span className="block text-xs uppercase font-bold text-forest/50 mb-1">
                          Full Name
                        </span>
                        <p className="font-semibold text-forest text-base">
                          {profile?.fullName || user?.name || 'Customer'}
                        </p>
                      </div>
                      <div>
                        <span className="block text-xs uppercase font-bold text-forest/50 mb-1">
                          Email Address
                        </span>
                        <p className="font-semibold text-forest text-base">
                          {profile?.email || user?.email}
                        </p>
                      </div>
                      <div>
                        <span className="block text-xs uppercase font-bold text-forest/50 mb-1">
                          Phone Number
                        </span>
                        <p className="font-semibold text-forest text-base">
                          {profile?.phone || profile?.phoneNumber || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <span className="block text-xs uppercase font-bold text-forest/50 mb-1">
                          Account Role
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-forest/5 text-forest">
                          {profile?.role || user?.role || 'ROLE_USER'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Navigation Cards */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div
                      className="bg-white rounded-xl border border-gold/20 p-6 shadow-sm cursor-pointer hover:border-gold transition-colors"
                      onClick={() => navigate('/account/orders')}
                    >
                      <h3 className="text-lg font-semibold text-forest mb-1">My Orders</h3>
                      <p className="text-sm text-forest/60 mb-4">
                        View orders, check delivery progress, or cancel recent orders.
                      </p>
                      <span className="text-gold font-semibold text-sm">View Orders &rarr;</span>
                    </div>

                    <div
                      className="bg-white rounded-xl border border-gold/20 p-6 shadow-sm cursor-pointer hover:border-gold transition-colors"
                      onClick={() => navigate('/account/wishlist')}
                    >
                      <h3 className="text-lg font-semibold text-forest mb-1">My Wishlist</h3>
                      <p className="text-sm text-forest/60 mb-4">
                        Saved organic staples and dry fruit selections.
                      </p>
                      <span className="text-gold font-semibold text-sm">View Wishlist &rarr;</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-forest/70">
                      Manage your saved shipping addresses for faster checkout.
                    </p>
                    <button
                      onClick={handleOpenAddAddress}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-light text-forest-deep text-sm font-semibold transition-all shadow-sm"
                    >
                      <FiPlus /> Add New Address
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gold/20 p-12 text-center">
                      <FiMapPin className="mx-auto text-4xl text-gold/40 mb-3" />
                      <h3 className="font-display text-lg font-semibold text-forest mb-1">
                        No addresses saved yet
                      </h3>
                      <p className="text-sm text-forest/60 mb-6">
                        Add an address to speed up your future checkout process.
                      </p>
                      <button
                        onClick={handleOpenAddAddress}
                        className="px-5 py-2.5 rounded-lg bg-forest text-white text-sm font-semibold hover:bg-forest-deep"
                      >
                        Add Your First Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-6">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`bg-white rounded-xl border p-5 shadow-sm relative flex flex-col justify-between ${
                            addr.isDefault ? 'border-gold bg-pale-gold/10' : 'border-gold/20'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-forest text-base">
                                {addr.fullName}
                              </span>
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-gold/20 text-forest-deep flex items-center gap-1">
                                  <FiCheck /> Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-forest/70 leading-relaxed">
                              {addr.addressLine1}
                              {addr.addressLine2 && `, ${addr.addressLine2}`}
                              <br />
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-xs font-mono text-forest/60 mt-2">
                              Phone: {addr.phoneNumber || addr.phone}
                            </p>
                          </div>

                          <div className="pt-4 mt-4 border-t border-gold/15 flex items-center justify-between text-xs">
                            {!addr.isDefault ? (
                              <button
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-forest/70 hover:text-forest font-semibold"
                              >
                                Set as Default
                              </button>
                            ) : (
                              <span />
                            )}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleOpenEditAddress(addr)}
                                className="text-gold hover:text-forest font-semibold flex items-center gap-1"
                              >
                                <FiEdit2 /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                              >
                                <FiTrash2 /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-deep/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gold/20">
            <h2 className="font-display text-xl font-bold text-forest mb-4">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileFormData.fullName}
                  onChange={(e) => setProfileFormData({ ...profileFormData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profileFormData.phone}
                  onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                  General Address Note
                </label>
                <input
                  type="text"
                  value={profileFormData.address}
                  onChange={(e) => setProfileFormData({ ...profileFormData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gold/20">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-lg border border-gold/30 text-forest text-sm font-semibold hover:bg-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-lg bg-gold hover:bg-gold-light text-forest-deep text-sm font-bold shadow transition-all"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-deep/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gold/20">
            <h2 className="font-display text-xl font-bold text-forest mb-4">
              {editingAddressId ? 'Edit Address' : 'Add New Address'}
            </h2>
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phoneNumber}
                    onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="House/Flat number, building, street"
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Landmark, area"
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gold/20">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gold/30 text-forest text-sm font-semibold hover:bg-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="px-5 py-2 rounded-lg bg-gold hover:bg-gold-light text-forest-deep text-sm font-bold shadow transition-all"
                >
                  {savingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Account;
