import React, { useMemo, useState, useEffect } from 'react';
import { FiArrowLeft, FiArrowRight, FiCheck, FiCreditCard, FiHome, FiLock, FiMapPin, FiPhone, FiShield, FiTruck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, Button } from '../components';
import useCartStore from '../store/useCartStore';
import api from '../api';
import toast from 'react-hot-toast';

const initialNewAddress = { name: '', phone: '', address1: '', address2: '', city: '', state: '', pincode: '' };
const lookupPincode = (pincode) => ({ '400001': { city: 'Mumbai', state: 'Maharashtra' }, '400053': { city: 'Mumbai', state: 'Maharashtra' }, '560001': { city: 'Bengaluru', state: 'Karnataka' }, '110001': { city: 'New Delhi', state: 'Delhi' } }[pincode] || null);
const money = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;

const Progress = ({ step }) => <div className="sticky top-16 z-30 border-b border-gold/20 bg-cream/95 px-4 py-5 backdrop-blur md:top-[4.5rem]"><div className="mx-auto flex max-w-2xl items-start"><div className="flex flex-1 flex-col items-center gap-2"><span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold ${step > 1 ? 'border-green-600 bg-green-600 text-white' : 'border-gold bg-gold text-forest-deep'}`}>{step > 1 ? <FiCheck /> : '1'}</span><span className={`text-center text-xs font-semibold ${step === 1 ? 'text-gold' : 'text-forest/55'}`}>Delivery Address</span></div><span className={`mt-4 h-0.5 flex-1 ${step > 1 ? 'bg-gold' : 'bg-forest/15'}`} /><div className="flex flex-1 flex-col items-center gap-2"><span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold ${step > 2 ? 'border-green-600 bg-green-600 text-white' : step === 2 ? 'border-gold bg-gold text-forest-deep' : 'border-forest/20 text-forest/40'}`}>{step > 2 ? <FiCheck /> : '2'}</span><span className={`text-center text-xs font-semibold ${step === 2 ? 'text-gold' : 'text-forest/55'}`}>Payment</span></div><span className={`mt-4 h-0.5 flex-1 ${step > 2 ? 'bg-gold' : 'bg-forest/15'}`} /><div className="flex flex-1 flex-col items-center gap-2"><span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold ${step === 3 ? 'border-green-600 bg-green-600 text-white' : 'border-forest/20 text-forest/40'}`}>{step === 3 ? <FiCheck /> : '3'}</span><span className={`text-center text-xs font-semibold ${step === 3 ? 'text-green-600' : 'text-forest/55'}`}>Confirmation</span></div></div></div>;

const InputField = ({ label, id, icon: Icon, error, ...props }) => <div><label htmlFor={id} className="mb-2 block text-sm font-semibold text-forest">{label}</label><div className="relative"><Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold" aria-hidden="true" /><input id={id} {...props} className={`min-h-12 w-full rounded-lg border bg-white pl-11 pr-4 text-forest outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 ${error ? 'border-red-400' : 'border-gold/30'}`} /> </div>{error && <p className="mt-1 text-xs text-red-600">{error}</p>}</div>;

const OrderSummary = ({ items, subtotal, shipping, discount, total }) => <aside className="lg:sticky lg:top-24"><div className="rounded-xl border border-gold/20 bg-white p-5 sm:p-6"><h2 className="font-display text-2xl font-semibold text-forest">Order Summary</h2><div className="mt-5 max-h-56 space-y-4 overflow-y-auto">{items.length ? items.map((item) => <div key={item.id} className="flex items-center gap-3"><img src={item.image || 'https://via.placeholder.com/80?text=V'} alt={item.name} className="h-14 w-14 rounded-lg bg-sage object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-forest">{item.name}</p><p className="text-xs text-forest/55">Qty {item.quantity || 1}{item.variant ? ` · ${item.variant}` : ''}</p></div><span className="font-mono text-sm text-forest">{money(item.price * (item.quantity || 1))}</span></div>) : <p className="text-sm text-forest/60">Your cart is empty.</p>}</div><div className="my-5 h-px bg-gold/25" /><div className="space-y-3 text-sm text-forest/65"><div className="flex justify-between"><span>Subtotal</span><span className="font-mono text-forest">{money(subtotal)}</span></div><div className="flex justify-between"><span>Shipping</span><span className={shipping === 0 ? 'font-semibold text-green-600' : 'font-mono text-forest'}>{shipping ? money(shipping) : 'Free'}</span></div>{discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span className="font-mono">-{money(discount)}</span></div>}</div><div className="my-5 h-px bg-gold/25" /><div className="flex items-center justify-between"><span className="font-display text-2xl font-semibold text-forest">Total</span><span className="font-display text-3xl font-semibold text-gold">{money(total)}</span></div></div></aside>;

const Checkout = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(initialNewAddress);
  const [addressErrors, setAddressErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentError, setPaymentError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const discount = 0;
  const total = subtotal + shipping - discount + (subtotal - discount) * 0.05;
  const deliveryDate = useMemo(() => { const date = new Date(); date.setDate(date.getDate() + 4); return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data } = await api.get('/addresses');
        setAddresses(data.data || []);
        if (data.data?.length > 0) setSelectedAddress(data.data[0].id);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };
    fetchAddresses();
  }, []);

  const updateAddress = (event) => { const { name, value } = event.target; const cleaned = name === 'phone' || name === 'pincode' ? value.replace(/\D/g, '') : value; const next = { ...newAddress, [name]: cleaned }; if (name === 'pincode') Object.assign(next, lookupPincode(cleaned) || { city: '', state: '' }); setNewAddress(next); if (addressErrors[name]) setAddressErrors((current) => ({ ...current, [name]: '' })); };
  const validateAddress = () => { const next = {}; if (!showNewAddress) return next; if (!newAddress.name.trim()) next.name = 'Name is required.'; if (!/^\d{10}$/.test(newAddress.phone)) next.phone = 'Enter a valid 10-digit phone number.'; if (!newAddress.address1.trim()) next.address1 = 'Address is required.'; if (!/^\d{6}$/.test(newAddress.pincode)) next.pincode = 'Enter a valid 6-digit pincode.'; return next; };
  const continueToPayment = (event) => { event.preventDefault(); const next = validateAddress(); setAddressErrors(next); if (!Object.keys(next).length) setStep(2); };
  
  const saveNewAddress = async () => {
    const next = validateAddress();
    setAddressErrors(next);
    if (Object.keys(next).length) return;
    try {
      const { data } = await api.post('/addresses', {
        fullName: newAddress.name,
        phoneNumber: newAddress.phone,
        addressLine1: newAddress.address1,
        addressLine2: newAddress.address2,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode
      });
      setAddresses([...addresses, data.data]);
      setSelectedAddress(data.data.id);
      setShowNewAddress(false);
      setNewAddress(initialNewAddress);
      toast.success('Address saved.');
    } catch (error) {
      toast.error('Failed to save address.');
    }
  };

  const pay = async (event) => { 
    event.preventDefault(); 
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address.');
      setStep(1);
      return;
    }
    setPaymentError(''); 
    setProcessing(true);
    
    try {
      const { data } = await api.post('/orders', { 
        addressId: selectedAddress,
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'PENDING'
      });
      setOrderId(data.data.id);
      await fetchCart(); // Refresh cart to clear it
      navigate(`/order-confirmation/${data.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order creation failed.');
    } finally {
      setProcessing(false);
    }
  };

  return <PageWrapper><div className="min-h-screen bg-cream"><Progress step={step} /><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">{step === 3 ? <section className="relative flex min-h-[62vh] flex-col items-center justify-center overflow-hidden text-center"><div className="pointer-events-none absolute inset-0 overflow-hidden">{Array.from({ length: 18 }, (_, index) => <i key={index} className="absolute h-3 w-1.5 animate-[checkout-confetti_1.8s_ease-out_infinite] bg-gold" style={{ left: `${(index * 17) % 100}%`, top: `${(index * 13) % 65}%`, animationDelay: `${index * 80}ms`, transform: `rotate(${index * 21}deg)` }} />)}</div><style>{'@keyframes checkout-confetti { 0% { opacity: 0; transform: translateY(-20px) rotate(0); } 20% { opacity: 1; } 100% { opacity: 0; transform: translateY(220px) rotate(240deg); } } @keyframes checkout-scale-in { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: scale(1); } }'}</style><div className="flex h-28 w-28 animate-[checkout-scale-in_0.6s_ease-out] items-center justify-center rounded-full bg-green-100 text-green-600"><FiCheck className="text-6xl" strokeWidth={3} /></div><h1 className="mt-8 font-display text-4xl font-semibold text-forest">Order Placed Successfully! 🎉</h1><span className="mt-5 rounded-pill bg-pale-gold px-4 py-2 font-mono text-sm font-semibold text-forest">{orderId}</span><p className="mt-4 text-forest/65">Estimated delivery by <strong className="text-forest">{deliveryDate}</strong></p><p className="mt-2 text-sm text-forest/60">Payment Method: <strong>Cash on Delivery (Pending)</strong></p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button variant="secondary" onClick={() => navigate('/account/orders')}>View My Orders</Button><Button onClick={() => navigate('/shop')}>Continue Shopping <FiArrowRight /></Button></div></section> : <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]"><section>        {step === 1 && <div className="rounded-xl border border-gold/20 bg-white p-5 sm:p-7"><h1 className="font-display text-3xl font-semibold text-forest">Delivery Address</h1><div className="mt-6 space-y-3">{addresses.map((address) => <label key={address.id} className={`block cursor-pointer rounded-xl border-2 p-4 transition-colors ${selectedAddress === address.id && !showNewAddress ? 'border-gold bg-pale-gold/30' : 'border-gold/15 hover:border-gold/50'}`}><div className="flex gap-3"><input type="radio" name="saved-address" checked={selectedAddress === address.id && !showNewAddress} onChange={() => { setSelectedAddress(address.id); setShowNewAddress(false); }} className="mt-1 h-4 w-4 accent-gold" /><span><strong className="text-forest">{address.fullName}</strong><span className="mt-1 block text-sm leading-6 text-forest/65">{address.addressLine1} {address.addressLine2}, {address.city}, {address.state} {address.pincode}</span><span className="mt-1 block text-sm text-forest/65">{address.phoneNumber}</span></span></div></label>)}</div><button type="button" onClick={() => setShowNewAddress((current) => !current)} className="mt-5 w-full rounded-xl border border-dashed border-gold px-4 py-4 text-left font-semibold text-gold hover:bg-pale-gold">+ Add New Address</button>{showNewAddress && <div className="mt-5 grid gap-4 overflow-hidden border-t border-gold/20 pt-5 sm:grid-cols-2"><InputField id="new-name" name="name" label="Full Name" value={newAddress.name} onChange={updateAddress} icon={FiHome} error={addressErrors.name} /><InputField id="new-phone" name="phone" label="Phone" value={newAddress.phone} onChange={updateAddress} icon={FiPhone} inputMode="numeric" maxLength="10" error={addressErrors.phone} /><div className="sm:col-span-2"><InputField id="new-address1" name="address1" label="Address Line 1" value={newAddress.address1} onChange={updateAddress} icon={FiHome} error={addressErrors.address1} /></div><div className="sm:col-span-2"><InputField id="new-address2" name="address2" label="Address Line 2 (optional)" value={newAddress.address2} onChange={updateAddress} icon={FiMapPin} /></div><InputField id="new-pincode" name="pincode" label="Pincode" value={newAddress.pincode} onChange={updateAddress} icon={FiMapPin} inputMode="numeric" maxLength="6" error={addressErrors.pincode} /><InputField id="new-city" name="city" label="City" value={newAddress.city} onChange={updateAddress} icon={FiHome} /><InputField id="new-state" name="state" label="State" value={newAddress.state} onChange={updateAddress} icon={FiMapPin} /><div className="sm:col-span-2"><Button type="button" className="mt-3" onClick={saveNewAddress}>Save &amp; Use</Button></div></div>}<p className="mt-6 flex items-center gap-2 text-sm text-forest/65"><FiTruck className="text-gold" />Estimated delivery: 3-5 business days via Blue Dart</p><form onSubmit={continueToPayment} className="mt-7"><Button type="submit" size="lg" className="w-full" disabled={!selectedAddress}>Continue to Payment <FiArrowRight /></Button></form></div>}{step === 2 && <div className="rounded-xl border border-gold/20 bg-white p-5 sm:p-7"><button type="button" onClick={() => setStep(1)} className="mb-5 flex items-center gap-2 text-sm font-semibold text-gold hover:underline"><FiArrowLeft /> Delivery Address</button><h1 className="font-display text-3xl font-semibold text-forest">Payment Method</h1><div className="mt-6 space-y-4"><label className={`block cursor-pointer rounded-xl border-2 p-4 ${paymentMethod === 'cod' ? 'border-gold bg-pale-gold/20' : 'border-gold/15'}`}><span className="flex items-center gap-3"><input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="h-4 w-4 accent-gold" /><span className="text-2xl">💵</span><div><strong className="text-forest block">Cash on Delivery (COD)</strong><span className="text-xs text-forest/60">Pay safely with cash upon delivery of your order</span></div></span></label><label className="block rounded-xl border-2 border-forest/15 bg-forest/5 p-4 opacity-75 cursor-not-allowed"><span className="flex items-center gap-3"><input type="radio" name="payment" disabled className="h-4 w-4 text-gray-400" /><FiCreditCard className="text-forest/40" /><div><strong className="text-forest/60 block">Online Payment (Cards, UPI, Netbanking)</strong><span className="text-xs text-forest/40">Gateway integration scheduled for future V2 release</span></div><span className="ml-auto rounded-pill bg-forest/10 px-2 py-0.5 text-xs text-forest/50">Coming in V2</span></span></label></div>{paymentError && <p className="mt-4 text-sm text-red-600">{paymentError}</p>}<Button type="button" loading={processing} onClick={pay} className="mt-7 min-h-14 w-full bg-forest text-lg text-white hover:bg-forest-deep">Place Order ({money(total)})</Button><p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-forest/55"><FiShield className="text-gold" />256-bit SSL Encrypted Checkout | Vilora Naturals</p></div>}</section><OrderSummary items={items} subtotal={subtotal} shipping={shipping} discount={discount} total={total} /></div>}</div></div></PageWrapper>;
};

export default Checkout;
