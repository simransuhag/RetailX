export default function Terms() {
  return (
    <div className="min-h-screen px-6 py-20 max-w-4xl mx-auto">
      <h1 className="text-4xl font-serif mb-8">Terms & Conditions</h1>

      <p className="text-zinc-600 mb-6">
        Welcome to <span className="font-semibold text-black">RetailX</span>. 
        By accessing or using our platform, you agree to comply with and be bound by the following Terms & Conditions. 
        Please read them carefully before using our services.
      </p>

      {/* Section 1 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">1. Use of the Platform</h2>
      <p className="text-zinc-600 mb-4">
        RetailX provides an AI-driven shopping experience. You agree to use the platform only for lawful purposes 
        and in a manner that does not infringe the rights of others.
      </p>

      {/* Section 2 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">2. User Accounts</h2>
      <ul className="list-disc pl-6 text-zinc-600 space-y-2">
        <li>You are responsible for maintaining the confidentiality of your account.</li>
        <li>All information provided must be accurate and up to date.</li>
        <li>We reserve the right to suspend accounts for suspicious or fraudulent activity.</li>
      </ul>

      {/* Section 3 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">3. Orders & Payments</h2>
      <ul className="list-disc pl-6 text-zinc-600 space-y-2">
        <li>All orders are subject to availability and confirmation.</li>
        <li>Prices are subject to change without prior notice.</li>
        <li>Payments are processed securely through trusted payment gateways.</li>
      </ul>

      {/* Section 4 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">4. Returns & Refunds</h2>
      <p className="text-zinc-600 mb-4">
        Returns and refunds are governed by our Returns Policy. Products must meet eligibility criteria 
        to qualify for a return or refund.
      </p>

      {/* Section 5 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">5. Intellectual Property</h2>
      <p className="text-zinc-600 mb-4">
        All content on RetailX including logos, text, images, and design is the property of RetailX 
        and is protected by applicable intellectual property laws.
      </p>

      {/* Section 6 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">6. Limitation of Liability</h2>
      <p className="text-zinc-600 mb-4">
        RetailX shall not be held liable for any indirect, incidental, or consequential damages arising 
        from the use or inability to use the platform.
      </p>

      {/* Section 7 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">7. Changes to Terms</h2>
      <p className="text-zinc-600 mb-4">
        We reserve the right to update or modify these Terms at any time. Continued use of the platform 
        constitutes acceptance of the updated terms.
      </p>

      {/* Section 8 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">8. Contact Us</h2>
      <p className="text-zinc-600">
        If you have any questions regarding these Terms & Conditions, please contact us at{" "}
        <span className="text-black font-medium">support@retailx.com</span>.
      </p>
    </div>
  );
}