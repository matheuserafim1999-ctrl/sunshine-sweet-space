import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/up2/")({
  component: () => (
    <iframe 
      src="/up/up2/index.html" 
      style={{ width: '100vw', height: '100vh', border: 'none' }}
      title="Upsell 2"
    />
  ),
});
