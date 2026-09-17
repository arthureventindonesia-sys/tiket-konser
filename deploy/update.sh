#!/usr/bin/env bash
# Update kode dari GitHub lalu rebuild.
# Jalankan sebagai root:  sudo bash /var/www/goldensatyafair/deploy/update.sh
set -euo pipefail
APP_DIR="${APP_DIR:-/var/www/goldensatyafair}"
APP_USER="${APP_USER:-gsf}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Jalankan sebagai root: sudo bash $0"
  exit 1
fi

git config --global --add safe.directory "$APP_DIR"

cd "$APP_DIR"
# simpan .env agar tidak hilang
if [[ -f .env ]]; then
  cp -a .env /tmp/gsf.env.bak
fi
git fetch origin
git reset --hard origin/main
if [[ -f /tmp/gsf.env.bak ]]; then
  cp -a /tmp/gsf.env.bak .env
  rm -f /tmp/gsf.env.bak
fi
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
chmod 600 "$APP_DIR/.env" 2>/dev/null || true

sudo -u "$APP_USER" npm ci
set -a
# shellcheck disable=SC1091
source "$APP_DIR/.env"
set +a
sudo -u "$APP_USER" env NITRO_PRESET=node-server DATABASE_URL="$DATABASE_URL" npm run build:vps
systemctl restart gsf
systemctl reload nginx
echo "Update selesai."
