'use client'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { ChitFormData } from '@/schemas/chit'
import { deleteChit, updateChit } from '@/services/chits'
import type { ChitWithPayments } from '@/types/database'
import { useQueryClient } from '@tanstack/react-query'
import { Copy, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { ChitForm } from './ChitForm'
import { DuplicateChitModal } from './DuplicateChitModal'
import { invalidateChitQueries } from '@/lib/invalidate-chit-queries'

interface ChitDetailToolbarProps {
  chit: ChitWithPayments
  canWrite: boolean
  canDelete: boolean
}

export function ChitDetailToolbar({
  chit,
  canWrite,
  canDelete,
}: ChitDetailToolbarProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function invalidateLists() {
    await invalidateChitQueries(queryClient, {
      chitId: chit.id,
      personId: chit.person_id,
    })
  }

  async function handleUpdate(form: ChitFormData) {
    await updateChit(chit.id, { ...form, type: chit.type })
    toast.success('Chit updated')
    setEditOpen(false)
    await invalidateLists()
  }

  async function handleConfirmDelete() {
    try {
      setIsDeleting(true)
      await deleteChit(chit.id)
      toast.success('Chit removed')
      setDeleteOpen(false)
      await invalidateLists()
      router.push('/chits')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete chit')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!canWrite && !canDelete) return null

  return (
    <>
      <span className="mr-2 hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-muted sm:inline">
        Manage
      </span>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {canWrite ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="border-border/80 bg-card"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDuplicateOpen(true)}
              className="border-border/80 bg-card"
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>
          </>
        ) : null}
        {canDelete ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        ) : null}
      </div>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit chit"
        className="max-w-lg"
      >
        <ChitForm
          key={`${chit.id}-${chit.updated_at}`}
          mode="edit"
          initialChit={{
            person_id: chit.person_id,
            type: chit.type,
            category: chit.category,
            start_date: chit.start_date,
            end_date: chit.end_date,
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <DuplicateChitModal
        chit={chit}
        isOpen={duplicateOpen}
        onClose={() => setDuplicateOpen(false)}
        onDuplicated={async (newChit) => {
          toast.success('Chit duplicated')
          setDuplicateOpen(false)
          await invalidateChitQueries(queryClient, { personId: newChit.person_id })
          router.push(`/chits/${newChit.id}`)
        }}
      />

      <Modal
        isOpen={deleteOpen}
        onClose={() => !isDeleting && setDeleteOpen(false)}
        title="Delete chit?"
      >
        <p className="text-sm leading-relaxed text-muted">
          Deleting removes this chit and all installment records permanently.
          This cannot be undone.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="flex-1 sm:flex-none"
            disabled={isDeleting}
            onClick={() => setDeleteOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1 sm:flex-none"
            isLoading={isDeleting}
            onClick={handleConfirmDelete}
          >
            Delete permanently
          </Button>
        </div>
      </Modal>
    </>
  )
}
