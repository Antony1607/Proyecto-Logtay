'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import ReporteDiferencias from './ReporteDiferencias'

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ReporteDiferencias />
    </Suspense>
  )
}