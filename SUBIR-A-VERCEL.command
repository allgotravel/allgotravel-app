#!/bin/bash
cd ~/Desktop/allgotravel-app

# Eliminar archivo de bloqueo si existe
if [ -f .git/index.lock ]; then
  echo "Eliminando archivo de bloqueo..."
  rm -f .git/index.lock
fi

echo "Subiendo cambios a Vercel..."
git add -A
git commit -m "fix: language switcher visible con banderas, splash glow, activar cuentas"
git push origin main
echo ""
echo "✅ Listo! Vercel va a redesplegar en 1-2 minutos."
echo "Presiona cualquier tecla para cerrar..."
read
