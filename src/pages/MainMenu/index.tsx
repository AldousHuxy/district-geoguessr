import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Carousel from '@/components/ui/carousel';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import routes from '@/router';
import { useGameStore } from '@/store/gameStore';
import type { Location } from '@/store/gameStore';
import locationsData from '@/data/locations.json';

type EmailForm = { email: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const carouselImages = [
  '33rd Street Outfall.jpg',
  'Big Dry Creek (ArapCo).jpg',
  'Boulder Creek.jpg',
  'Cherry Creek.jpg',
  'Clear Creek.jpg',
  'First Creek Park.jpg',
  'Grange Hall Creek.jpg',
  'Little Dry Creek ADCO.jpg',
  'Niver Creek Ruston Park.jpg',
  'Sanderson Gulch.jpg',
  'SPR Confluence Park.jpg',
  'SPR River Run.jpg',
  'SPR.jpg',
  'Van Bibber Drop 2.jpg',
  'West Fork of Kenneys Run.jpg',
  'Wonderland Creek.jpg',
].map(name => `/${encodeURIComponent(name)}`);

const MainMenu = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<EmailForm>();
  const startGame = useGameStore((s) => s.startGame);

  const onSubmit = (data: EmailForm) => {
    const shuffled = shuffle(locationsData as Location[]);
    startGame(data.email, shuffled);
    setModalOpen(false);
    navigate(routes.game);
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-dark-blue">
      {/* Background carousel */}
      <Carousel images={carouselImages} className="absolute inset-0 w-full h-full" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-dark-blue via-dark-blue/60 to-dark-blue/20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full px-6 pt-12 pb-16 safe-area-inset">
        {/* Logo */}
        <img
          src="/MHFD Logo.png"
          alt="MHFD Logo"
          className="h-14 object-contain drop-shadow-lg"
        />

        {/* Title block */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-5xl font-bold text-bright-yellow leading-tight tracking-tight drop-shadow-lg">
            District<br />GeoGuesser
          </h1>
          <p className="text-sky-blue/80 text-base max-w-xs">
            Can you identify your local waterways?
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col w-full max-w-xs gap-3">
          <Button variant="primary" size="lg" className="w-full text-xl" onClick={() => setModalOpen(true)}>
            Play
          </Button>
        </div>
      </div>

      {/* Email modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Before you play...">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-sky-blue/80">
              Enter your email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg bg-dark-blue border border-sky-blue/30 text-sky-blue placeholder:text-sky-blue/30 px-4 py-3 text-base outline-none focus:border-sky-blue transition-colors"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              })}
            />
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email.message}</p>
            )}
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Let's Go
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default MainMenu;