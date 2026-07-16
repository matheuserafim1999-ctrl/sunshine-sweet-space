import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/upsell/back/")({
  component: () => {
    return (
      <iframe 
        src="/upsell/back/index.html" 
        style={{ width: '100vw', height: '100vh', border: 'none' }}
      />
    );
  },
});
