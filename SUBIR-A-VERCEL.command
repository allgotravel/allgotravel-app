#!/bin/bash
cd ~/Desktop/allgotravel-app
rm -f .git/index.lock .git/HEAD.lock .git/MERGE_HEAD.lock .git/objects/maintenance.lock 2>/dev/null
echo "Subiendo cambios a Vercel..."
git add -A
git commit -m "fix: ícono PWA con Travel completo, links plataformas reservas"
git push origin main
echo ""
echo "✅ Listo! Vercel va a redesplegar en 1-2 minutos."
echo "Presiona cualquier tecla para cerrar..."
read
