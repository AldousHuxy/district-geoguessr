import { type VariantProps, cva } from 'class-variance-authority';
import cn from '@/utils/cn';
import type { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

const button = cva(
  'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-bright-yellow text-dark-blue hover:brightness-110 active:scale-95',
        secondary:
          'bg-medium-blue text-dark-blue hover:brightness-110 active:scale-95',
        ghost:
          'bg-transparent text-sky-blue border border-sky-blue hover:bg-sky-blue/10 active:scale-95',
        success:
          'bg-soft-green text-dark-blue hover:brightness-110 active:scale-95',
        purple:
          'bg-deep-purple text-light-purple border border-light-purple/30 hover:brightness-125 active:scale-95',
        dark:
          'bg-dark-blue-100 text-sky-blue border border-sky-blue/20 hover:border-sky-blue/60 active:scale-95',
      },
      size: {
        sm: 'text-sm px-3 py-1.5 gap-1.5',
        md: 'text-base px-5 py-2.5 gap-2',
        lg: 'text-lg px-7 py-3.5 gap-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & {
    to?: string;
  };

const Button = ({ className, variant, size, to, ...props }: ButtonProps) => {
  const classes = cn(button({ variant, size }), className);

  if (to) {
    return <Link to={to} className={classes}>{props.children}</Link>;
  }

  return <button className={classes} {...props} />;
};

export default Button;