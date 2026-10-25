#!/bin/bash
# ═══════════════════════════════════════════════
# Smart Planner — VPS Setup Script
# Ubuntu 22.04 / 24.04
# ═══════════════════════════════════════════════
# استفاده:
#   curl -fsSL https://raw.githubusercontent.com/.../setup-vps.sh | sudo bash
# یا:
#   sudo bash setup-vps.sh
# ═══════════════════════════════════════════════

set -euo pipefail

DOMAIN="${DOMAIN:-planner.example.com}"
APP_DIR="/var/www/smart-planner"
REPO_URL="${REPO_URL:-https://github.com/AliBabaei-i/smart-planner.git}"

echo "═══════════════════════════════════════════════"
echo "🚀 Smart Planner VPS Setup"
echo "Domain: $DOMAIN"
echo "Dir: $APP_DIR"
echo "═══════════════════════════════════════════════"

# ─── ۱. Update سیستم ───
echo "📦 [1/8] Updating system..."
apt-get update -qq
apt-get upgrade -y -qq

# ─── ۲. نصب پیش‌نیازها ───
echo "📦 [2/8] Installing prerequisites..."
apt-get install -y -qq nginx git curl ufw fail2ban

# ─── ۳. Node.js 20 ───
if ! command -v node &> /dev/null; then
  echo "📦 [3/8] Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
node --version

# ─── ۴. PM2 ───
if ! command -v pm2 &> /dev/null; then
  echo "📦 [4/8] Installing PM2..."
  npm install -g pm2
fi
pm2 --version

# ─── ۵. کلون پروژه ───
echo "📦 [5/8] Cloning project..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"

if [ -d ".git" ]; then
  git pull origin main
else
  git clone "$REPO_URL" .
fi

# ─── ۶. نصب dependencyها و build ───
echo "📦 [6/8] Installing dependencies..."

# Frontend
cd "$APP_DIR/frontend"
npm ci
npm run build

# Backend
cd "$APP_DIR/backend"
if [ ! -f ".env" ]; then
  echo "⚠️  .env not found. Copying from .env.example..."
  cp .env.example .env
  echo "❌ لطفاً $APP_DIR/backend/.env را ویرایش کن (JWT_SECRET و CORS_ORIGIN) و سپس دوباره اجرا کن."
  exit 1
fi
npm ci
mkdir -p logs data
node src/db/migrate.js
node src/db/migrate-sessions.js || true

# ─── ۷. PM2 start ───
echo "📦 [7/8] Starting backend with PM2..."
cd "$APP_DIR/backend"
pm2 delete smart-planner-backend 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root

# ─── ۸. Nginx ───
echo "📦 [8/8] Configuring Nginx..."
sed "s/planner\.example\.com/$DOMAIN/g" "$APP_DIR/deploy/nginx.conf" \
  > /etc/nginx/sites-available/smart-planner
ln -sf /etc/nginx/sites-available/smart-planner /etc/nginx/sites-enabled/smart-planner
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# ─── Firewall ───
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ─── SSL (بعد از DNS) ───
if command -v certbot &> /dev/null; then
  echo "🔐 Let's Encrypt already installed"
else
  echo "🔐 Installing Certbot..."
  apt-get install -y -qq certbot python3-certbot-nginx
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "✅ Setup complete!"
echo "═══════════════════════════════════════════════"
echo ""
echo "📋 Next steps:"
echo "  1. DNS: مطمئن شو A record دامنه به این IP اشاره می‌کند:"
echo "     $DOMAIN → $(curl -s ifconfig.me)"
echo ""
echo "  2. SSL: بعد از DNS، اجرا کن:"
echo "     sudo certbot --nginx -d $DOMAIN"
echo ""
echo "  3. بررسی:"
echo "     pm2 status"
echo "     pm2 logs smart-planner-backend --lines 30"
echo "     curl -I https://$DOMAIN"
echo ""
echo "  4. Backup خودکار (اختیاری):"
echo "     sudo crontab -e"
echo "     → 0 3 * * * cp $APP_DIR/backend/data/smart-planner.db /var/backups/db-\$(date +\\%F).db"
echo ""