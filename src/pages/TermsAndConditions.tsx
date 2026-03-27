import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-4">
      <div className="container max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-serif font-bold text-center">
          Terms & Conditions – SkinMuse
        </h1>

        <p>
          Welcome to <strong>Skin Muse</strong>. By accessing or using our website,
          you agree to comply with the following Terms & Conditions. Please read them
          carefully before placing an order.
        </p>

        {/* 1. General */}
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">1. General</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Skin Muse is an online store offering skincare, haircare, cosmetics, and beauty accessories.</li>
            <li>By using our website, you agree to follow all rules, policies, and guidelines mentioned here.</li>
            <li>We reserve the right to update or modify these Terms & Conditions at any time without prior notice.</li>
          </ul>
        </section>

        {/* 2. Product Information */}
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">2. Product Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>All products listed on Skin Muse are 100% original and sourced from verified suppliers.</li>
            <li>Product colors, shades, and results may slightly vary due to screen settings or individual differences.</li>
            <li>Prices, availability, and product descriptions can change without notice.</li>
          </ul>
        </section>

        {/* 3. Orders & Payments */}
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">3. Orders & Payments</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Orders are processed only after complete information is provided by the customer.</li>
            <li>We accept Cash on Delivery (COD) and online payments (if enabled).</li>
            <li>For COD, customers must provide an active mobile number to confirm the order.</li>
            <li>Skin Muse reserves the right to cancel orders that appear suspicious, incomplete, or unverified.</li>
          </ul>
        </section>

        {/* 4. Delivery Policy */}
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">4. Delivery Policy</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Standard delivery charges are Rs. 250 nationwide.</li>
            <li>Delivery times vary by location, typically 2–5 working days.</li>
            <li>Skin Muse is not responsible for delays caused by courier companies, weather, or unforeseen issues.</li>
          </ul>
        </section>

        {/* 5. Return & Exchange */}
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">5. Return & Exchange</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Returns and exchanges are accepted only for damaged, defective, or incorrect products.</li>
            <li>Customers must report issues within 48 hours of delivery with proof (photos/video).</li>
            <li>Products must be unused, unopened, and in original condition.</li>
            <li>Delivery charges are non-refundable. (See full Return Policy for details.)</li>
          </ul>
        </section>

        {/* 6. Refund Policy */}
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">6. Refund Policy</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Refunds are only offered if the product is out of stock or unable to be replaced.</li>
            <li>Refunds are processed within 3–7 working days via Bank Transfer/EasyPaisa/JazzCash.</li>
          </ul>
        </section>

        {/* 7. Customer Responsibility */}
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">7. Customer Responsibility</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Customers must provide accurate details including name, address, and phone number.</li>
            <li>Any failed delivery due to wrong information will be the customer's responsibility.</li>
            <li>Customers must check product description, shades, and details before ordering.</li>
          </ul>
        </section>

        {/* 8. Privacy & Data Protection */}
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">8. Privacy & Data Protection</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>All customer information is kept confidential and used only for order processing and support.</li>
            <li>Skin Muse does not share or sell personal data to any third party.</li>
          </ul>
        </section>

        {/* 9. Intellectual Property */}
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">9. Intellectual Property</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>All images, content, logos, and designs on Skin Muse are the property of Skin Muse.</li>
            <li>Unauthorized use, copying, or distribution is strictly prohibited.</li>
          </ul>
        </section>

        {/* 10. Limitation of Liability */}
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">10. Limitation of Liability</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Skin Muse is not responsible for any allergic reactions or side effects caused by product use.</li>
            <li>Customers should read ingredients and perform patch tests before using products.</li>
          </ul>
        </section>

        {/* 11. Contact Information */}
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">11. Contact Information</h2>
          <p>For any inquiries or support:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Email: <a href="mailto:info@skinmuse.pk" className="text-primary underline">info@skinmuse.pk</a></li>
            <li>WhatsApp:  <a href="https://wa.me/923045077740">03045077740</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
