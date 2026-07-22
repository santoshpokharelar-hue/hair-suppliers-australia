import Image from "next/image";

type MarqueeImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

// Continuous left-scrolling strip of lifestyle photography. The image list is
// rendered twice back-to-back and the CSS animation (globals.css) translates
// the track by exactly one set's width (-50%), which loops seamlessly no
// matter how wide the actual images end up being.
export function LifestyleMarquee({ images }: { images: MarqueeImage[] }) {
  const track = [...images, ...images];

  return (
    <div className="relative overflow-hidden" aria-hidden={false}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-plum-dark to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-plum-dark to-transparent" />
      <div className="animate-marquee flex w-max items-center gap-4">
        {track.map((img, i) => (
          <div
            key={`${img.src}-${i}`}
            className="h-[240px] shrink-0 overflow-hidden rounded-2xl shadow-lg shadow-black/20"
            style={{ aspectRatio: `${img.width} / ${img.height}` }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              className="h-full w-full object-cover"
              sizes="(max-width: 640px) 200px, 320px"
              priority={i < images.length}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
