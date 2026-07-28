# ♞ Pendaftaran Turnamen Catur Otsuka

Form registrasi bertema catur (React + Vite + three.js) yang tersambung ke Google Sheets
lewat Google Apps Script.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build produksi ke folder dist/
```

## Fitur

- Background 3D bidak catur melayang + papan berputar (three.js / react-three-fiber)
- Form daftar peserta: NAMA, NIK, DEPARTEMEN, ELO, TELEPON, SUMBER (NO diisi otomatis)
- Tabel peserta dengan pencarian, urut ELO tertinggi, dan medali 3 besar
- Edit & hapus peserta (CRUD penuh ke sheet)
- Validasi dasar + notifikasi toast

## Koneksi Apps Script

URL endpoint ada di [`src/api.js`](src/api.js) pada konstanta `APPS_SCRIPT_URL`.

> **Penting:** Setiap kali kamu **re-deploy** Apps Script sebagai *New deployment*,
> URL-nya berubah. Ganti nilai `APPS_SCRIPT_URL` dengan URL baru. Gunakan
> *Manage deployments → Edit* jika ingin URL tetap sama.

### Catatan CORS
- **GET** (`?action=list`) dan **POST** dikirim sebagai *simple request*.
- POST memakai `Content-Type: text/plain` supaya browser **tidak** melakukan
  preflight `OPTIONS` (yang tidak didukung Apps Script). `e.postData.contents`
  di Apps Script tetap berisi JSON dan bisa di-`JSON.parse`.
- Pastikan deployment: **Execute as: Me**, **Who has access: Anyone**.
