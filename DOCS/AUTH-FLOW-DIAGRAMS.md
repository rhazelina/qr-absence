# Authentication Flow Diagrams

## 1. Waka Staff Login Flow (Previously Broken)

### Before Fix ❌
```
User (Waka) selects "Waka Staff"
          ↓
    LandingPage (no school data from API)
          ↓
    LoginPage (shows generic fields)
          ↓
Website-UI: POST /auth/login ❌ NOT CONNECTED
Frontend: POST /auth/login ✅ Works
Deskta: POST /auth/login ✅ Works
          ↓
    (if connected) Backend returns role: "waka"
          ↓
Frontend/Deskta: localStorage role = "waka" ✅
Website-UI: localStorage role = "waka" ❌ NOT SAVED
          ↓
Navigate to /waka/dashboard
    ✅ Deskta/Frontend
    ❌ Website-UI (no token saved)
```

### After Fix ✅
```
User (Waka) selects "Waka Staff"
          ↓
    LandingPage
          ↓
    Fetch /settings/public (API) ✅
          ↓
    Display school logo, name, mascot ✅
          ↓
    Navigate to /login/waka
          ↓
    LoginPage shows:
    - Kode Guru label (NIP field)
    - Kata Sandi label
          ↓
    User enters credentials
    (Waka username/NIP + password)
          ↓
    POST /auth/login to backend ✅
          ↓
    Backend checks:
    - User exists ✅
    - User active ✅
    - Password correct ✅
          ↓
    Backend determines role:
    Is admin? → Check admin_profile.type
    "waka" → return role: "waka" ✅
          ↓
    Frontend receives:
    {
      token: "Bearer...",
      user: {
        role: "waka" ✅
        user_type: "admin"
        is_class_officer: false
        profile: {...}
      }
    }
          ↓
    Normalize role: "waka" (already correct)
    Save to localStorage:
    - token ✅
    - user (full object) ✅
    - userRole: "waka" ✅
    - userIdentifier: "waka_nip" ✅
          ↓
    Route check: currentUser?.role === "waka" ✅
          ↓
    Navigate to /waka/dashboard ✅
          ↓
    Display WakaDashboard content ✅
```

---

## 2. Complete Authentication Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT APPS (3 variants)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │    DESKTA       │  │    FRONTEND      │  │  WEBSITE-UI     │ │
│  │  (Desktop/Elec)│  │   (Web - React)  │  │  (Web - React)  │ │
│  │                 │  │                  │  │                 │ │
│  │ - LoginPage.tsx │  │- LoginPage.jsx   │  │- LoginPage.jsx  │ │
│  │ - LandingPage  │  │- LandingPage.jsx │  │- LandingPage.jsx│ │
│  │ - authService  │  │- SchoolContext   │  │- (uses API)     │ │
│  │ - App.tsx      │  │- App.jsx         │  │- App.jsx        │ │
│  │                 │  │                  │  │                 │ │
│  │ Tech: TypeScript│  │ Tech: JavaScript │  │ Tech: JavaScript│ │
│  │ Build: Vite    │  │ Build: Vite      │  │ Build: Vite     │ │
│  │ Desktop: Electron                       │ Browser only    │ │
│  └─────────────────┘  └──────────────────┘  └─────────────────┘ │
│           ↓                  ↓                      ↓             │
│    ╔══════════════════════════════════════════════════════════╗  │
│    ║  All apps use IDENTICAL role normalization logic        ║  │
│    ║  All apps save IDENTICAL localStorage structure         ║  │
│    ║  All apps communicate with SAME backend API            ║  │
│    ╚══════════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │    VITE Environment Variables        │
        ├──────────────────────────────────────┤
        │ VITE_API_URL=http://localhost:8000  │
        │                               /api    │
        └──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    REST API (Laravel/PHP)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PUBLIC ENDPOINTS (No Auth Required)                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ POST   /auth/login           ← Login users                 │ │
