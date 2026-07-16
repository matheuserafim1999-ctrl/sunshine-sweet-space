import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/")({
  component: () => {
    return (
      <iframe 
        src="/checkout/index.html" 
        style={{ width: '100vw', height: '100vh', border: 'none' }}
      />
    );
  },
});
