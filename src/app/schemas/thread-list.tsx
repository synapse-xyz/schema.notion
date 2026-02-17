'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { PATHS } from '@/constants/paths'
import type { Thread } from '@/db/schema'
import { deleteThread } from '@/lib/thread'
import { getRelativeTime } from '@/utils/get-relative-time'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ThreadWithTitle extends Thread {
  dbTitle: string
}

export function ThreadList({ threads }: { threads: ThreadWithTitle[] }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentThreadToDelete, setCurrentThreadToDelete] =
    useState<ThreadWithTitle | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  if (!threads.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No tienes chats todavía</h3>
        <p className="text-muted-foreground mt-1">
          Inicia una nueva conversación para crear tu esquema de base de datos
        </p>
        <Link href={PATHS.CHAT} className="mt-4 inline-block">
          <Button>Iniciar nuevo chat</Button>
        </Link>
      </div>
    )
  }

  const handleDeleteClick = (e: React.MouseEvent, thread: ThreadWithTitle) => {
    e.preventDefault()
    setCurrentThreadToDelete(thread)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (currentThreadToDelete?.chatId) {
      setIsDeleting(true)
      try {
        await deleteThread(currentThreadToDelete.chatId)
        router.refresh()
      } catch (error) {
        console.error('Failed to delete thread:', error)
      } finally {
        setIsDeleting(false)
        setShowDeleteModal(false)
        setCurrentThreadToDelete(null)
      }
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {threads.map((thread) => (
          <div key={thread.chatId} className="relative group">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => handleDeleteClick(e, thread)}
              type="button"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
            <Link href={`${PATHS.CHAT}/${thread.chatId}`} className="block">
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle className="line-clamp-1">
                    {thread.dbTitle}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Last updated:{' '}
                    {getRelativeTime(thread.updatedAt.toISOString())}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {thread.conversation?.at(-1)?.message}
                  </p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  {thread.updatedAt.toLocaleDateString()} at{' '}
                  {thread.updatedAt.toLocaleTimeString()}
                </CardFooter>
              </Card>
            </Link>
          </div>
        ))}
      </div>
      {currentThreadToDelete && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="¿Quieres eliminar este Chat?"
          description={`Esta acción no se puede deshacer. Esto eliminará permanentemente el chat "${currentThreadToDelete.dbTitle}".`}
          confirmText="Eliminar"
          isLoading={isDeleting}
        />
      )}
    </>
  )
}
