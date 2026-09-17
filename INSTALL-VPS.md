# Instalasi VPS — Golden Satya Fair

Untuk Ubuntu 24.04 (Rumahweb) + domain **goldensatyafair.com**.

Repo: https://github.com/arthureventindonesia-sys/tiket-konser

## 1. DNS

Di panel domain, buat record:

| Tipe | Nama | Nilai |
| --- | --- | --- |
| A | `@` | IP VPS |
| A | `www` | IP VPS |

Tunggu DNS aktif (bisa 5–30 menit). Cek: `ping goldensatyafair.com`

Buka port **22, 80, 443** di firewall Rumahweb.

## 2. Masuk VPS

```bash
ssh root@IP_VPS
```

## 3. Instal otomatis

```bash
apt-get update -y && apt-get install -y git
git clone https://github.com/arthureventindonesia-sys/tiket-konser.git /tmp/tiket-konser
sudo bash /tmp/tiket-konser/deploy/install-vps.sh
```

Skrip ini memasang Node.js 22, PostgreSQL, Nginx, meng-clone repo ke `/var/www/goldensatyafair`, build, dan menjalankan layanan.

Kredensial database tersimpan di `/root/gsf-credentials.txt`.

## 4. HTTPS (SSL)

Setelah DNS sudah mengarah ke VPS:

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d goldensatyafair.com -d www.goldensatyafair.com
```

## 5. Login admin

- Alamat: https://goldensatyafair.com/login
- Username: `iang`
- Password: `$Golden`

Lalu isi kuota, harga, dan jadwal di menu **Tiketing**.

## Update kode nanti

Kalau muncul `fatal: detected dubious ownership`, jalankan dulu:

```bash
git config --global --add safe.directory /var/www/goldensatyafair
sudo bash /var/www/goldensatyafair/deploy/update.sh
```

Atau langsung:

```bash
sudo bash /var/www/goldensatyafair/deploy/update.sh
```

## Cek jika error

```bash
systemctl status gsf
journalctl -u gsf -n 80 --no-pager
nginx -t
```
