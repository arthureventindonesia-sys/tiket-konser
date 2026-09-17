#!/usr/bin/env bash
# Instalasi Golden Satya Fair di Ubuntu 24.04 (VPS Rumahweb).
# Jalankan sebagai root:  sudo bash deploy/install-vps.sh
set -euo pipefail

DOMAIN="${DOMAIN:-goldensatyafair.com}"
APP_DIR="${APP_DIR:-/var/www/goldensatyafair}"
APP_USER="${APP_USER:-gsf}"
REPO="${REPO:-https://github.com/arthureventindonesia-sys/tiket-konser.git}"
DB_NAME="${DB_NAME:-gsf}"
DB_USER="${DB_USER:-gsf}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Jalankan sebagai root: sudo bash deploy/install-vps.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl git nginx postgresql postgresql-contrib ufw

if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt 22 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

id -u "$APP_USER" >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin "$APP_USER"

mkdir -p /var/www
if [[ -d "$APP_DIR/.git" ]]; then
  git -C "$APP_DIR" fetch origin
  git -C "$APP_DIR" reset --hard origin/main
else
  rm -rf "$APP_DIR"
  git clone "$REPO" "$APP_DIR"
fi
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
  DB_PASS="$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)"
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL
else
  if [[ -f "$APP_DIR/.env" ]]; then
    DB_PASS="$(grep -oP 'DATABASE_URL=postgresql://[^:]+:\K[^@]+' "$APP_DIR/.env" || true)"
  fi
  DB_PASS="${DB_PASS:-$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)}"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
  sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
    || sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
fi

cat > "$APP_DIR/.env" <<EOF
NODE_ENV=production
HOST=127.0.0.1
PORT=3000
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}
EOF
chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

install -m 600 /dev/null /root/gsf-credentials.txt
cat > /root/gsf-credentials.txt <<EOF
Domain: https://${DOMAIN}
Database user: ${DB_USER}
Database password: ${DB_PASS}
Admin panel: https://${DOMAIN}/login
Username: iang
Password: \$Golden
EOF
chmod 600 /root/gsf-credentials.txt

cd "$APP_DIR"
sudo -u "$APP_USER" npm ci
sudo -u "$APP_USER" env NITRO_PRESET=node-server DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}" npm run build:vps

install -m 644 "$APP_DIR/deploy/gsf.service" /etc/systemd/system/gsf.service
sed -i "s|/var/www/goldensatyafair|${APP_DIR}|g" /etc/systemd/system/gsf.service
systemctl daemon-reload
systemctl enable --now gsf

install -m 644 "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/goldensatyafair
sed -i "s/goldensatyafair.com/${DOMAIN}/g" /etc/nginx/sites-available/goldensatyafair
ln -sfn /etc/nginx/sites-available/goldensatyafair /etc/nginx/sites-enabled/goldensatyafair
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable || true

echo
echo "Aplikasi sudah jalan di http://${DOMAIN} (setelah DNS A record mengarah ke IP VPS)."
echo "SSL: sudo apt-get install -y certbot python3-certbot-nginx && sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "Kredensial database: /root/gsf-credentials.txt"
echo "Update nanti: sudo bash ${APP_DIR}/deploy/update.sh"
