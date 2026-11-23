# Starter pendaftaran kuota + Supabase

## Isi paket
- `index.html`: halaman pendaftaran.
- `owner.html`: dashboard privat owner.
- `schema.sql`: tabel + RLS.
- `supabase/functions/register-lead/index.ts`: endpoint pendaftaran aman.
- `supabase/config.toml`: konfigurasi Edge Function.

## 1. Buat project
1. Buat project baru di https://supabase.com/dashboard.
2. Buka Project Settings > API.
3. Salin Project URL dan anon/publishable key.
4. Project URL dan publishable key sudah dipasang pada **kedua** file HTML. Jangan mengganti atau membagikan secret key.
   Jangan pernah menaruh `service_role` key di HTML atau membagikannya.

## 2. Buat tabel
1. Buka SQL Editor di dashboard Supabase.
2. Jalankan seluruh isi `schema.sql`.

## 3. Buat akun owner tunggal
1. Buka Authentication > Users > Add user, buat email/password owner.
2. Setelah user dibuat, buka SQL Editor dan jalankan (ganti UUID dengan ID user owner):
   `update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"owner"}'::jsonb where id = 'UUID-USER-OWNER';`
3. Logout lalu login lagi di `owner.html` agar token memuat role terbaru.
4. Jangan membuat akun owner melalui form publik. Simpan password dengan aman dan aktifkan MFA bila tersedia.

## 4. Deploy Edge Function
Perlu Supabase CLI dan Docker untuk deploy lokal:
1. Pasang Supabase CLI: https://supabase.com/docs/guides/cli
2. Login: `supabase login`
3. Hubungkan project: `supabase link --project-ref PROJECT_REF`
4. Atur secret server:
   `supabase secrets set SUPABASE_URL=https://PROJECT_REF.supabase.co SUPABASE_SERVICE_ROLE_KEY=SERVICE_ROLE_KEY`
5. Deploy:
   `supabase functions deploy register-lead --no-verify-jwt`
`SERVICE_ROLE_KEY` hanya disimpan sebagai secret Edge Function. Jangan pernah memasukkannya ke file HTML.

## 5. Konfigurasi Area 1–4 (WAJIB sebelum pendaftaran aktif)
Di `index.html`, isi `AREA_POLYGONS` dengan batas poligon area resmi yang ditetapkan bisnismu. Tiap area berupa daftar titik `[latitude, longitude]`, minimal 3 titik, berurutan mengelilingi wilayah. Contoh hanya menunjukkan format dan sengaja dinonaktifkan. Jangan menebak batas area atau menganggap GPS menentukan area operator secara otomatis.
Jika poligon belum diisi atau lokasi di luar semua poligon, halaman tidak mengizinkan lanjut.

## 6. Hosting
Upload `index.html` dan `owner.html` ke hosting HTTPS (misalnya Cloudflare Pages). Geolocation browser umumnya memerlukan HTTPS atau localhost.

## Catatan privasi dan operasional
- Pengguna harus secara aktif mengizinkan lokasi dan mencentang persetujuan sebelum pengiriman data.
- Owner dapat melihat nomor, jenis kartu, area, koordinat, akurasi GPS, dan tautan Google Maps.
- Data lokasi adalah koordinat yang dilaporkan perangkat; akurasi bergantung perangkat, sinyal, dan kondisi sekitar. Ini bukan jaminan presisi WhatsApp.
- Data pendaftaran disimpan sampai owner menghapusnya sesuai kebijakan retensi yang kamu tetapkan. Tentukan kebijakan retensi dan tampilkan kontak privasi bisnismu sebelum dipakai publik.
- Sistem ini hanya mencatat permintaan dan status internal. Sistem tidak mengaktifkan/mengirim kuota ke jaringan operator. Untuk pemenuhan kuota nyata, gunakan kanal/API/kemitraan resmi dan verifikasi bahwa promonya memang berlaku.
- Tabel tidak dapat dibaca publik. Hanya JWT dengan `app_metadata.role = owner` yang dapat membaca/mengubah melalui RLS. Edge Function memakai service role hanya di sisi server.
- Starter ini belum menambahkan CAPTCHA/rate limiting. Tambahkan proteksi abuse sebelum dibuka untuk publik.


## Perubahan daftar operator dan refresh lokasi
- Dropdown operator mencakup Telkomsel, by.U, Indosat/IM3, Tri, Smartfren, XL, Axis, dan Live.On.
- Tombol cek/refresh lokasi meminta lokasi terbaru hanya saat pengguna menekannya.
- Tombol refresh di owner memuat ulang data pendaftaran terakhir yang tersimpan.
- Ini bukan live tracking/background tracking. Jika pengguna berpindah tempat setelah mengirim pendaftaran, owner hanya melihat koordinat terakhir yang secara sadar dibagikan. Paket awal belum membuat mekanisme update lokasi pascapendaftaran.
- Jangan gunakan password yang pernah dibagikan di chat. Buat password baru langsung di Supabase Auth dan aktifkan MFA jika tersedia.


## Konfigurasi project yang sudah dipasang
- Project URL: `https://jdctzrvrmomdqpcwkqhm.supabase.co`
- Publishable key: sudah dipasang pada `index.html` dan `owner.html`.
- URL yang kamu kirim berisi `/rest/v1/`; bagian itu adalah endpoint REST, jadi untuk `createClient` dipakai URL dasar project tanpa `/rest/v1/`.
