# API Documentation — SIPADU

Dokumentasi semua endpoint Inertia.js beserta request/response shape.

> **Catatan**: SIPADU menggunakan Inertia.js, sehingga semua response berupa Inertia page render (bukan JSON API tradisional). Request menggunakan form submission standar dengan CSRF protection otomatis.

---

## Public Endpoints (Tanpa Autentikasi)

### GET `/`

Landing page SIPADU.

- **Auth**: Public
- **Response**: Inertia page `Welcome`
- **Props**:
  ```typescript
  {
    canRegister: boolean
  }
  ```

### GET `/pengaduan/buat`

Form pengajuan pengaduan publik.

- **Auth**: Public
- **Response**: Inertia page `Pengaduan/Buat`
- **Props**:
  ```typescript
  {
    categories: Array<{
      id: number
      name: string
      code: string
      sla_days: number
    }>
  }
  ```

### POST `/pengaduan/buat`

Submit pengaduan baru.

- **Auth**: Public
- **Request Body** (multipart/form-data):

  | Field | Type | Validation | Wajib |
  |-------|------|-----------|-------|
  | nik | string | 16 digit angka | Ya |
  | name | string | max:255 | Ya |
  | address | string | max:500 | Ya |
  | phone | string | format telepon Indonesia | Ya |
  | email | string | valid email | Tidak |
  | category_id | integer | exists:complaint_categories,id | Ya |
  | title | string | max:255 | Ya |
  | incident_date | string (Y-m-d) | date, before_or_equal:today | Ya |
  | incident_location | string | max:500 | Ya |
  | description | string | min:50, max:5000 | Ya |
  | reported_party | string | max:255 | Tidak |
  | attachments[] | File | max:10240 (10MB), mimes:jpg,jpeg,png,pdf,doc,docx | Tidak |
  | is_anonymous | boolean | - | Tidak |
  | is_confidential | boolean | - | Tidak |

- **Response Success**: Redirect ke halaman konfirmasi dengan flash `ticket_no`
- **Response Error**: Redirect back dengan validation errors

### GET `/pengaduan/cek`

Halaman lacak pengaduan.

- **Auth**: Public
- **Query Params**: `ticket_no` (optional)
- **Response**: Inertia page `Pengaduan/Cek`
- **Props**:
  ```typescript
  {
    complaint?: {
      ticket_no: string
      status: string
      status_label: string
      category: string
      title: string
      created_at: string
      sla_deadline: string
      is_overdue: boolean
      status_history: Array<{
        status: string
        status_label: string
        note: string | null
        created_at: string
      }>
    }
    error?: string
  }
  ```

---

## Auth Endpoints

### GET `/login`

Halaman login.

- **Auth**: Guest only
- **Response**: Inertia page `Auth/Login`

### POST `/login`

Proses login.

- **Auth**: Guest only
- **Request Body**:

  | Field | Type | Wajib |
  |-------|------|-------|
  | email | string | Ya |
  | password | string | Ya |
  | remember | boolean | Tidak |

- **Response Success**: Redirect ke `/dashboard`
- **Response Error**: Redirect back dengan errors

### POST `/logout`

Proses logout.

- **Auth**: Authenticated
- **Response**: Redirect ke `/`

### GET `/register`

Halaman registrasi.

- **Auth**: Guest only
- **Response**: Inertia page `Auth/Register`

### POST `/register`

Proses registrasi.

- **Auth**: Guest only
- **Request Body**:

  | Field | Type | Validation | Wajib |
  |-------|------|-----------|-------|
  | name | string | max:255 | Ya |
  | email | string | unique:users | Ya |
  | password | string | min:8, confirmed, mixed case, numbers, symbols | Ya |
  | password_confirmation | string | - | Ya |

---

## Masyarakat Endpoints

### GET `/dashboard`

Dashboard masyarakat.

- **Auth**: `masyarakat` (authenticated)
- **Response**: Inertia page `Dashboard/Index`
- **Props**:
  ```typescript
  {
    complaints: Array<{
      id: number
      ticket_no: string
      title: string
      status: string
      status_label: string
      category: string
      created_at: string
      is_overdue: boolean
    }>
  }
  ```

---

## Petugas Endpoints

### GET `/petugas/dashboard`

Dashboard petugas layanan.

- **Auth**: `petugas_layanan`
- **Response**: Inertia page `Petugas/Dashboard`
- **Props**:
  ```typescript
  {
    assignedComplaints: Array<{
      id: number
      ticket_no: string
      title: string
      status: string
      category: string
      sla_deadline: string
      is_overdue: boolean
      created_at: string
    }>
    stats: {
      total_assigned: number
      in_progress: number
      responded: number
      overdue: number
    }
  }
  ```

### PATCH `/petugas/complaints/{id}/respond`

Merespons pengaduan yang ditugaskan.

- **Auth**: `petugas_layanan` (permission: `complaints.respond`)
- **Request Body**:

  | Field | Type | Wajib |
  |-------|------|-------|
  | note | string (min:10) | Ya |

