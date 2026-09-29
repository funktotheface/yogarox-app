import logoAsset from "@/assets/yogarox-logo.png.asset.json";
import { cn } from "@/lib/utils";

/** Primary YogaRox wordmark — use wherever the brand is identified. */
export function Logo({ className }: { className?: string | undefined }) {
  return <img src={logoAsset.url} alt="YogaRox" className={cn("h-7 w-auto", className)} />;
}
