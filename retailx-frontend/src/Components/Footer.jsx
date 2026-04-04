import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Sirf zaroori imports rakhe hain

export default function Footer() {
  const navigate = useNavigate(); // ✅ Ye line missing thi, ab add kar di hai

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">

        {/* Brand Section */}
        <div>
          <h2 className="text-2xl font-extrabold text-white">RetailX</h2>
          <p className="mt-4 text-sm text-gray-400">
            RetailX is an AI-driven immersive shopping platform offering personalized
            recommendations, smart search, and budget-friendly shopping.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li 
              onClick={() => navigate("/deals")} 
              className="hover:text-white cursor-pointer transition-colors"
            >
              Deals
            </li>
            <li 
              onClick={() => navigate("/help-center")} 
              className="hover:text-white cursor-pointer transition-colors"
            >
              Help Center
            </li>
          </ul>
        </div>

        {/* Support Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            
            <li 
              onClick={() => navigate("/privacy")} 
              className="hover:text-white cursor-pointer transition-colors"
            >
              Privacy Policy
            </li>
            <li 
              onClick={() => navigate("/terms")} 
              className="hover:text-white cursor-pointer transition-colors"
            >
              Terms & Conditions
            </li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
          <p className="text-sm text-gray-400">
            Email: support@retailx.com
          </p>
          <div className="flex gap-4 mt-4">
            <a href="mailto:support@retailx.com">
              <Mail className="hover:text-white cursor-pointer transition-transform hover:scale-110" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-400">
        © 2026 RetailX. AI-Driven Immersive Retail Experience.
      </div>
    </footer>
  );
}