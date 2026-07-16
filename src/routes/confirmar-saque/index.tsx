import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/confirmar-saque/")({
  component: () => {
    return (
      <iframe 
        src="/confirmar-saque/index.html" 
        style={{ width: '100vw', height: '100vh', border: 'none' }}
      />
    );
  },
});