│  │ GET    /settings/public      ← Get school data             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  PROTECTED ENDPOINTS (Requires Sanctum Token)                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ GET    /me                   ← Get current user             │ │
│  │ POST   /auth/logout          ← Logout user                 │ │
│  │ POST   /auth/refresh         ← Refresh token               │ │
│  │                                                               │ │
│  │ Role-specific endpoints:                                    │ │
│  │ GET    /admin/summary        (admin only)                  │ │
│  │ GET    /waka/dashboard/summary (waka only)                 │ │
│  │ GET    /me/schedules         (teachers/students)           │ │
│  │ ... + many more                                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Controller: AuthController (app/Http/Controllers/)               │
│  Model: User (app/Models/)                                        │
│  Middleware: auth:sanctum, role:admin, role:teacher, etc         │
│                                                                     │
│  Functions:                                                        │
│  • login() - Authenticate user, return token + normalized role   │
│  • me() - Get current user profile                               │
│  • logout() - Revoke token                                        │
│  • refresh() - Issue new token                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL/MariaDB)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                     │
│  users table                                                       │
│  ├─ id (primary key)                                              │
│  ├─ name                                                           │
│  ├─ username (unique)                                             │
│  ├─ email                                                          │
│  ├─ password (hashed)                                             │
│  ├─ user_type (admin|teacher|student)                            │
│  ├─ photo_url                                                      │
│  ├─ active (boolean)                                              │
│  └─ ... other columns                                             │
│                                                                     │
│  admin_profiles table (for admin users)                           │
│  ├─ user_id (foreign key)                                         │
│  ├─ type (admin|waka|kepala_sekolah|etc)  ← KEY for Waka roles! │
│  └─ ... other fields                                              │
│                                                                     │
│  teacher_profiles table (for teacher users)                       │
│  ├─ user_id (foreign key)                                         │
│  ├─ nip (unique teacher ID)                                       │
│  ├─ kode_guru                                                      │
│  ├─ homeroom_class_id (if null → guru, if set → wakel)          │
│  └─ ... other fields                                              │
│                                                                     │
│  student_profiles table (for student users)                       │
│  ├─ user_id (foreign key)                                         │
│  ├─ nisn (student ID)                                             │
│  ├─ nis                                                            │
│  ├─ class_id                                                       │
│  ├─ is_class_officer (if true → pengurus_kelas)                 │
│  └─ ... other fields                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Role Determination Flow

```
Frontend Login Form Input
        ↓
   User enters identifier (username/nip/nisn) + password
        ↓
   POST /auth/login (identifier + password)
        ↓
   Backend Verification:
   ├─ Find user by username/email → Found? User exists ✓
   ├─ If not found:
   │  ├─ Find student by NISN/NIS → Get student's user
   │  └─ Find teacher by NIP/kode_guru → Get teacher's user
   ├─ Hash check password
   ├─ Check user.active = true
   └─ Create Sanctum token
        ↓
   Determine Normalized Role:
   └─ Is user_type = 'admin'?
      ├─ YES → Check admin_profile.type
      │   ├─ type = 'waka' → Return role: 'waka' ✓
      │   ├─ type = 'admin' → Return role: 'admin'
      │   └─ type = other → Return role: other
      ├─ Is user_type = 'teacher'?
      │   ├─ Check homeroom_class_id?
      │   │  ├─ HomeRoom SET → Return role: 'wakel'
      │   │  └─ HomeRoom NULL → Return role: 'guru'
      ├─ Is user_type = 'student'?
      │   ├─ Check is_class_officer = true?
      │   │  ├─ YES → Return role: 'pengurus_kelas'
      │   │  └─ NO → Return role: 'siswa'
      └─ Else → Return user_type as role
        ↓
   Return JSON Response:
   {
     "token": "Bearer eyJ...",
     "user": {
       "id": 1,
       "name": "Waka Name",
       "username": "waka_username",
       "email": "waka@school.com",
       "user_type": "admin",           ← Database type
       "role": "waka",                 ← Normalized UI role
       "is_class_officer": false,
       "profile": {
         "nip": "123456789",
         "photo_url": "...",
         "homeroom_class_id": null,
         "homeroom_class_name": null
       }
     }
   }
        ↓
   Frontend Receives Response
        ↓
   normalize Role:
   input:  role="waka", user_type="admin", is_class_officer=false
   output: "waka" (no change, already normalized)
        ↓
   Save to localStorage:
   {
     "token": "Bearer eyJ...",
     "user": { ...full object... },
     "userRole": "waka",
     "userIdentifier": "waka_username"
   }
        ↓
   Route Guard Check:
   Is currentUser?.role === "waka"?
   ├─ YES → Navigate to /waka/dashboard ✓
   └─ NO → Navigate to / (redirect to home)
```

---

## 4. Pre-Login (Landing Page) Flow

