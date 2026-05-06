"use client"

import { useRouter } from 'next/navigation'
import ProfileScreen from '@/components/ProfileScreen'
import { signOutDoctor } from '@/services/doctorRepo'

export default function ProfilePage() {
  const router = useRouter()

  return (
    <ProfileScreen
      onBack={() => router.push('/')}
      onSignOut={async () => {
        await signOutDoctor()
        router.replace('/login')
      }}
    />
  )
}
