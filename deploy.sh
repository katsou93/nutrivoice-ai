#!/bin/bash
# ============================================================
# NutriVoice AI – Deploy zu GitHub + Vercel
# Einfach ausführen: bash deploy.sh
# ============================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${GREEN}🚀 NutriVoice AI – Auto Deploy${NC}"
echo "================================="
echo ""

# ── Hilfsfunktionen ─────────────────────────────────────────
check_command() {
  command -v "$1" &>/dev/null
}

install_if_missing() {
  local cmd=$1
  local install_cmd=$2
  if ! check_command "$cmd"; then
    echo -e "${YELLOW}⚙️  Installiere $cmd...${NC}"
    eval "$install_cmd"
    echo -e "${GREEN}✅ $cmd installiert${NC}"
  else
    echo -e "${GREEN}✅ $cmd bereits vorhanden${NC}"
  fi
}

# ── 1. Voraussetzungen prüfen & installieren ─────────────────
echo -e "${BLUE}[1/5] Prüfe Voraussetzungen...${NC}"

# Node.js
if ! check_command node; then
  echo -e "${RED}❌ Node.js nicht gefunden. Bitte installieren: https://nodejs.org${NC}"
  exit 1
fi

# Git
if ! check_command git; then
  echo -e "${RED}❌ Git nicht gefunden. Bitte installieren: https://git-scm.com${NC}"
  exit 1
fi

# GitHub CLI
install_if_missing "gh" "$(cat <<'INSTALL'
if [[ "$OSTYPE" == "darwin"* ]]; then
  brew install gh
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
  sudo apt update && sudo apt install gh -y
else
  echo "Bitte GitHub CLI manuell installieren: https://cli.github.com"
  exit 1
fi
INSTALL
)"

# Vercel CLI
install_if_missing "vercel" "npm install -g vercel"

# ── 2. GitHub Login & Repo erstellen ────────────────────────
echo ""
echo -e "${BLUE}[2/5] GitHub Setup...${NC}"

if ! gh auth status &>/dev/null; then
  echo -e "${YELLOW}Bitte bei GitHub einloggen:${NC}"
  gh auth login
fi

echo -e "${GREEN}✅ GitHub eingeloggt als: $(gh api user -q .login)${NC}"

# ── 3. Git Repo initialisieren ──────────────────────────────
echo ""
echo -e "${BLUE}[3/5] Git Repository initialisieren...${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# .gitignore erstellen
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Next.js
apps/web/.next/
apps/web/out/

# Expo
apps/mobile/.expo/
apps/mobile/dist/

# Environment
.env
.env.local
.env.*.local

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Build
build/
dist/
EOF

# Git init falls nötig
if [ ! -d ".git" ]; then
  git init
  echo -e "${GREEN}✅ Git initialisiert${NC}"
fi

git add -A
git commit -m "🚀 Initial commit – NutriVoice AI" --allow-empty 2>/dev/null || git commit -m "🚀 Initial commit – NutriVoice AI"

# GitHub Repo erstellen und pushen
REPO_NAME="nutrivoice-ai"
GITHUB_USER=$(gh api user -q .login)

echo -e "${YELLOW}Erstelle GitHub Repo: ${GITHUB_USER}/${REPO_NAME}${NC}"

# Prüfen ob Repo schon existiert
if gh repo view "${GITHUB_USER}/${REPO_NAME}" &>/dev/null; then
  echo -e "${YELLOW}⚠️  Repo existiert bereits – nutze vorhandenes${NC}"
else
  gh repo create "${REPO_NAME}" \
    --public \
    --description "🎙️ KI-basierter Kalorienzähler per Sprache – powered by Claude AI" \
    --source=. \
    --remote=origin \
    --push
  echo -e "${GREEN}✅ GitHub Repo erstellt: https://github.com/${GITHUB_USER}/${REPO_NAME}${NC}"
fi

# Falls Repo schon existiert, remote setzen und pushen
if ! git remote get-url origin &>/dev/null; then
  git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
fi

git branch -M main
git push -u origin main --force

echo -e "${GREEN}✅ Code auf GitHub gepusht!${NC}"
echo -e "   🔗 https://github.com/${GITHUB_USER}/${REPO_NAME}"

# ── 4. Vercel deployen ───────────────────────────────────────
echo ""
echo -e "${BLUE}[4/5] Vercel Deployment...${NC}"

if ! vercel whoami &>/dev/null; then
  echo -e "${YELLOW}Bitte bei Vercel einloggen:${NC}"
  vercel login
fi

echo -e "${GREEN}✅ Vercel eingeloggt${NC}"

# Vercel config für Next.js (monorepo)
cat > vercel.json << 'EOF'
{
  "version": 2,
  "buildCommand": "cd apps/web && npm install && npm run build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "rootDirectory": "apps/web"
}
EOF

git add vercel.json
git commit -m "⚙️ Add Vercel config" --allow-empty 2>/dev/null || true
git push origin main --force 2>/dev/null || true

# Deploy zu Vercel
echo -e "${YELLOW}Deploye zu Vercel...${NC}"
VERCEL_OUTPUT=$(vercel --prod --yes --name "${REPO_NAME}" 2>&1)
VERCEL_URL=$(echo "$VERCEL_OUTPUT" | grep -o 'https://[^ ]*\.vercel\.app' | head -1)

echo -e "${GREEN}✅ Vercel Deployment fertig!${NC}"
if [ -n "$VERCEL_URL" ]; then
  echo -e "   🌐 ${VERCEL_URL}"
fi

# ── 5. Fertig ────────────────────────────────────────────────
echo ""
echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}🎉 Deploy erfolgreich!${NC}"
echo ""
echo -e "📦 GitHub:  https://github.com/${GITHUB_USER}/${REPO_NAME}"
if [ -n "$VERCEL_URL" ]; then
  echo -e "🌐 Vercel:  ${VERCEL_URL}"
fi
echo ""
echo -e "${YELLOW}💡 Tipp: Für zukünftige Updates einfach:${NC}"
echo -e "   git add -A && git commit -m 'Update' && git push"
echo -e "   → Vercel deployed automatisch bei jedem Push!"
echo -e "${GREEN}=================================${NC}"
echo ""
