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

cd "$APP_DIR"
git fetch origin
git reset --hard origin/main
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
# jaga .env agar tidak tertimpa (tidak ada di git)
sudo -u "$APP_USER" npm ci
set -a
# shellcheck disable=SC1091
source "$APP_DIR/.env"
set +a
sudo -u "$APP_USER" env NITRO_PRESET=node-server DATABASE_URL="$DATABASE_URL" npm run build:vps
systemctl restart gsf
systemctl reload nginx
echo "Update selesai."
