import { NextResponse } from 'next/server'

// Gumroad ya no se usa. El webhook queda apagado: no verifica nada y antes permitía
// activar una membresía con solo enviar un correo. Responde 410 (Gone) a todo.
function gone() {
  return NextResponse.json({ error: 'gone' }, { status: 410 })
}

export const GET = gone
export const POST = gone
export const PUT = gone
export const PATCH = gone
export const DELETE = gone