```
User opens app for the first time
        ↓
   Browser loads index.html
        ↓
   React/JavaScript initializes
        ↓
   Check localStorage for token?
   ├─ Found → Skip landing, go to dashboard
   └─ Not found → Show landing page
        ↓
   LandingPage Component Mounts
        ↓
   useEffect: Fetch /settings/public
        ↓
   ┌─────────────────────────────────────┐
   │ Show loading state: "Memuat..."     │
   └─────────────────────────────────────┘
        ↓
   API Call: GET /settings/public
   ├─ Success (200) → Parse response
   │  ├─ data.school_name → setNamaSekolah
   │  ├─ data.school_logo_url → setLogo
   │  └─ data.school_mascot_url → setMaskot
   │
   └─ Failure (4xx/5xx/Network) → Use fallback
      ├─ Try localStorage.getItem('logoSekolah')
      ├─ Try localStorage.getItem('maskotSekolah')
      ├─ Try localStorage.getItem('profileSekolah')
      └─ Use default values if all fail
        ↓
   ┌─────────────────────────────────────┐
   │ Display Landing Page:               │
   │ - School Logo (from API or storage) │
   │ - School Name (from API or storage) │
   │ - School Mascot (if available)      │
   │ - "Masuk Sebagai" dropdown           │
   └─────────────────────────────────────┘
        ↓
   User clicks dropdown, selects role
   e.g., "Waka Staff"
        ↓
   Navigate to /login/waka
        ↓
   LoginPage Component Mounts
   ├─ Load role-specific config
   │  └─ Show Kode Guru + Kata Sandi fields
   └─ Display role-specific welcome text
        ↓
   User enters credentials, submits form
        ↓
   (See Login Flow above)
```

---

## 5. Logout & Token Refresh Flow

```
User clicks Logout Button
        ↓
   Call authService.logout()
   OR Frontend's logout handler
        ↓
   POST /auth/logout
   (with Sanctum token in headers:
    Authorization: Bearer token)
        ↓
   Backend:
   ├─ Verify token is valid (Sanctum middleware)
   ├─ Get current user from token
   ├─ Delete token from personal_access_tokens table
   └─ Return { "message": "Logged out" }
        ↓
   Frontend:
   ├─ Clear localStorage:
   │  ├─ localStorage.removeItem('token')
   │  ├─ localStorage.removeItem('user')
   │  ├─ localStorage.removeItem('userRole')
   │  └─ localStorage.removeItem('currentUser')
   │
   ├─ Clear sessionStorage (Deskta):
   │  └─ sessionStorage.removeItem('currentUser')
   │
   └─ Navigate to / (landing page)
        ↓
   User sees landing page again
   (no longer logged in)
```

---

## 6. Token Refresh Flow

```
Frontend detects token is expiring
(config('sanctum.expiration') = 60 minutes)
        ↓
   POST /auth/refresh
   (with current token in Authorization header)
        ↓
   Backend:
   ├─ Verify current token
   ├─ Delete old token
   ├─ Create new token
   └─ Return:
      {
        "token": "Bearer new_token...",
        "expires_in": 3600,
        "token_type": "Bearer"
      }
        ↓
   Frontend:
   ├─ Update localStorage.token = new_token
   └─ Continue using API with new token
        ↓
   User session extended by 60 more minutes
```

---

## 7. LocalStorage Structure After Login

```javascript
{
  // Deskta Specific
  currentUser: {
    role: "waka",
    name: "Waka Name",
    phone: "08xx-xxxx-xxxx",
    profile: { ... }
  },
  selectedRole: null,  // Cleared after login
  
  // All Apps
  token: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: 1,
    name: "Waka Name",
    username: "waka_user",
    email: "waka@school.com",
    user_type: "admin",
    role: "waka",
    is_class_officer: false,
    profile: {
      nip: "123456789",
      photo_url: "https://...",
      homeroom_class_id: null,
      homeroom_class_name: null
    }
  },
  userRole: "waka",
  userIdentifier: "waka_user",
  
  // Optional: School Data (Fallback)
  logoSekolah: "https://...",
  maskotSekolah: "https://...",
  profileSekolah: '{"namaSekolah":"SMKN 2 SINGOSARI",...}'
}
```

---

## 8. Error Handling Flow

```
User enters wrong credentials
        ↓
   POST /auth/login → 422 Validation Error
   Backend returns:
   {
     "message": "Invalid credentials",
     "errors": {
       "login": ["Invalid credentials"]
     }
   }
        ↓
   Frontend catch block:
   const error = data.message || 'Login gagal'
        ↓
   Display error message in UI:
   "⚠️ Invalid credentials"
        ↓
   User can retry without page reload
```

```
API not reachable (/settings/public fails)
        ↓
   catch (error) {...}
        ↓
   Try localStorage fallback
   ├─ Found items? Use them
   └─ Not found? Use defaults
        ↓
   Landing page still displays (with defaults or saved data)
        ↓
   User can still login (login API might work)
```

---

**This documentation should help understand and debug the authentication system across all three applications.**
