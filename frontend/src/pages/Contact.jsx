import React, { useState } from 'react';
import { PageWrapper, Button } from '../components';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      return toast.error('Please complete all required fields.');
    }
    setSubmitted(true);
    toast.success('Your message has been received! Our support team will get back to you within 24 hours.');
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-cream py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-gold block mb-2">
              Customer Support &amp; Enquiries
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-forest">
              Get in Touch with Vilora
            </h1>
            <p className="mt-3 text-forest/70 text-sm sm:text-base">
              Have questions about an order, wholesale requirements, or our organic certification? We are here to help.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Details Card */}
            <div className="bg-forest text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">Vilora Naturals Helpdesk</h2>
                <p className="text-cream/80 text-sm leading-relaxed">
                  We take pride in exceptional customer satisfaction. Reach out through any of our channels below:
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-pale-gold/20 text-gold rounded-xl">
                    <FiMail className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gold">Email Support</h3>
                    <a href="mailto:support@viloranaturals.com" className="text-sm text-cream hover:underline block mt-0.5">
                      support@viloranaturals.com
                    </a>
                    <span className="text-xs text-cream/60">Typical response time: under 4 hours</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-pale-gold/20 text-gold rounded-xl">
                    <FiPhone className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gold">Phone Support</h3>
                    <p className="text-sm text-cream mt-0.5">+91 (022) 4893-1200</p>
                    <span className="text-xs text-cream/60">Mon - Sat: 9:00 AM - 6:00 PM IST</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-pale-gold/20 text-gold rounded-xl">
                    <FiMapPin className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gold">Corporate Headquarters</h3>
                    <p className="text-sm text-cream/90 leading-relaxed mt-0.5">
                      Vilora Organic Essentials PVT LTD<br />
                      Level 5, Platina Tower, Bandra Kurla Complex (BKC)<br />
                      Mumbai, Maharashtra 400051, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-pale-gold/20 text-gold rounded-xl">
                    <FiClock className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gold">Operating Hours</h3>
                    <p className="text-sm text-cream/90 mt-0.5">
                      Monday to Saturday: 9:00 AM – 6:00 PM IST<br />
                      Sunday: Closed (Orders dispatched on next working day)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-3xl border border-gold/20 p-8 sm:p-10 shadow-sm">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="text-3xl" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-forest mb-2">Message Received!</h3>
                  <p className="text-sm text-forest/70 max-w-md mx-auto mb-6 leading-relaxed">
                    Thank you for contacting Vilora Naturals, <strong>{form.name}</strong>. A support specialist has been assigned to your inquiry and will email you at <strong>{form.email}</strong> shortly.
                  </p>
                  <Button variant="secondary" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="font-display text-2xl font-bold text-forest mb-2">Send Us a Message</h2>
                  <p className="text-xs text-forest/60 mb-4">
                    Fill out the form below and we will get back to you as soon as possible.
                  </p>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aditi Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="aditi@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Order Inquiry / Quality Question / Wholesale"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                      Message *
                    </label>
                    <textarea
                      rows="4"
                      required
                      placeholder="How can our customer experience team assist you today?"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gold/30 text-sm text-forest outline-none focus:border-gold"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full flex items-center justify-center gap-2">
                    <FiSend /> Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
