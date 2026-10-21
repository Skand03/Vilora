import React from 'react';
import { PageWrapper } from '../components';
import { Link, useLocation } from 'react-router-dom';
import { FiShield, FiTruck, FiRotateCcw, FiFileText } from 'react-icons/fi';

const POLICIES = {
  '/privacy-policy': {
    title: 'Privacy Policy',
    subtitle: 'How Vilora Naturals safeguards your personal information and transactions.',
    icon: FiShield,
    updated: 'October 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        content:
          'When you create an account, browse products, or place an order at Vilora Naturals, we collect essential order details including your full name, email address, delivery shipping address, and telephone number. We do not store sensitive payment card information on our servers.',
      },
      {
        heading: '2. Use of Information',
        content:
          'Your data is exclusively utilized to process, pack, and fulfill your dry fruit orders, send delivery tracking SMS and email updates, and respond to customer service requests.',
      },
      {
        heading: '3. Data Protection and SSL Security',
        content:
          'All communication between your browser and Vilora Naturals is encrypted using standard 256-bit TLS/SSL encryption. We will never sell, lease, or trade your personal information to third-party advertisers.',
      },
      {
        heading: '4. Contact for Privacy Inquiries',
        content:
          'If you have questions regarding your stored profile data or wish to request data erasure, please email privacy@viloranaturals.com.',
      },
    ],
  },
  '/terms': {
    title: 'Terms & Conditions',
    subtitle: 'Important agreements and guidelines governing the use of Vilora Naturals storefront.',
    icon: FiFileText,
    updated: 'October 2026',
    sections: [
      {
        heading: '1. Storefront Usage',
        content:
          'By accessing and using viloranaturals.com, you agree to comply with our terms of service and all applicable Indian consumer protection laws.',
      },
      {
        heading: '2. Product Pricing and Availability',
        content:
          'All dry fruits, nuts, berries, and seed prices are listed in Indian Rupees (₹) inclusive of applicable goods and services taxes. While we endeavor to maintain accurate live inventory, products are subject to stock availability.',
      },
      {
        heading: '3. Orders and Acceptance',
        content:
          'Placement of an order constitutes an offer to purchase. Vilora reserves the right to verify address serviceability before dispatching Cash on Delivery consignments.',
      },
      {
        heading: '4. Intellectual Property',
        content:
          'All branding, trademarks, logos, photography, packaging designs, and digital content are the intellectual property of Vilora Organic Essentials PVT LTD.',
      },
    ],
  },
  '/shipping-policy': {
    title: 'Shipping & Delivery Policy',
    subtitle: 'Guidelines for pan-India dispatch, delivery timelines, and transit care.',
    icon: FiTruck,
    updated: 'October 2026',
    sections: [
      {
        heading: '1. Order Processing Time',
        content:
          'All dry fruit orders are freshly packed in oxygen-barrier pouches within 24 to 48 business hours following order confirmation.',
      },
      {
        heading: '2. Free Shipping Threshold',
        content:
          'We offer FREE express shipping across India on all orders exceeding ₹499. For orders below ₹499, a nominal standard delivery charge of ₹49 is applied at checkout.',
      },
      {
        heading: '3. Estimated Delivery Timelines',
        content:
          'Metropolitan areas (Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Kolkata): 2 to 4 business days. Tier-2 and Tier-3 cities: 3 to 6 business days via trusted logistics partners including Blue Dart and Delhivery.',
      },
      {
        heading: '4. Cash on Delivery (COD) Verification',
        content:
          'COD is supported across serviceable pincodes in India. Please ensure exact change or digital UPI scan-and-pay is ready upon courier delivery.',
      },
    ],
  },
  '/return-refund-policy': {
    title: 'Return & Refund Policy',
    subtitle: 'Our 100% freshness guarantee and hassle-free return resolution procedure.',
    icon: FiRotateCcw,
    updated: 'October 2026',
    sections: [
      {
        heading: '1. Freshness & Quality Guarantee',
        content:
          'Because our dry fruits and nuts are consumable food items, we maintain stringent food safety protocols. If your parcel arrives damaged, seal-tampered, or defective, notify us within 48 hours of delivery.',
      },
      {
        heading: '2. Replacement & Refund Eligibility',
        content:
          'Eligible requests accompanied by photographs of the damaged transit box or defective item will be granted an immediate replacement dispatch or full refund to the original mode of payment / bank account.',
      },
      {
        heading: '3. Cancellation Policy',
        content:
          'Orders can be freely cancelled from your Customer Account page while the fulfillment status remains in PENDING or CONFIRMED state. Once a consignment is handed over to the courier (SHIPPED), in-transit cancellation is not supported.',
      },
      {
        heading: '4. How to Initiate a Claim',
        content:
          'Contact our support desk at support@viloranaturals.com or WhatsApp +91 (022) 4893-1200 with your Order ID and photos. Claims are resolved within 2 business days.',
      },
    ],
  },
  '/faq': {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about our organic dry fruits, delivery, and storage.',
    icon: FiFileText,
    updated: 'October 2026',
    sections: [
      {
        heading: 'Are Vilora dry fruits 100% organic and preservative-free?',
        content:
          'Yes. All Vilora dry fruits, nuts, berries, and seeds are non-GMO, zero-sulfur, and packaged without artificial preservatives, added sugar, or chemical glazing agents.',
      },
      {
        heading: 'How should I store dry fruits and nuts to maintain maximum freshness?',
        content:
          'Store in our airtight resealable pouches or transfer to an airtight glass container in a cool, dry place away from direct sunlight. In warm or humid seasons, refrigerating almonds, walnuts, and figs preserves their natural crunch and essential oils for up to 9 months.',
      },
      {
        heading: 'What are the delivery timelines and charges?',
        content:
          'We provide FREE Express Shipping across India on all orders above ₹499. Orders below ₹499 incur a flat ₹49 delivery charge. Metro deliveries typically take 2-4 business days, while other locations take 3-6 business days.',
      },
      {
        heading: 'Is Cash on Delivery (COD) supported?',
        content:
          'Yes, Cash on Delivery (COD) is available across all serviceable pincodes in India. You can pay with cash or scan-and-pay via UPI directly to the courier partner upon delivery.',
      },
      {
        heading: 'Can I cancel an order after placing it?',
        content:
          'Yes! You can cancel your order directly from your "My Account > Orders" page at any time while the order status is PENDING or CONFIRMED.',
      },
      {
        heading: 'Do you offer festival and corporate gift hampers?',
        content:
          'Yes. We offer custom luxury wooden and velvet gift boxes filled with assorted dry fruits and royal dates for Diwali, Eid, weddings, and corporate gifting. Contact corporate@viloranaturals.com for personalized bulk orders.',
      },
    ],
  },
};

