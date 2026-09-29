/**
 * Reusable Vimeo recurring live-event player.
 * Vimeo itself shows whether the event is live, waiting, or unavailable —
 * the app intentionally performs no schedule or stream-state detection.
 */
export function LiveClassPlayer({ embedUrl, title }: { embedUrl: string; title: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-foreground/5">
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 size-full"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
