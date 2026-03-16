import { ChevronDown, type LucideIcon } from 'lucide-react'
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '../../lib/cn.ts'

type SharedFieldProps = {
  className?: string
  fieldSize?: 'sm' | 'md'
  icon?: LucideIcon
}

type LabelProps = {
  children: ReactNode
  className?: string
  htmlFor?: string
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & SharedFieldProps
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & SharedFieldProps
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & SharedFieldProps

const sizeClasses = {
  sm: {
    field: 'min-h-11 rounded-[1.2rem] px-4 py-2.5 text-sm leading-6',
    withIcon: 'pl-11',
    icon: 'left-3.5 h-4 w-4',
  },
  md: {
    field: 'min-h-[3.5rem] rounded-[1.45rem] px-4 py-3 text-sm leading-6',
    withIcon: 'pl-12',
    icon: 'left-4 h-4 w-4',
  },
}

function FieldIcon({
  icon: Icon,
  fieldSize,
}: {
  icon?: LucideIcon
  fieldSize: NonNullable<SharedFieldProps['fieldSize']>
}) {
  if (!Icon) {
    return null
  }

  return (
    <Icon
      className={cn(
        'pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#8fa4bf]',
        sizeClasses[fieldSize].icon,
      )}
    />
  )
}

export function FieldLabel({ children, className, htmlFor }: LabelProps) {
  return (
    <label
      className={cn(
        'mb-3 block text-sm font-semibold tracking-[0.01em] text-[#c3d0e2]',
        className,
      )}
      htmlFor={htmlFor}
    >
      {children}
    </label>
  )
}

export function Input({ className, fieldSize = 'md', icon, ...props }: InputProps) {
  return (
    <div className="relative">
      <FieldIcon icon={icon} fieldSize={fieldSize} />
      <input
        className={cn(
          'clay-input w-full border-0 text-[#eef4ff] placeholder:text-[#8fa4bf] disabled:text-[#8fa4bf]',
          sizeClasses[fieldSize].field,
          icon && sizeClasses[fieldSize].withIcon,
          className,
        )}
        {...props}
      />
    </div>
  )
}

export function Select({ children, className, fieldSize = 'md', icon, ...props }: SelectProps) {
  return (
    <div className="relative">
      <FieldIcon icon={icon} fieldSize={fieldSize} />
      <select
        className={cn(
          'clay-input w-full appearance-none border-0 pr-11 text-[#eef4ff] disabled:text-[#8fa4bf]',
          sizeClasses[fieldSize].field,
          icon && sizeClasses[fieldSize].withIcon,
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa4bf]" />
    </div>
  )
}

export function Textarea({ className, fieldSize = 'md', ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'clay-input min-h-36 w-full border-0 resize-none text-[#eef4ff] placeholder:text-[#8fa4bf] disabled:text-[#8fa4bf]',
        sizeClasses[fieldSize].field,
        className,
      )}
      {...props}
    />
  )
}
