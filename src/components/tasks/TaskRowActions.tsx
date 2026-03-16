import { Archive, MoreHorizontal, PencilLine, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Task } from '../../types/models.ts'

type TaskRowActionsProps = {
  disabled?: boolean
  onDelete: (task: Task) => void
  onEdit: (task: Task) => void
  onToggleArchive: (task: Task) => Promise<void> | void
  task: Task
}

export function TaskRowActions({
  disabled = false,
  onDelete,
  onEdit,
  onToggleArchive,
  task,
}: TaskRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0, openUpward: false })
  const containerRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const updateMenuPosition = () => {
    if (!buttonRef.current) {
      return
    }

    const buttonRect = buttonRef.current.getBoundingClientRect()
    const menuWidth = menuRef.current?.offsetWidth ?? 208
    const menuHeight = menuRef.current?.offsetHeight ?? 156
    const viewportPadding = 12
    const gap = 8
    const spaceBelow = window.innerHeight - buttonRect.bottom - viewportPadding
    const spaceAbove = buttonRect.top - viewportPadding
    const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow

    const nextLeft = Math.min(
      window.innerWidth - menuWidth - viewportPadding,
      Math.max(viewportPadding, buttonRect.right - menuWidth),
    )
    const nextTop = openUpward
      ? Math.max(viewportPadding, buttonRect.top - menuHeight - gap)
      : Math.min(window.innerHeight - menuHeight - viewportPadding, buttonRect.bottom + gap)

    setMenuPosition({
      left: nextLeft,
      top: nextTop,
      openUpward,
    })
  }

  useLayoutEffect(() => {
    if (!isOpen) {
      return
    }

    updateMenuPosition()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node

      if (
        !containerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const handleViewportChange = () => {
      updateMenuPosition()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleViewportChange)
    document.addEventListener('scroll', handleViewportChange, true)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleViewportChange)
      document.removeEventListener('scroll', handleViewportChange, true)
    }
  }, [isOpen])

  const handleSelect = (callback: (task: Task) => void | Promise<void>) => {
    setIsOpen(false)
    void callback(task)
  }

  const archiveLabel = task.status === 'Archived' ? 'Restore to pending' : 'Archive task'
  const ArchiveIcon = task.status === 'Archived' ? RotateCcw : Archive

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-label={`Open actions for ${task.title}`}
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-[1.1rem] border border-[#4D00EE]/20 bg-[#122F45]/40 text-[#c3d0e2] shadow-[0_10px_18px_rgba(0,0,0,0.22)] transition duration-200 hover:bg-[#122F45]/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen
        ? createPortal(
            <div
              ref={menuRef}
              className="clay-surface fixed z-[70] flex w-52 flex-col gap-1 rounded-[1.4rem] p-2.5 shadow-[0_20px_36px_rgba(0,0,0,0.34)]"
              style={{
                left: `${menuPosition.left}px`,
                top: `${menuPosition.top}px`,
                transformOrigin: menuPosition.openUpward ? 'bottom right' : 'top right',
              }}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleSelect(onEdit)}
                className="flex items-center gap-2.5 rounded-[1rem] px-3 py-2.5 text-left text-sm text-[#eef4ff] transition duration-200 hover:bg-[#122F45]/34 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PencilLine className="h-4 w-4 text-[#d5c6ff]" />
                Edit task
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleSelect(onToggleArchive)}
                className="flex items-center gap-2.5 rounded-[1rem] px-3 py-2.5 text-left text-sm text-[#eef4ff] transition duration-200 hover:bg-[#122F45]/34 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArchiveIcon className="h-4 w-4 text-[#d5c6ff]" />
                {archiveLabel}
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleSelect(onDelete)}
                className="flex items-center gap-2.5 rounded-[1rem] px-3 py-2.5 text-left text-sm text-[#eef4ff] transition duration-200 hover:bg-[#122F45]/34 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4 text-[#D8FF00]" />
                Delete permanently
              </button>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
