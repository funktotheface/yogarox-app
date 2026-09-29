import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { AppShell, AuthenticatedScreen, DeveloperNote, IntegrationPlaceholder } from "@/components/app/app-shell";
export const Route = createFileRoute("/profile-payment-details")({ head: () => ({ meta: [
  { title: "Payment details — YogaRox" }, { name: "description", content: "YogaRox payment and membership management placeholder." },
  { property: "og:title", content: "Payment details — YogaRox" }, { property: "og:description", content: "YogaRox payment and membership management placeholder." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: PaymentPage });
function PaymentPage() { return <AuthenticatedScreen><AppShell title="Payment details" backTo="/profile"><div className="mb-5 flex size-14 items-center justify-center rounded-full bg-accent text-primary"><CreditCard aria-hidden="true" className="size-6" /></div><IntegrationPlaceholder label="PAYMENT / MEMBERSHIP MANAGEMENT GOES HERE" detail="No payment destination or provider is connected." icon="empty" /><div className="mt-5"><DeveloperNote>MEMBERSHIP TODO: Replace this placeholder only after the approved membership-management destination and access contract are supplied. No payment functionality is implemented here.</DeveloperNote></div></AppShell></AuthenticatedScreen>; }
