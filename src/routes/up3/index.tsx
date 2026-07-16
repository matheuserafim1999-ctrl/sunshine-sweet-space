import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/up3/")({
  component: () => (
    <iframe 
      src="/up/up3/index.html" 
      style={{ width: '100vw', height: '100vh', border: 'none' }}
      title="Upsell 3"
    />
  ),
});
