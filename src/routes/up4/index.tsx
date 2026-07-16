import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/up4/")({
  component: () => (
    <iframe 
      src="/up/up4/index.html" 
      style={{ width: '100vw', height: '100vh', border: 'none' }}
      title="Upsell 4"
    />
  ),
});
