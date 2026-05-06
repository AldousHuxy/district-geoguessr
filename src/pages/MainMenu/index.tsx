import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdHistory } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import Carousel from '@/components/ui/carousel';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import routes from '@/router';
import { ROUND_TIME, useGameStore } from '@/store/gameStore';
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
].map(name => `${import.meta.env.BASE_URL}${encodeURIComponent(name)}`);

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
      <Carousel images={carouselImages} className="absolute inset-0 w-full h-full" />

      <div className="absolute inset-0 bg-linear-to-t from-dark-blue via-dark-blue/60 to-dark-blue/20" />

      <div className="relative z-10 flex flex-col items-center justify-between h-full px-6 pt-12 pb-16 safe-area-inset">
        <img
          src={`${import.meta.env.BASE_URL}MHFD%20Logo.png`}
          alt="MHFD Logo"
          className="h-14 object-contain drop-shadow-lg"
        />

        <div className="flex flex-col items-start gap-3">
          <h1 className="text-5xl font-bold text-bright-yellow leading-tight tracking-tight drop-shadow-lg">
            District<br />Geoguessr
          </h1>
          <p className="text-sky-blue/80 text-base max-w-xs">
            How well do you know the District?
          </p>
        </div>

        <div className="flex flex-col w-full max-w-xs gap-3">
          <div className="flex items-center gap-3">
            <Button variant="primary" size="lg" className="flex-1 text-xl" onClick={() => setModalOpen(true)}>
              Play
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate(routes.highScores)} aria-label="High Scores">
              <MdHistory size={24} />
            </Button>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Before you play...">
        <ul className="flex flex-col gap-1.5 mb-4 text-sm text-sky-blue/70">
          <li className="flex items-start gap-2">
            <span className="text-bright-yellow shrink-0 mt-0.5">•</span>
            <span>You'll be dropped into <span className="text-sky-blue font-medium">Google Street View</span> at a waterway somewhere in the MHFD district.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-bright-yellow shrink-0 mt-0.5">•</span>
            <span>Look around for clues — signage, vegetation, landmarks — to figure out where you are.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-bright-yellow shrink-0 mt-0.5">•</span>
            <span>Click the <span className="text-sky-blue font-medium">map in the corner</span> to drop a pin at your best guess, then hit <span className="text-sky-blue font-medium">Lock In Guess</span>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-bright-yellow shrink-0 mt-0.5">•</span>
            <span>You have <span className="text-sky-blue font-medium">{ROUND_TIME} seconds</span> per round across all <span className="text-sky-blue font-medium">{locationsData.length} locations</span>. Closer guesses earn more points.</span>
          </li>
        </ul>
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