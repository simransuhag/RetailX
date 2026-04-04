export default function Returns() {
  return (
    <div className="min-h-screen px-6 py-20 max-w-4xl mx-auto">
      <h1 className="text-4xl font-serif mb-8">Returns & Refund Policy</h1>

      <p className="text-zinc-600 mb-6">
        At <span className="font-semibold text-black">RetailX</span>, we strive to ensure 
        complete customer satisfaction. If you are not entirely satisfied with your purchase, 
        we’re here to help.
      </p>

      {/* Section 1 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">1. Return Eligibility</h2>
      <ul className="list-disc pl-6 text-zinc-600 space-y-2">
        <li>Items must be returned within <span className="font-medium text-black">7 days</span> of delivery.</li>
        <li>Products must be unused, unworn, and in original condition.</li>
        <li>All original tags, packaging, and invoices must be included.</li>
        <li>Certain items like innerwear, personal care, or final sale products may not be eligible for returns.</li>
      </ul>

      {/* Section 2 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">2. Return Process</h2>
      <p className="text-zinc-600 mb-4">
        To initiate a return, please log in to your account and navigate to the "My Orders" section. 
        Select the product you wish to return and follow the instructions provided.
      </p>
      <ul className="list-disc pl-6 text-zinc-600 space-y-2">
        <li>Our team will review your request.</li>
        <li>Pickup will be scheduled if the return is approved.</li>
        <li>You will receive updates via email or SMS.</li>
      </ul>

      {/* Section 3 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">3. Refund Policy</h2>
      <ul className="list-disc pl-6 text-zinc-600 space-y-2">
        <li>Refunds will be processed after successful inspection of the returned item.</li>
        <li>The amount will be credited to your original payment method.</li>
        <li>Refund processing may take <span className="font-medium text-black">5–7 business days</span>.</li>
      </ul>

      {/* Section 4 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">4. Exchange Policy</h2>
      <p className="text-zinc-600 mb-4">
        We currently offer exchanges only for defective or damaged items. 
        If you need a different size or variant, we recommend placing a new order.
      </p>

      {/* Section 5 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">5. Non-Returnable Items</h2>
      <ul className="list-disc pl-6 text-zinc-600 space-y-2">
        <li>Items marked as "Final Sale"</li>
        <li>Personal care products</li>
        <li>Gift cards and digital products</li>
      </ul>

      {/* Section 6 */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">6. Contact Support</h2>
      <p className="text-zinc-600">
        If you have any questions regarding returns or refunds, feel free to contact us at{" "}
        <span className="text-black font-medium">support@retailx.com</span>.
      </p>
    </div>
  );
}