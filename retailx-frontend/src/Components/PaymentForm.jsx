import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

const PaymentForm = ({ total }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      alert("Stripe failed to load. Disable ad blockers or tracking protection.");
      return;
    }

    setLoading(true);

    const res = await fetch("http://localhost:5000/api/payment/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total * 100 })
    });

    const { clientSecret } = await res.json();

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (result.error) {
      alert(result.error.message);
    } else if (result.paymentIntent.status === "succeeded") {
      alert("Payment Successful 🎉");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CardElement className="p-4 border rounded-xl" />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-black text-white py-4 rounded-full font-bold"
      >
        {loading ? "Processing..." : `Pay ₹${total}`}
      </button>
    </form>
  );
};

export default PaymentForm;   // ✅ THIS LINE IS REQUIRED