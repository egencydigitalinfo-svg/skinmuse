import { Link } from "react-router-dom";

const WelComeAfterOrder = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        
        <div className="mb-6">
          <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900">
            Order Placed Successfully!
          </h1>
        </div>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Thank you for shopping with us. Your order has been placed and a
          confirmation email has been sent to you.
        </p>
        <p className="text-gray-600 mb-8 leading-relaxed">
            We appreciate your business and hope you enjoy your purchase!
        </p>
        <Link
          to="/"
          className="inline-block w-full bg-foreground text-white py-3 rounded-lg font-medium hover:bg-foreground/80 transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default WelComeAfterOrder;
