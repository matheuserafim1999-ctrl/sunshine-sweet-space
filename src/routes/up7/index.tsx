import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/up7/")({
  component: () => (
    <iframe 
      src="/up/up7/index.html" 
      style={{ width: '100vw', height: '100vh', border: 'none' }}
      title="Upsell 7"
    />
  ),
});
