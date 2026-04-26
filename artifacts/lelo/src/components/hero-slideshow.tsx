import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface HeroSlideshowProps {
  images: string[];
  intervalMs?: number;
}

export function HeroSlideshow({ images, intervalMs = 5500 }: HeroSlideshowProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.18 }}
          exit={{ opacity: 0, scale: 1.22 }}
          transition={{
            opacity: { duration: 1.4, ease: "easeInOut" },
            scale: { duration: intervalMs / 1000 + 1.4, ease: "linear" },
          }}
        >
          <img
            src={images[index]}
            alt=""
            className="w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
