'use client'

import { Button } from '@/components/ui/button'
import { logout } from '@/lib/auth'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const handleLogout = async () => {
    await logout()
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
    >
      <LogOut className="h-5 w-5" />
    </Button>
  )
}
