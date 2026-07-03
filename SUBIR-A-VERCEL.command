#!/bin/bash
cd ~/Desktop/allgotravel-app
if [ -f .git/index.lock ]; then
  rm -f .git/index.lock
fi
echo "Subiendo cambios a Vercel..."
git add -A
git commit -m "fix: splash loop, botones anuales a Hotmart, sin Gumroad"
git push origin main
echo ""
echo "✅ Listo! Vercel va a redesplegar en 1-2 minutos."
echo "Presiona cualquier tecla para cerrar..."
read
