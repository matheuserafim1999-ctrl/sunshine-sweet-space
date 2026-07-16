import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/donate/")({
  component: DonatePage,
});

function DonatePage() {
  useEffect(() => {
    // Redirect to upsell or a success page if it exists
    // For now, let's just show a success message or redirect to /upsell/back/
    const timer = setTimeout(() => {
      window.location.href = "/upsell/back/";
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago confirmado!</h1>
        <p className="text-gray-600 mb-8">
          Tu saldo está siendo liberado. Serás redireccionado en unos segundos...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
      </div>
    </div>
  );
}
