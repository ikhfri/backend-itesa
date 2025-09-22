
# Dokumentasi Backend API Serabutan

## Gambaran Umum
**Serabutan Backend API** adalah RESTful API yang dibangun dengan **TypeScript**, **Express**, **Prisma**, dan **Zod** untuk aplikasi marketplace jasa. API ini mendukung autentikasi pengguna dengan **Google OAuth**, **autentikasi berbasis JWT**, serta **role-based access control** (CLIENT, WORKER, ADMIN).  

Fitur utama mencakup pencarian pekerja berdasarkan lokasi menggunakan rumus Haversine, pengelolaan profil pekerja, manajemen layanan, serta pemesanan jasa melalui WhatsApp. Dokumentasi ini menyediakan panduan setup, detail endpoint, skema database, dan cara penggunaan.

---

## Daftar Isi
1. [Fitur](#fitur)  
2. [Teknologi](#teknologi)  
3. [Struktur Proyek](#struktur-proyek)  
4. [Instruksi Setup](#instruksi-setup)  
5. [Skema Database](#skema-database)  
6. [Autentikasi](#autentikasi)  
7. [API Endpoints](#api-endpoints)  
   - [Endpoint Auth](#endpoint-auth)  
   - [Endpoint Worker](#endpoint-worker)  
   - [Endpoint Service](#endpoint-service)  
   - [Endpoint Order](#endpoint-order)  
   - [Endpoint Location](#endpoint-location)  
8. [Penanganan Error](#penanganan-error)  
9. [Dokumentasi Swagger](#dokumentasi-swagger)  
10. [Catatan Tambahan](#catatan-tambahan)  

---

## Fitur
- **Autentikasi Pengguna**: Login/register dengan Google OAuth, role default `CLIENT`.  
- **Role-Based Access Control**: Mendukung role `CLIENT`, `WORKER`, dan `ADMIN`.  
- **Manajemen Profil Pekerja**: Upgrade role dari `CLIENT` ke `WORKER`, update bio, harga, nomor telepon, keahlian, serta kelola jasa.  
- **Manajemen Jasa**: Pekerja dapat membuat, memperbarui, dan menghapus jasa.  
- **Pemesanan Jasa**: Klien dapat melakukan pemesanan yang diarahkan langsung ke WhatsApp (tanpa payment gateway).  
- **Pencarian Berdasarkan Lokasi**: Cari pekerja terdekat menggunakan rumus Haversine.  
- **Dokumentasi API**: Swagger UI untuk eksplorasi endpoint.  

---

## Teknologi
- **Node.js & Express** – Framework backend untuk RESTful API.  
- **TypeScript** – Memberikan static typing agar kode lebih aman.  
- **Prisma** – ORM untuk manajemen database (PostgreSQL/SQLite).  
- **Zod** – Validasi request body.  
- **JWT** – Autentikasi berbasis JSON Web Token.  
- **Passport** – Integrasi Google OAuth.  
- **Swagger** – Dokumentasi API interaktif.  
- **dotenv** – Manajemen environment variables.  

---

## Struktur Proyek
```
serabutan-backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── dtos/
│   ├── middlewares/
│   ├── utils/
│   ├── services/
│   ├── docs/
│   ├── app.ts
│   └── index.ts
├── swagger.json
├── .env
├── package.json
└── tsconfig.json
```

---

## Instruksi Setup

### Prasyarat
- **Node.js** v16+  
- **PostgreSQL** (atau SQLite untuk dev)  
- **npm/yarn**  
- **Google OAuth credentials** (Client ID & Secret)  

### Langkah-langkah
1. **Clone Repository**  
   ```bash
   git clone <repository-url>
   cd serabutan-backend
   ```

2. **Install Dependencies**  
   ```bash
   npm install
   ```

3. **Setup .env**  
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/serabutan_db"
   JWT_SECRET="your_jwt_secret"
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
   PORT=3000
   ```

4. **Inisialisasi Prisma**  
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed   # opsional
   ```

5. **Generate Swagger**  
   ```bash
   node src/docs/swagger.ts
   ```

6. **Jalankan Server**  
   ```bash
   npm run start
   ```
   Akses API di `http://localhost:3000` dan Swagger UI di `http://localhost:3000/api-docs`.

---

## Skema Database
Dikelola oleh **Prisma** dengan model utama:  
- **User** (id, name, email, role, phone, relation ke Worker & Location)  
- **Worker** (id, userId, bio, price, skills, services, orders)  
- **Skill** (id, name)  
- **WorkerSkill** (relasi many-to-many Worker <-> Skill)  
- **Service** (id, workerId, title, description, price)  
- **Location** (id, userId, latitude, longitude, address)  
- **Order** (id, clientId, workerId, serviceDate, status, note)  

### Enums
- **Role**: `CLIENT`, `WORKER`, `ADMIN`  
- **OrderStatus**: `PENDING`, `CONFIRMED`, `DONE`, `CANCELED`  

---

## Autentikasi
- **Google OAuth** → Login/register, user baru default `CLIENT`.  
- **JWT** → Semua endpoint terproteksi butuh header `Authorization: Bearer <token>`.  
- **Role Access**:  
  - `CLIENT`: lihat pekerja, layanan, buat order.  
  - `WORKER`: kelola profil & jasa.  
  - `ADMIN`: reserved untuk masa depan.  

---

## API Endpoints

### Auth
| Method | Endpoint                | Deskripsi                        | Role   |
|--------|-------------------------|----------------------------------|--------|
| GET    | `/auth/google`          | Mulai login Google OAuth         | -      |
| GET    | `/auth/google/callback` | Callback Google OAuth            | -      |
| POST   | `/auth/upgrade-worker`  | Upgrade CLIENT → WORKER          | CLIENT |

### Worker
| Method | Endpoint           | Deskripsi                          | Role    |
|--------|--------------------|------------------------------------|---------|
| GET    | `/worker/profile`  | Lihat profil worker                | WORKER  |
| PUT    | `/worker/profile`  | Update profil worker               | WORKER  |
| GET    | `/worker/:id`      | Lihat worker by ID                 | -       |
| GET    | `/worker/nearby`   | Cari worker terdekat (Haversine)   | -       |

### Service
| Method | Endpoint                   | Deskripsi               | Role   |
|--------|----------------------------|-------------------------|--------|
| POST   | `/service`                 | Buat layanan baru       | WORKER |
| PUT    | `/service/:id`             | Update layanan          | WORKER |
| DELETE | `/service/:id`             | Hapus layanan           | WORKER |
| GET    | `/service/worker/:workerId`| Lihat layanan worker    | -      |

### Order
| Method | Endpoint   | Deskripsi                           | Role   |
|--------|------------|-------------------------------------|--------|
| POST   | `/order`   | Buat order (redirect ke WhatsApp)   | CLIENT |

### Location
| Method | Endpoint           | Deskripsi                         | Role |
|--------|--------------------|-----------------------------------|------|
| POST   | `/location/upsert` | Tambah/update lokasi user         | Any  |
| GET    | `/location/nearby` | Cari lokasi terdekat (Haversine)  | -    |

---

## Penanganan Error
- **400** – Bad Request (Zod validation)  
- **401** – Unauthorized (JWT invalid/missing)  
- **403** – Forbidden (role tidak sesuai)  
- **404** – Resource tidak ditemukan  
- **500** – Server error  

---

## Dokumentasi Swagger
- Generate swagger.json:  
  ```bash
  node src/docs/swagger.ts
  ```
- Akses UI: `http://localhost:3000/api-docs`  

---

## Catatan Tambahan
- **Rumus Haversine** → dipakai untuk endpoint `/worker/nearby` & `/location/nearby`.  
- **Integrasi WhatsApp** → Order menghasilkan URL WhatsApp otomatis.  
- **Keamanan** → Gunakan `JWT_SECRET` kuat, validasi OAuth credentials, tambahkan rate-limit.  
- **Testing** → Disarankan pakai Jest.  

---

## Alur Contoh
1. **Klien**  
   - Login via `/auth/google`  
   - Cari pekerja `/worker/nearby`  
   - Lihat jasa `/service/worker/:workerId`  
   - Order via `/order` → WhatsApp  

2. **Worker**  
   - Upgrade role `/auth/upgrade-worker`  
   - Update profil `/worker/profile`  
   - Tambah jasa `/service`  

3. **Admin**  
   - Belum diimplementasikan (future use).  


## Kontak
Jika ada bug/kontribusi, silakan buka issue di repo atau hubungi tim developer.
