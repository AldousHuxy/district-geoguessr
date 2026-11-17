import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowOutward, MdClose, MdHistory, MdLocationOn } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import WatershedScene from './WatershedScene';
import routes from '@/router';
import { ROUND_COUNT, ROUND_TIME, useGameStore } from '@/store/gameStore';
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

const MainMenu = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, setFocus, formState: { errors } } = useForm<EmailForm>();
  const startGame = useGameStore((s) => s.startGame);

  useEffect(() => {
    if (modalOpen && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setFocus('email');
    }
  }, [modalOpen, setFocus]);

  const onSubmit = (data: EmailForm) => {
    const rounds = shuffle(locationsData as Location[]).slice(0, ROUND_COUNT);
    startGame(data.email, rounds);
    setModalOpen(false);
    navigate(routes.game);
  };

  const closeModal = () => {
    setModalOpen(false);
    document.getElementById('start-game')?.focus();
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#061d25] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_35%,rgba(29,126,133,0.22),transparent_48%),radial-gradient(ellipse_at_10%_90%,rgba(37,76,92,0.4),transparent_45%)]" />
      <div className="relative mx-auto flex min-h-dvh max-w-[1600px] flex-col pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8 sm:pb-8 sm:pt-6 lg:px-14 lg:pt-8 phone-landscape:pl-[max(1.25rem,env(safe-area-inset-left))] phone-landscape:pr-[max(1.25rem,env(safe-area-inset-right))] phone-landscape:pb-[max(0.5rem,env(safe-area-inset-bottom))] phone-landscape:pt-[max(0.5rem,env(safe-area-inset-top))]">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 sm:pb-5 phone-landscape:pb-2">
          <img
            src={`${import.meta.env.BASE_URL}MHFD%20Logo.png`}
            alt="Mile High Flood District"
            className="h-8 w-auto object-contain sm:h-12 phone-landscape:h-8"
          />
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-sky-blue sm:text-xs">
            <span className="h-2 w-2 rounded-full bg-soft-green motion-safe:animate-pulse" />
            GIS DAY <span className="hidden text-white/40 sm:inline">/</span>
            <span className="hidden text-white/60 sm:inline">THE DISTRICT, IN PLAY</span>
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center gap-3 py-4 sm:gap-6 sm:py-9 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-8 lg:py-12 phone-landscape:grid phone-landscape:grid-cols-2 phone-landscape:grid-rows-[1fr_auto] phone-landscape:gap-3 phone-landscape:py-2">
          <div className="contents lg:relative lg:z-10 lg:flex lg:max-w-2xl lg:flex-col">
            <div className="order-1 phone-landscape:col-start-1 phone-landscape:row-start-1 phone-landscape:self-end">
              <div className="mb-5 hidden items-center gap-2 rounded-full border border-soft-green/40 bg-soft-green/10 px-3 py-1.5 text-xs font-bold tracking-[0.2em] text-[#8de8d1] sm:inline-flex phone-landscape:hidden">
                <MdLocationOn size={16} aria-hidden="true" />
                A MILE HIGH MAP CHALLENGE
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-blue sm:mb-3 sm:text-base sm:tracking-[0.22em] phone-landscape:mb-1 phone-landscape:text-xs">District Geoguessr</p>
              <h1 className="text-[clamp(2rem,10vw,3rem)] font-black uppercase leading-[0.95] tracking-[-0.045em] sm:text-7xl xl:text-[6.25rem] phone-landscape:text-4xl">
                Know your<br />
                <span className="text-bright-yellow">district?</span>
              </h1>
              <p className="mt-3 max-w-md text-sm leading-snug text-white/75 sm:mt-5 sm:text-lg sm:leading-relaxed phone-landscape:mt-2 phone-landscape:text-sm phone-landscape:leading-snug">
                Explore Street View. Place your pin. See how well you know the waterways in your backyard.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-white/10 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white/80 sm:mt-7 sm:gap-x-6 sm:gap-y-3 sm:py-4 sm:text-sm sm:tracking-[0.14em] phone-landscape:mt-2 phone-landscape:py-2 phone-landscape:text-xs">
                <span><span className="text-bright-yellow">{ROUND_COUNT}</span> rounds</span>
                <span><span className="text-bright-yellow">{ROUND_TIME}</span> seconds each</span>
                <span className="hidden sm:inline">One district</span>
              </div>
            </div>

            <div className="order-3 w-full lg:order-2 phone-landscape:col-start-1 phone-landscape:row-start-2 phone-landscape:self-start">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:mt-7 sm:flex sm:flex-row sm:gap-3 phone-landscape:mt-0 phone-landscape:grid">
                <Button id="start-game" variant="primary" size="lg" className="min-h-12 gap-2 whitespace-nowrap px-3 text-sm uppercase tracking-wide shadow-[0_0_30px_rgba(255,221,0,0.18)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bright-yellow sm:min-h-14 sm:gap-4 sm:px-7 sm:text-base phone-landscape:min-h-12 phone-landscape:gap-1 phone-landscape:px-2 phone-landscape:text-xs" onClick={() => setModalOpen(true)}>
                  <span className="sm:hidden phone-landscape:inline">Play now</span><span className="hidden sm:inline phone-landscape:hidden">Drop into the district</span> <MdArrowOutward size={20} aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="lg" className="min-h-12 gap-1.5 whitespace-nowrap px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-blue sm:min-h-14 sm:gap-2.5 sm:px-7 sm:text-base phone-landscape:min-h-12 phone-landscape:gap-1 phone-landscape:px-2 phone-landscape:text-xs" onClick={() => navigate(routes.highScores)}>
                  <MdHistory size={20} aria-hidden="true" /> High Scores
                </Button>
              </div>
              <p className="mt-4 hidden text-xs text-white/55 sm:block phone-landscape:hidden">Ready to put your map instincts to the test?</p>
            </div>
          </div>

          <div className="relative order-2 h-[clamp(145px,24dvh,220px)] w-full overflow-hidden rounded-2xl border border-sky-blue/20 bg-[#082c35] sm:h-auto sm:min-h-[450px] sm:rounded-3xl lg:min-h-[580px] phone-landscape:col-start-2 phone-landscape:row-span-2 phone-landscape:row-start-1 phone-landscape:h-full phone-landscape:min-h-0">
            <img
              src={`${import.meta.env.BASE_URL}${encodeURIComponent('33rd Street Outfall.jpg')}`}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-[#061d25] via-[#082c35]/70 to-[#082c35]/50" />
            <WatershedScene />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.22em] text-sky-blue">WATERSHED EXPLORER</p>
                  <p className="mt-1 hidden text-xs text-white/60 sm:block">A new perspective on the district</p>
                </div>
                <span className="hidden rounded-full border border-soft-green/40 bg-[#082c35]/80 px-3 py-1 text-[10px] font-bold tracking-widest text-[#8de8d1] sm:block">FIELD NOTES</span>
              </div>
              <div className="absolute bottom-20 right-5 hidden w-36 rotate-3 rounded-xl border border-white/25 bg-[#061d25] p-1.5 shadow-xl sm:block sm:right-7 phone-landscape:hidden">
                <img
                  src={`${import.meta.env.BASE_URL}${encodeURIComponent('Cherry Creek.jpg')}`}
                  alt=""
                  className="h-20 w-full rounded-lg object-cover"
                />
                <p className="px-1 pb-1 pt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/75">From the field ↗</p>
              </div>
              <div className="flex items-end justify-between gap-4">
                <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider text-white/75">
                  <span className="rounded-full border border-white/20 bg-[#061d25]/80 px-3 py-1.5">Terrain</span>
                  <span className="rounded-full border border-white/20 bg-[#061d25]/80 px-3 py-1.5">Waterways</span>
                </div>
                <p className="text-right text-[10px] uppercase tracking-wider text-white/50"><span className="sm:hidden">Illustrative</span><span className="hidden sm:inline">Illustrative map<br />Not actual locations</span></p>
              </div>
            </div>
          </div>
        </main>
        <div className="hidden items-center justify-between border-t border-white/10 pt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 sm:flex phone-landscape:hidden">
          <span>Explore. Guess. Discover.</span>
          <span>Made for curious minds</span>
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title="Before you play...">
        <button type="button" aria-label="Close instructions" className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-lg text-sky-blue hover:bg-sky-blue/10 focus-visible:outline-2 focus-visible:outline-sky-blue" onClick={closeModal}>
          <MdClose size={24} aria-hidden="true" />
        </button>
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
            <span>Open the guess map on mobile, or use the map in the corner on desktop. Place a pin at your best guess, then hit <span className="text-sky-blue font-medium">Lock In Guess</span>. On mobile, switch back to Street View whenever you like.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-bright-yellow shrink-0 mt-0.5">•</span>
            <span>You have <span className="text-sky-blue font-medium">{ROUND_TIME} seconds</span> per round for <span className="text-sky-blue font-medium">{ROUND_COUNT} random rounds</span> selected from {locationsData.length} locations. Closer guesses earn more points.</span>
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
              autoCapitalize="none"
              inputMode="email"
              spellCheck={false}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              placeholder="you@example.com"
              className="w-full rounded-lg bg-dark-blue border border-sky-blue/30 text-sky-blue placeholder:text-sky-blue/30 px-4 py-3 text-base outline-none focus:border-sky-blue transition-colors"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              })}
            />
            {errors.email && (
              <p id="email-error" className="text-red-400 text-sm">{errors.email.message}</p>
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