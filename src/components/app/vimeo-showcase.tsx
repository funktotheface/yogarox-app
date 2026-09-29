/** Reusable responsive Vimeo showcase (gallery) embed. Vimeo renders its own gallery UI. */
export function VimeoShowcase({ showcaseUrl, title }: { showcaseUrl: string; title: string }) {
  return (
    <div className="relative h-[1200px] w-full overflow-hidden rounded-lg border border-border bg-card">
      <iframe
        src={showcaseUrl}
        title={title}
        className="absolute inset-0 size-full"
        allow="autoplay; fullscreen; picture-in-picture; gyroscope; accelerometer; clipboard-write; encrypted-media; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
