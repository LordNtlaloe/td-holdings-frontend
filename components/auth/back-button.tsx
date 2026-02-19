"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
    label: string
    link: string
}

export default function BackButton({ label, link }: BackButtonProps) {
    return (
        <Button
            variant="link"
            className="font-normal w-full"
            size="sm"
            asChild
        >
            <Link href={link} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {label}
            </Link>
        </Button>
    )
}