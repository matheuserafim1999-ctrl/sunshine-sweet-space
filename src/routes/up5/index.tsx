import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/up5/")({
  component: () => (
    <iframe 
      src="/up/up5/index.html" 
      style={{ width: '100vw', height: '100vh', border: 'none' }}
      title="Upsell 5"
    />
  ),
});