- **Response**: Redirect back dengan flash success

---

## Panitera Endpoints

### GET `/panitera/dashboard`

Dashboard panitera.

- **Auth**: `panitera`
- **Response**: Inertia page `Panitera/Dashboard`
- **Props**:
  ```typescript
  {
    complaints: PaginatedResponse<Complaint>
    stats: {
      total: number
      submitted: number
      verified: number
      assigned: number
      in_progress: number
      responded: number
      resolved: number
      overdue: number
      sla_compliance_rate: number
    }
    petugas: Array<{ id: number, name: string }>
  }
  ```

### PATCH `/panitera/complaints/{id}/resolve`

Menyelesaikan pengaduan.

- **Auth**: `panitera` (permission: `complaints.resolve`)
- **Request Body**:

  | Field | Type | Wajib |
  |-------|------|-------|
  | note | string | Tidak |

---

## Admin Endpoints

### GET `/admin/dashboard`

Dashboard admin.

- **Auth**: `admin`
- **Response**: Inertia page `Admin/Dashboard`
- **Props**:
  ```typescript
  {
    stats: {
      total_complaints: number
      by_status: Record<string, number>
      by_category: Record<string, number>
      sla_compliance_rate: number
      avg_resolution_days: number
    }
  }
  ```

### GET `/admin/users`

Manajemen pengguna.

- **Auth**: `admin` (permission: `users.manage`)
- **Response**: Inertia page `Admin/Users/Index`
- **Props**:
  ```typescript
  {
    users: PaginatedResponse<{
      id: number
      name: string
      email: string
      role: string
      is_active: boolean
      last_login_at: string | null
    }>
  }
  ```

### POST `/admin/users`

Membuat pengguna baru.

- **Auth**: `admin`
- **Request Body**:

  | Field | Type | Validation | Wajib |
  |-------|------|-----------|-------|
  | name | string | max:255 | Ya |
  | email | string | unique:users | Ya |
  | password | string | min:8, confirmed | Ya |
  | role | string | in:admin,panitera,petugas_layanan,masyarakat | Ya |

### PATCH `/admin/complaints/{id}/verify`

Memverifikasi pengaduan.

- **Auth**: `admin` atau `panitera`
- **Response**: Redirect back dengan flash success

### PATCH `/admin/complaints/{id}/assign`

Menugaskan pengaduan ke petugas.

- **Auth**: `admin` atau `panitera` (permission: `complaints.assign`)
- **Request Body**:

  | Field | Type | Wajib |
  |-------|------|-------|
  | assigned_to | integer (user ID petugas) | Ya |
  | note | string | Tidak |

### GET `/admin/categories`

Manajemen kategori pengaduan.

- **Auth**: `admin`
- **Response**: Inertia page `Admin/Categories/Index`

### GET `/admin/settings`

Pengaturan sistem.

- **Auth**: `admin`
- **Response**: Inertia page `Admin/Settings/Index`
- **Props**:
  ```typescript
  {
    settings: Record<string, string>
  }
  ```

### PUT `/admin/settings`

Memperbarui pengaturan sistem.

- **Auth**: `admin`
- **Request Body**: Key-value pairs pengaturan

### GET `/admin/audit-logs`

Viewer audit log.

- **Auth**: `admin`
- **Query Params**: `user_id`, `action`, `date_from`, `date_to`, `page`
- **Response**: Inertia page `Admin/AuditLog/Index`
- **Props**:
  ```typescript
  {
    logs: PaginatedResponse<{
      id: number
      user: { id: number, name: string } | null
      user_ip: string
      action: string
      subject_type: string | null
      subject_id: number | null
      old_values: object | null
      new_values: object | null
      created_at: string
    }>
    filters: {
      user_id: number | null
      action: string | null
      date_from: string | null
      date_to: string | null
    }
  }
  ```

---

## Shared Data (Tersedia di Semua Halaman)

Dikirim melalui `HandleInertiaRequests` middleware:

```typescript
interface SharedProps {
  auth: {
    user: {
      id: number
      name: string
      email: string
      roles: string[]
      permissions: string[]
    } | null
  }
  flash: {
    success: string | null
    error: string | null
  }
}
```

## Type Definitions

```typescript
interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  links: Array<{
    url: string | null
    label: string
    active: boolean
  }>
}

interface Complaint {
  id: number
  ticket_no: string
  title: string
  description: string
  status: string
  status_label: string
  priority: string
  category: {
    id: number
    name: string
    code: string
  }
  complainant_name: string
  incident_date: string
  incident_location: string
  sla_deadline: string
  is_overdue: boolean
  is_anonymous: boolean
  is_confidential: boolean
  assigned_to: number | null
  assignee: { id: number, name: string } | null
  created_at: string
  updated_at: string
  status_history: Array<{
    status: string
    status_label: string
    note: string | null
    updated_by: { id: number, name: string }
    created_at: string
  }>
  attachments: Array<{
    id: number
    original_name: string
    mime_type: string
    file_size: number
    formatted_size: string
  }>
}
```
