#!/bin/bash
cd ~/Desktop/allgotravel-app

echo "🔧 Preparando cambios..."
rm -f .git/index.lock .git/HEAD.lock .git/MERGE_HEAD.lock .git/objects/maintenance.lock 2>/dev/null

git add -A

# Solo hace commit si hay cambios nuevos
if git diff --cached --quiet; then
  echo "ℹ️  No hay cambios nuevos que subir."
else
  git commit -m "feat: actualización AllGo Travel $(date '+%Y-%m-%d %H:%M')"
  echo "✅ Commit creado."
fi

echo ""
echo "⬆️  Subiendo a GitHub..."
if git push origin main; then
  echo ""
  echo "✅ ¡Subido a GitHub exitosamente!"
  echo "⏳ Vercel va a redesplegar en 1-2 minutos."
  echo "🔗 Revisa: https://vercel.com/allgotravel"
else
  echo ""
  echo "❌ ERROR: No se pudo subir a GitHub."
  echo "   Verifica tu conexión a internet e intenta de nuevo."
fi

echo ""
echo "Presiona cualquier tecla para cerrar..."
read
