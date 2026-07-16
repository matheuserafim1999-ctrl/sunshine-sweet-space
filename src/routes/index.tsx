import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => {
    if (typeof window !== "undefined") {
      window.location.href = "/pressel/";
    }
    return null;
  },
});