export default function PolicyPage() {
  const location = useLocation();
  const policy = POLICIES[location.pathname] || POLICIES['/privacy-policy'];
  const Icon = policy.icon;

  return (
    <PageWrapper>
      <div className="min-h-screen bg-cream py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-forest text-white rounded-3xl p-8 sm:p-12 shadow-md mb-10 text-center relative overflow-hidden">
            <div className="w-14 h-14 bg-pale-gold/20 text-gold rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              <Icon />
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold">{policy.title}</h1>
            <p className="mt-3 text-cream/80 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              {policy.subtitle}
            </p>
            <span className="inline-block mt-4 text-xs font-semibold text-gold bg-forest-deep px-3 py-1 rounded-full border border-gold/30">
              Last Updated: {policy.updated}
            </span>
          </div>

          {/* Quick Nav Chips */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <Link
              to="/faq"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/faq'
                  ? 'bg-gold text-forest-deep shadow'
                  : 'bg-white border border-gold/30 text-forest hover:bg-pale-gold/30'
              }`}
            >
              FAQs
            </Link>
            <Link
              to="/privacy-policy"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/privacy-policy'
                  ? 'bg-gold text-forest-deep shadow'
                  : 'bg-white border border-gold/30 text-forest hover:bg-pale-gold/30'
              }`}
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/terms'
                  ? 'bg-gold text-forest-deep shadow'
                  : 'bg-white border border-gold/30 text-forest hover:bg-pale-gold/30'
              }`}
            >
              Terms &amp; Conditions
            </Link>
            <Link
              to="/shipping-policy"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/shipping-policy'
                  ? 'bg-gold text-forest-deep shadow'
                  : 'bg-white border border-gold/30 text-forest hover:bg-pale-gold/30'
              }`}
            >
              Shipping Policy
            </Link>
            <Link
              to="/return-refund-policy"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/return-refund-policy'
                  ? 'bg-gold text-forest-deep shadow'
                  : 'bg-white border border-gold/30 text-forest hover:bg-pale-gold/30'
              }`}
            >
              Return &amp; Refund
            </Link>
          </div>

          {/* Policy Sections */}
          <div className="bg-white rounded-3xl border border-gold/20 p-8 sm:p-12 shadow-sm space-y-8">
            {policy.sections.map((section, idx) => (
              <div key={idx} className="border-b border-gold/15 last:border-0 pb-8 last:pb-0">
                <h2 className="font-display text-xl font-bold text-forest mb-3">{section.heading}</h2>
                <p className="text-forest/75 text-sm sm:text-base leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
