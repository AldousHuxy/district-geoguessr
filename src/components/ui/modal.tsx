import { AnimatePresence, motion } from 'framer-motion';
import { useId } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

const Modal = ({ open, onClose, children, title }: ModalProps) => {
  const titleId = useId();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-dark-blue/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 rounded-2xl bg-dark-blue-100 border border-sky-blue/20 p-6 shadow-2xl max-w-lg mx-auto overflow-y-auto max-h-[90dvh]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Escape') onClose();
            }}
          >
            {title && (
              <h2 id={titleId} className="text-xl font-bold text-sky-blue mb-4">{title}</h2>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
