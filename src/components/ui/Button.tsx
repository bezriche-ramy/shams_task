import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn.ts'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'clay-button bg-[linear-gradient(145deg,#214761,#4D00EE)] text-[#D8FF00] shadow-[0_12px_24px_rgba(77,0,238,0.3)] hover:shadow-[0_14px_28px_rgba(77,0,238,0.36)]',
  secondary:
    'clay-button bg-[linear-gradient(145deg,#13253d,#0b1525)] text-[#eef4ff] hover:bg-[linear-gradient(145deg,#17304a,#0d1829)]',
  accent:
    'clay-button bg-[linear-gradient(145deg,#efff78,#D8FF00)] text-[#122F45] shadow-[0_12px_24px_rgba(216,255,0,0.28)] hover:shadow-[0_14px_28px_rgba(216,255,0,0.36)]',
  ghost:
    'border border-[#4D00EE]/24 bg-[#122F45]/40 text-[#eef4ff] shadow-[0_8px_20px_rgba(0,0,0,0.22)] backdrop-blur-md hover:bg-[#122F45]/56',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'min-h-10 rounded-[1.1rem] px-4 text-sm',
  md: 'min-h-12 rounded-[1.25rem] px-5 text-sm',
  lg: 'min-h-14 rounded-[1.5rem] px-6 text-base',
}

export function Button({
  children,
  className,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold tracking-[0.01em] text-balance outline-none transition duration-200 focus-visible:ring-4 focus-visible:ring-[#4D00EE]/30 disabled:pointer-events-none disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
