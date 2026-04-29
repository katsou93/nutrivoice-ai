#!/bin/bash
# NutriVoice AI - Setup Script
# Führe dieses Script im Hauptordner aus: bash setup.sh

echo "🚀 NutriVoice AI Setup"
echo "======================"

# Web App
echo ""
echo "📦 Installiere Web-App Dependencies..."
cd apps/web
npm install
echo "✅ Web-App fertig"

# Mobile App
echo ""
echo "📱 Installiere Mobile-App Dependencies..."
cd ../mobile
npm install
echo "✅ Mobile-App fertig"

cd ../..

echo ""
echo "=============================="
echo "✅ Setup abgeschlossen!"
echo ""
echo "🌐 Web starten:     cd apps/web && npm run dev"
echo "   Dann öffne:      http://localhost:3000"
echo ""
echo "📱 Mobile starten:  cd apps/mobile && npx expo start"
echo "   Dann scanne den QR-Code mit der Expo Go App"
echo ""
echo "🔑 Vergiss nicht deinen Anthropic API Key"
echo "   beim ersten Start einzugeben!"
echo "=============================="
