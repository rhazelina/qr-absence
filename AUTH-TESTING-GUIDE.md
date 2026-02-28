# Quick Auth Testing Guide

## Test Accounts (From Backend)

### Admin
- Username: `admin`
- Password: `password`
- Expected Role: `admin`

### Waka Staff
- Kode Guru (NIP): Get from teacher profile with `admin_profile.type = 'waka'`
- Password: Teacher's password
- Expected Role: `waka`

### Guru (Regular Teacher)
- Kode Guru (NIP): Get from teacher profile
- Password: Teacher's password
- Expected Role: `guru` (if no homeroom) or `wakel` (if has homeroom_class_id)

### Siswa (Student)
- NISN: Get from student profile
- Password: Optional (can login with NISN only in some configs)
- Expected Role: `siswa` (or `pengurus_kelas` if is_class_officer = true)

---

## Testing Waka Staff Login (Primary Issue)

### Step 1: Verify Backend Returns Correct Role
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "login": "waka_user",
    "password": "password"
  }'
```

**Check Response:**
```json
{
  "user": {
    "role": "waka",  // ← Should be "waka", not "admin"
    "user_type": "admin",  // ← Backend type
    "name": "...",
    "profile": { ... }
  }
}
```

### Step 2: Check Frontend Login Process

**In Browser DevTools Console:**
```javascript
// Check localStorage after login
console.log(JSON.parse(localStorage.getItem('user')));
console.log(localStorage.getItem('userRole'));
console.log(localStorage.getItem('token'));
```

**Should show:**
```javascript
{
  role: "waka",
  user_type: "admin",
  ...
}

userRole = "waka"
token = "Bearer eyJhbG..."
```

### Step 3: Verify Dashboard Access (Deskta)

1. Open browser DevTools → Console
2. After login, check: `window.location.pathname` should be `/waka/dashboard`
3. If redirect fails, check: `currentUser?.role === "waka"` in App.tsx

---

## Common Debug Scenarios

### Issue: Login succeeds but redirects to home page (wrong role)

**Causes:**
1. Role normalization mismatch between backend and frontend
2. localStorage not saving correctly
3. Route checking wrong role value

**Debug:**
```javascript
// In browser console after login attempt
console.log('localStorage user:', JSON.parse(localStorage.getItem('user')));
console.log('Checking role:', JSON.parse(localStorage.getItem('user'))?.role);
console.log('Current URL:', window.location.pathname);
```

**Fix:**
- Verify backend returns `user.role === "waka"`
- Check role normalization logic in LoginPage.jsx
- Ensure deskta App.tsx route checks: `currentUser?.role === "waka"`

---

### Issue: Landing page doesn't show school logo/name

**Causes:**
1. API not reachable to fetch `/settings/public`
2. VITE_API_URL environment variable not set
3. CORS issues

**Debug:**
```javascript
// In browser console on landing page
const baseURL = import.meta.env.VITE_API_URL;
const API_BASE_URL = baseURL ? baseURL : 'http://localhost:8000/api';
console.log('Using API:', API_BASE_URL);

fetch(`${API_BASE_URL}/settings/public`)
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Fix:**
- Check `.env` file has `VITE_API_URL=http://localhost:8000/api`
- Verify backend is running: `php artisan serve`
- Check CORS is configured in [backend/config/cors.php](backend/config/cors.php)

---

### Issue: Token not saved after login

**Causes:**
1. API returns error (check network tab)
2. Login endpoint returning 401/403
3. Credentials incorrect

**Debug:**
```javascript
// In browser console, simulate login
const response = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    login: 'waka_user',
    password: 'password'
  })
});

const data = await response.json();
console.log('Status:', response.status);
console.log('Response:', data);
```

**Fix:**
- Verify credentials are correct
- Check if user account exists in database
- Check if `users.active = true` for the user
- Review backend logs: `tail -f storage/logs/laravel.log`

---

## Test Matrix

| Role | Identifier Type | Field Label | Dashboard Route | Expected Role |
|------|-----------------|-------------|-----------------|---------------|
| Admin | Username | Nama Pengguna | `/admin/dashboard` | `admin` |
| Waka | Kode Guru (NIP) | Kode Guru | `/waka/dashboard` | `waka` |
| Guru | Kode Guru (NIP) | Kode Guru | `/guru/dashboard` | `guru` |
| Wakel | Kode Guru (NIP) | Kode Guru | `/wakel/dashboard` | `wakel` |
| Siswa | NISN | NISN | `/siswa/dashboard` | `siswa` |
| Pengurus Kelas | NISN | NISN | `/pengurus_kelas/dashboard` | `pengurus_kelas` |

---

## Network Tab Inspection

### Login Request
```
POST /api/auth/login
Headers:
  Content-Type: application/json
  Accept: application/json

Body:
  {
    "login": "identifier",
    "password": "password"
  }
```

### Expected Response
```
Status: 200 OK
{
  "token": "...",
  "user": {
    "id": 1,
    "role": "waka",
    ...
  }
}
```

### School Settings Request
```
GET /api/settings/public

Response:
{
  "school_name": "SMKN 2 SINGOSARI",
  "school_logo_url": "...",
  "school_mascot_url": "..."
}
```

---

## Environment Setup

### Development (.env)
```bash
VITE_API_URL=http://localhost:8000/api
```

### Production (.env.production)
```bash
VITE_API_URL=https://yourdomain.com/api
```

### Verify Build
```bash
cd deskta
npm run build

cd ../frontend  
npm run build

cd ../kosongan/Website-UI
npm run build
```

---

## Quick Fixes

### "Login gagal" error
1. Check network tab for API response
2. Verify API is running: `php artisan serve`
3. Check database for user account
4. Verify `users.active = true`

### Wrong dashboard after login
1. Check localStorage `userRole` value
2. Verify role normalization logic
3. Check route guards in App.tsx/App.jsx

### Landing page shows "Memuat..." forever
1. Check API endpoint: `curl http://localhost:8000/api/settings/public`
2. Verify API is responding
3. Check browser console for errors
4. Check CORS configuration

### Token not persisting
1. Check localStorage in DevTools
2. Verify login API returns token
3. Check if localStorage is being cleared elsewhere
4. Try incognito/private window

---

## Debugging Tips

### Check All Three Apps
1. **Deskta** (Desktop): `cd deskta && npm run dev`
2. **Frontend** (Web): `cd frontend && npm run dev`
3. **Website-UI**: `cd kosongan/Website-UI && npm run dev`

### Backend Logs
```bash
# Terminal 1: PHP Server
cd backend
php artisan serve

# Terminal 2: Watch logs
tail -f storage/logs/laravel.log
```

### Browser DevTools
- **Console**: Check for JavaScript errors
- **Network**: Inspect API calls and responses
- **Application**: Check localStorage and cookies
- **Elements**: Check authenticated elements visibility

### API Testing Tool
```bash
# Install HTTPie (optional)
brew install httpie

# Test login
http POST http://localhost:8000/api/auth/login \
  login=waka_user \
  password=password
```

---

## Success Indicators

✅ Landing page shows school logo and name
✅ Login form shows correct field labels for selected role
✅ Login succeeds with correct credentials
✅ localStorage contains token and user data with correct role
✅ Redirected to correct dashboard for user role
✅ Can access role-specific features
✅ Logout clears token and returns to landing page
✅ All three apps (Deskta, Frontend, Website-UI) work identically

---

**If issues persist, check [AUTH-FIXES-SUMMARY.md](AUTH-FIXES-SUMMARY.md) for detailed architecture documentation.**
