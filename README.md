# Badminton Kuy

Aplikasi web untuk mabar badminton dengan sistem random matchmaking yang adil.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ dan npm
- Akun Supabase (gratis)

### 1. Clone & Install

```bash
git clone <repo-url>
cd badminton-kuy
npm install
```

### 2. Setup Supabase

1. Buat project baru di [https://supabase.com](https://supabase.com)
2. Buka **SQL Editor** di dashboard Supabase
3. Copy isi file `supabase/schema.sql` dan paste di SQL Editor
4. Klik **Run** untuk membuat tabel dan RLS policies
5. Buka **Settings > API** untuk mendapatkan credentials

### 3. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` dan isi dengan credentials Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 5. Deploy ke Vercel

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Add environment variables di Vercel Dashboard
4. Klik **Deploy**

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Ya | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ya | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Tidak | Service role key (server-side only) |

## Project Structure

```
app/                    # Next.js App Router pages
├── create-session/     # Buat sesi baru
├── join/               # Gabung sesi
├── login/              # Login host
├── register/           # Register host
├── session/[code]/     # Detail sesi
├── match/[code]/[id]/  # Live scoring
├── scoreboard/[code]/  # Papan skor
├── recap/[code]/       # Rekap biaya
├── standings/[code]/   # Riwayat skor
├── my-sessions/        # Daftar sesi host
├── my-matches/[code]/  # Jadwal pemain
├── display/            # Masukkan kode untuk papan skor
└── page.tsx            # Halaman utama

src/
├── components/         # UI components
│   ├── ui.tsx          # Button, TextField, dll
│   ├── layout.tsx      # Layout dengan navigasi
│   └── toast.tsx       # Toast notifications
├── lib/
│   ├── supabase.ts     # Supabase client
│   ├── api.ts          # API functions
│   └── env.ts          # Environment validation
supabase/
└── schema.sql          # Database schema & RLS policies
```

## Fitur

- Register & Login (Supabase Auth)
- Buat session mabar dengan kode unik
- Join session dengan kode
- Random matchmaking (fair round-robin)
- Multi-court support
- Live scoring (15/21 rally point)
- Papan skor real-time
- QR code untuk join
- Rekap biaya & statistik
- Row Level Security (RLS)

## Troubleshooting

### Error: "Missing Supabase environment variables"

Pastikan file `.env.local` sudah dibuat dan diisi dengan benar:

```bash
cp .env.example .env.local
```

### Error: "Invalid API key"

Pastikan `NEXT_PUBLIC_SUPASE_ANON_KEY` benar dan sesuai dengan project Supabase Anda.

### Build gagal

Pastikan Node.js version 18+ dan semua dependencies terinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## License

MIT
