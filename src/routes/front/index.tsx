import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/front/")({
  component: () => {
    return (
      <iframe 
        src="/front/index.html" 
        style={{ width: '100vw', height: '100vh', border: 'none' }}
      />
    );
  },
});
