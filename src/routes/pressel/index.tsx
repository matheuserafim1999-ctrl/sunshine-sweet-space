import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pressel/")({
  component: () => {
    return (
      <iframe 
        src="/pressel/index.html" 
        style={{ width: '100vw', height: '100vh', border: 'none' }}
      />
    );
  },
});
