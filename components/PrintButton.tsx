'use client'

interface PrintButtonProps {
  label?: string
}

export default function PrintButton({ label = 'Imprimir / Save as PDF' }: PrintButtonProps) {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 bg-[#1B6FB5] hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow"
    >
      🖨️ {label}
    </button>
  )
}
