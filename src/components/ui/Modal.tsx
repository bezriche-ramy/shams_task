import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { cn } from '../../lib/cn.ts'

type ModalProps = {
  children: ReactNode
  description?: ReactNode
  footer?: ReactNode
  onClose: () => void
  open: boolean
  size?: 'md' | 'lg'
  title: ReactNode
  closeDisabled?: boolean
}

const sizeClasses = {
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
}

export function Modal({
  children,
  closeDisabled = false,
  description,
  footer,
  onClose,
  open,
  size = 'md',
  title,
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !closeDisabled) {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeDisabled, onClose, open])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-[#02050d]/78 backdrop-blur-md"
        onClick={() => {
          if (!closeDisabled) {
            onClose()
          }
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'clay-shell relative z-10 max-h-[calc(100vh-2rem)] w-full overflow-hidden rounded-[2rem]',
          sizeClasses[size],
        )}
      >
        <div className="clay-scroll max-h-[calc(100vh-2rem)] overflow-y-auto p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="display-font text-[1.85rem] leading-[1] font-semibold tracking-[-0.03em] text-[#eef4ff]">
                {title}
              </h2>
              {description ? (
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#b8c7da]">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Close modal"
              disabled={closeDisabled}
              onClick={onClose}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.2rem] border border-[#4D00EE]/20 bg-[#122F45]/38 text-[#c3d0e2] shadow-[0_12px_20px_rgba(0,0,0,0.26)] transition duration-200 hover:bg-[#122F45]/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6">{children}</div>

          {footer ? <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div> : null}
        </div>
      </div>
    </div>
  )
}
