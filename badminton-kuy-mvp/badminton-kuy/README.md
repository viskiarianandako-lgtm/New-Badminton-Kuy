# Badminton Kuy

MVP web app untuk mabar random badminton.

## Jalankan
- Buka `index.html` langsung di browser, atau
- gunakan server lokal: `python -m http.server 8080`
- buka `http://localhost:8080`

## Fitur MVP
- Buat sesi
- Kode sesi
- Tambah/hapus pemain
- Random doubles multi-court
- Algoritma memprioritaskan pemain dengan game lebih sedikit
- Mengurangi pengulangan partner
- Catat pemenang
- Klasemen dan win rate
- Responsive/mobile-first
- localStorage

## Tahap produksi yang disarankan
1. Supabase Auth + Postgres + Realtime
2. Sesi publik berbasis kode
3. Sinkronisasi lintas HP
4. QR join
5. PWA/installable
6. Profil pemain dan riwayat pertandingan
7. Sistem skill/ELO opsional
8. Pembagian biaya court/shuttle
9. Admin/host dashboard
