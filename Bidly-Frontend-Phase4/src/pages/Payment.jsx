import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { initiatePayment } from "../services/api";
import axios from "axios";

const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID;

export default function Payment() {

  const location = useLocation();
  const navigate = useNavigate();

  const auction = location.state?.auction;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>
          <h1 className="text-2xl font-bold">
            Payment details not found
          </h1>

          <button
            onClick={() => navigate("/auctions")}
            className="mt-4 px-5 py-2 bg-black text-white rounded-lg"
          >
            Back to Auctions
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {

    try {

      setLoading(true);
      setError("");

      // 1. Create Razorpay order
      const payment = await initiatePayment(
        auction.id
      );

      console.log("Payment:", payment);

      // 2. Open Razorpay checkout
      const options = {

        key: RAZORPAY_KEY_ID,

        amount:
          Number(payment.amount) * 100,

        currency:
          payment.currency || "INR",

        name: "Bidly",

        description:
          `Payment for ${auction.title}`,

        order_id:
          payment.gatewayOrderId,

        handler: async function (response) {

          try {

            console.log(
              "Razorpay response:",
              response
            );

            // 3. Verify payment on backend
            const verifyResponse =
              await axios.post(
                "/api/v1/payments/verify",
                {
                  razorpayOrderId:
                    response.razorpay_order_id,

                  razorpayPaymentId:
                    response.razorpay_payment_id,

                  razorpaySignature:
                    response.razorpay_signature
                },
                {
                  headers: {
                    Authorization:
                      `Bearer ${localStorage.getItem("token")}`
                  }
                }
              );

            console.log(
              "Payment verified:",
              verifyResponse.data
            );

            // 4. Payment success
            navigate("/payment/success", {
              state: {
                payment:
                  verifyResponse.data.data
              }
            });

          } catch (err) {

            console.error(err);

            setError(
              "Payment completed but verification failed."
            );
          }
        },

        prefill: {
          name: "",
          email: ""
        },

        theme: {
          color: "#000000"
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.open();

    } catch (err) {

      console.error(err);

      setError(
        err?.response?.data?.message ||
        "Unable to initiate payment"
      );

    } finally {

      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">

      <div className="max-w-xl mx-auto">

        <div className="bg-white rounded-2xl shadow-sm border p-8">

          <h1 className="text-3xl font-bold">
            Complete Payment
          </h1>

          <p className="text-gray-500 mt-2">
            You won this auction. Complete your payment.
          </p>


          <div className="mt-8 space-y-4">

            <div>
              <p className="text-sm text-gray-500">
                Auction
              </p>

              <p className="font-semibold">
                {auction.title}
              </p>
            </div>


            <div>
              <p className="text-sm text-gray-500">
                Amount
              </p>

              <p className="text-3xl font-bold">
                ₹{auction.currentHighestBid}
              </p>
            </div>

          </div>


          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 text-red-600">
              {error}
            </div>
          )}


          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full mt-8 py-3 rounded-xl bg-black text-white font-semibold disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : `Pay ₹${auction.currentHighestBid}`
            }
          </button>

        </div>

      </div>

    </div>
  );
}