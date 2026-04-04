export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen px-6 py-20 max-w-4xl mx-auto">
      <h1 className="text-4xl font-serif mb-8">Privacy Policy</h1>

      <p className="text-zinc-600 mb-6">
        At <span className="font-semibold text-black">RetailX</span>, we are committed 
        to protecting your privacy. This Privacy Policy explains how we collect, use, 
        and safeguard your personal information when you use our platform.
      </p>

      {/* Section 1 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">1. Information We Collect</h2>
      <ul className="list-disc pl-6 text-zinc-600 space-y-2">
        <li>Personal details such as name, email address, and contact number</li>
        <li>Account and login information</li>
        <li>Browsing behavior, preferences, and interaction data</li>
        <li>Payment-related information (processed securely via third-party gateways)</li>
      </ul>

      {/* Section 2 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">2. How We Use Your Information</h2>
      <ul className="list-disc pl-6 text-zinc-600 space-y-2">
        <li>To provide personalized shopping recommendations</li>
        <li>To process orders and manage transactions</li>
        <li>To improve our platform, services, and user experience</li>
        <li>To communicate updates, offers, and support-related messages</li>
      </ul>

      {/* Section 3 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">3. Data Protection & Security</h2>
      <p className="text-zinc-600 mb-4">
        We implement industry-standard security measures to protect your data, including 
        encryption, secure servers, and access control mechanisms.
      </p>

      {/* Section 4 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">4. Sharing of Information</h2>
      <ul className="list-disc pl-6 text-zinc-600 space-y-2">
        <li>We do not sell your personal data to third parties</li>
        <li>Data may be shared with trusted partners for payment processing and delivery</li>
        <li>We may disclose information if required by law or legal processes</li>
      </ul>

      {/* Section 5 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">5. Cookies & Tracking</h2>
      <p className="text-zinc-600 mb-4">
        RetailX uses cookies and similar technologies to enhance user experience, 
        analyze traffic, and personalize content.
      </p>

      {/* Section 6 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">6. Your Rights</h2>
      <ul className="list-disc pl-6 text-zinc-600 space-y-2">
        <li>You can access, update, or delete your personal information</li>
        <li>You may opt out of marketing communications at any time</li>
        <li>You can request details about how your data is being used</li>
      </ul>

      {/* Section 7 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">7. Updates to This Policy</h2>
      <p className="text-zinc-600 mb-4">
        We may update this Privacy Policy from time to time. Any changes will be 
        reflected on this page with an updated effective date.
      </p>

      {/* Section 8 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">8. Contact Us</h2>
      <p className="text-zinc-600">
        If you have any questions or concerns about this Privacy Policy, please contact us at{" "}
        <span className="text-black font-medium">support@retailx.com</span>.
      </p>
    </div>
  );
}