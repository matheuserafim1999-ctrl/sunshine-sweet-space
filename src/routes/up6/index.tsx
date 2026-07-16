import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/up6/")({
  component: () => (
    <iframe 
      src="/up/up6/index.html" 
      style={{ width: '100vw', height: '100vh', border: 'none' }}
      title="Upsell 6"
    />
  ),
});
