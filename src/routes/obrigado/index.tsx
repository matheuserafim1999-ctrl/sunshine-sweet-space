import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/obrigado/")({
  component: () => {
    return (
      <iframe
        src="/obrigado/index.html"
        style={{ width: "100vw", height: "100vh", border: "none" }}
      />
    );
  },
});