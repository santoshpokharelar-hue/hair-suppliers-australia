import Image from "next/image";

type GridImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

// Static editorial photo grid — deliberately not another scrolling animation,
// so the page doesn't feel like the same motion repeated everywhere.
export function LifestyleGrid({ images }: { images: GridImage[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {images.map((img) => (
        <div key={img.src} className="aspect-[4/5] overflow-hidden rounded-2xl">
          <Image
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        </div>
      ))}
    </div>
  );
}
