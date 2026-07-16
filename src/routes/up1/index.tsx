import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/up1/")({
  component: Up1Component,
});

function Up1Component() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Handle checkout redirect messages
      if (event.origin === "https://checkout.cooud.com") {
        const data = event.data || {};
        if (data._cooud === true && data.v === 1) {
          if (data.type === 'cooud:redirect' && typeof data.url === 'string') {
            window.location.replace(data.url);
          }
        }
      }

      // Handle message from the background iframe (our upsell page)
      if (event.data === 'open_checkout') {
        setShowCheckout(true);
      }

      if (event.data === 'show_alert') {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    };

    window.addEventListener('message', handleMessage);

    const interval = setInterval(() => {
      try {
        const iframe = document.getElementById('upsell-frame') as HTMLIFrameElement;
        if (iframe?.contentWindow) {
          if ((iframe.contentWindow as any).__openCheckoutRequested) {
            setShowCheckout(true);
            (iframe.contentWindow as any).__openCheckoutRequested = false;
          }
        }
      } catch (e) {}
    }, 200);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Background: Original Upsell Page */}
      <iframe 
        id="upsell-frame"
        src="/up/up1/index.html" 
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Upsell 1 Background"
      />
      
      {/* Foreground: Checkout Overlay */}
      {showCheckout && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'rgba(0, 0, 0, 0.7)', 
          zIndex: 1000000
        }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowCheckout(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
            
            <iframe
              ref={frameRef}
              id="cooud-checkout-frame"
              src="https://checkout.cooud.com/embed/01KTB0PCVRVS3EARQ3B7S98MT5"
              allow="payment; storage-access"
              scrolling="auto"
              style={{ 
                width: '90vw',
                maxWidth: '450px',
                height: '80vh',
                maxHeight: '600px',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                backgroundColor: '#fff',
                margin: '0 auto'
              }}
              title="Upsell 1 Checkout"
            />
          </div>
        </div>
      )}

      {/* Custom Alert Overlay */}
    </div>
  );
}
