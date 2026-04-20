import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import cn from '@/utils/cn';

type ImageCarouselProps = {
  images: string[];
  interval?: number;
  className?: string;
};

const Carousel = ({ images, interval = 4500, className }: ImageCarouselProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <AnimatePresence initial={false}>
        <motion.img
          key={index}
          src={images[index]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 w-full h-full object-cover"
          alt=""
        />
      </AnimatePresence>
    </div>
  );
};

export default Carousel;
