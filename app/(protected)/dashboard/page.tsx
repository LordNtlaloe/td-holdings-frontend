"use client"

import { UserInfo } from '@/components/general/user-info'
import React from 'react'
import { useAuth } from '@/contexts/auth-context'

export default function Dashboard() {
    const user = useAuth()
    return (
        <div>
           <div>{user.user?.role}</div>
        </div>
    )
}
