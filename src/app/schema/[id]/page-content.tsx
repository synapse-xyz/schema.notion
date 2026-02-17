'use client'

import type { Thread } from '@/db/schema'

import { useEffect } from 'react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ChevronUp } from 'lucide-react'

import { useChatStore } from '@/stores/chat'
import Chat from '../sections/chat-panel'
import DiagramPanel from '../sections/diagram-panel'
import SchemaPanel from '../sections/schema-panel'

type PageContentProps = {
  thread: Thread | null
  chatId: string
}

export default function PageContent({ thread, chatId }: PageContentProps) {
  const [panels, setPanels] = useState<{ [panel: string]: boolean }>({
    chat: true,
    schema: false,
  })

  const { loadChatThread, chatId: storeChatId } = useChatStore()

  // biome-ignore lint/correctness/useExhaustiveDependencies: no need
  useEffect(() => {
    if (chatId) {
      if (
        chatId !== storeChatId ||
        useChatStore.getState().chatHistory === null
      ) {
        loadChatThread(chatId, thread)
      }
    }
  }, [chatId, loadChatThread, storeChatId])

  const togglePanel = (panel: string) => {
    setPanels((prev) => ({
      ...prev,
      [panel]: !prev[panel],
    }))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {panels.chat && (
            <>
              <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                <Chat hidePanel={() => togglePanel('chat')} />
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          <ResizablePanel defaultSize={70}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70} minSize={30}>
                <DiagramPanel
                  chatPanelIsShown={panels.chat}
                  toggleChatPanel={(show) =>
                    setPanels((prev) => ({ ...prev, chat: show }))
                  }
                />
              </ResizablePanel>

              {panels.schema && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={30} minSize={20}>
                    <SchemaPanel hidePanel={() => togglePanel('schema')} />
                  </ResizablePanel>
                </>
              )}

              {!panels.schema && (
                <div className="border-t p-2 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePanel('schema')}
                    aria-label="Mostrar Espacio 1"
                    className="w-full bg-neutral-100 dark:bg-neutral-900"
                  >
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Schemas
                  </Button>
                </div>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
