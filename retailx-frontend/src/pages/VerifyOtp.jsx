// import { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// export default function VerifyOtp() {
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);

//   const location = useLocation();
//   const navigate = useNavigate();

//   const email =
//     location.state?.email || localStorage.getItem("otp_email");

//   const handleVerify = async () => {
//     setLoading(true);

//     try {
//       const res = await fetch(
//         "http://127.0.0.1:5000/api/auth/verify-otp",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email, otp }),
//         }
//       );

//       const data = await res.json();

//       if (res.ok) {
//         alert("✅ Email verified!");

//         localStorage.setItem("token", data.token);
//         localStorage.setItem(
//           "user",
//           JSON.stringify({ id: data.userId, email })
//         );

//         window.dispatchEvent(new Event("userLoginStateChange"));

//         const userPrefs = data.preferences || [];
//         localStorage.setItem(
//           "user_preferences",
//           JSON.stringify(userPrefs)
//         );

//         const redirectPath = localStorage.getItem("postAuthRedirect");

//         if (redirectPath) {
//           localStorage.removeItem("postAuthRedirect");
//           navigate(redirectPath);
//           return;
//         }

//         if (userPrefs.length >= 3) {
//           navigate("/customer-dashboard");
//         } else {
//           navigate("/preferences");
//         }
//       } else {
//         alert(data.message);
//       }
//     } catch (err) {
//       alert("Something went wrong!");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
//       <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
        
//         {/* Title */}
//         <h2 className="text-2xl font-semibold text-center mb-2">
//           Verify OTP
//         </h2>

//         <p className="text-gray-500 text-center mb-6 text-sm">
//           Enter the OTP sent to <span className="font-medium">{email}</span>
//         </p>

//         {/* Input */}
//         <input
//           type="text"
//           value={otp}
//           onChange={(e) => setOtp(e.target.value)}
//           placeholder="Enter 6-digit OTP"
//           className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-black"
//         />

//         {/* Button */}
//         <button
//           onClick={handleVerify}
//           disabled={loading}
//           className="w-full mt-6 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50"
//         >
//           {loading ? "Verifying..." : "Verify OTP"}
//         </button>

//         {/* Resend */}
//         {/* <p className="text-center text-sm text-gray-500 mt-4">
//           Didn’t receive OTP?{" "}
//           <span className="text-black font-medium cursor-pointer hover:underline">
//             Resend
//           </span>
//         </p> */}
//       </div>
//     </div>
//   );
// }