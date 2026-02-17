import { getCurrentUser } from '@/lib/auth'
import { getThread } from '@/lib/thread'
import { redirect } from 'next/navigation'
import PageContent from './page-content'

type PageProps = { params: Promise<{ id: string }> }

export default async function Schema({ params }: PageProps) {
  const { id: chatId } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const thread = await getThread(chatId)

  if (thread && thread.userId !== user.id) {
    redirect('/schemas')
  }

  return <PageContent thread={thread} chatId={chatId} />
}
