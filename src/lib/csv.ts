import type { Bonnetje, Student } from '@/types'
import { formatCents } from '@/lib/money'

function escapeCsv(value: string): string {
  if (/[",;\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function receiptsToCsv(receipts: Bonnetje[], students: Record<string, Student>): string {
  const header = ['Leerling', 'Klas', 'Datum', 'Tijd', 'Omschrijving', 'Categorie', 'Bedrag', 'Status']
  const rows = receipts.map((r) => {
    const student = students[r.studentId]
    return [
      student?.naam ?? '',
      student?.klas ?? '',
      r.datum,
      r.tijdstip.slice(11, 16),
      r.titel,
      r.categorie ?? 'onvolledig',
      formatCents(r.bedragCents).replace('€', ''),
      r.pending ? 'wacht op upload' : 'bewaard'
    ]
  })
  return [header, ...rows].map((row) => row.map(escapeCsv).join(';')).join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
