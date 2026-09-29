import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/live-classes")({
  component: () => <Outlet />,
});
