# Registration Flow Quick Reference

## User-Facing Pages

### Step 1: Check Employee & Phone
- **URL:** `http://localhost:3000/register`
- **File:** `/app/register/page.tsx`
- **Form Fields:**
  - Employee Number (text, max 5, auto uppercase)
  - Phone Number (tel, default "260", max 12)
- **On Submit:** Calls POST `/api/auth/register/check-employee`
- **Success:** Stores data in sessionStorage, redirects to Step 2
- **Errors:** Toast notifications for employee not found, already registered, OTP send failure

### Step 2: Verify OTP
- **URL:** `http://localhost:3000/register/otp-verification`
- **File:** `/app/register/otp-verification/page.tsx`
- **Form Fields:**
  - OTP Code (text, max 6 digits)
  - Display: Phone number where OTP was sent (+260...)
- **On Submit:** Calls POST `/api/auth/register/verify-otp`
- **Success:** Updates sessionStorage with otpVerified flag, redirects to Step 3
- **Errors:** Toast notifications for invalid OTP format or verification failure
- **Back Button:** Returns to Step 1

### Step 3: Create Account
- **URL:** `http://localhost:3000/register/create-account`
- **File:** `/app/register/create-account/page.tsx`
- **Form Fields:**
  - User ID (required, unique)
  - Full Name (required)
  - Email Address (required, validated)
  - Phone Number (pre-filled from Step 1, read-only)
  - NRC (required)
  - Password (min 6 chars, password toggle)
  - Confirm Password (must match)
- **On Submit:** Calls POST `/api/auth/register/create-account`
- **Success:** Clears sessionStorage, shows success toast, redirects to /login after 2s
- **Errors:** Toast notifications for validation failures or creation errors
- **Back Button:** Returns to Step 2

---

## API Routes

### POST /api/auth/register/check-employee
- **File:** `/app/api/auth/register/check-employee/route.ts`
- **Request Body:**
  ```json
  {
    "employee_number": "12345",
    "phone_number": "260123456789"
  }
  ```
- **Response (Success 200):**
  ```json
  {
    "success": true,
    "message": "Check employee successful",
    "otp_result": "123456"
  }
  ```
- **SOAP Calls:**
  1. EmployeeExist(employeeNumber) → must return "1"
  2. WebUserExist(employeeNumber) → must return "0"
  3. SendOTP(employeeNumber, accountNumber, phoneNumber) → returns OTP
- **Error Codes:**
  - 400: Missing required fields
  - 401: Employee not found / Already registered
  - 409: User already registered
  - 500: OTP send failure
- **Terminal Output:** Detailed SOAP request/response logging

### POST /api/auth/register/verify-otp
- **File:** `/app/api/auth/register/verify-otp/route.ts`
- **Request Body:**
  ```json
  {
    "employee_number": "12345",
    "otp": "123456"
  }
  ```
- **Response (Success 200):**
  ```json
  {
    "success": true,
    "message": "OTP verified successfully"
  }
  ```
- **Validation:**
  - OTP must be exactly 6 digits
- **Error Codes:**
  - 400: OTP format invalid or missing fields
  - 500: Internal server error
- **Terminal Output:** OTP validation status and result

### POST /api/auth/register/create-account
- **File:** `/app/api/auth/register/create-account/route.ts`
- **Request Body:**
  ```json
  {
    "user_id": "john.doe",
    "full_name": "John Doe",
    "email_address": "john@example.com",
    "phone_number": "260123456789",
    "nrc": "123456789",
    "password": "securePassword123",
    "employee_number": "12345"
  }
  ```
- **Response (Success 201):**
  ```json
  {
    "success": true,
    "message": "Account created successfully",
    "user_id": "john.doe"
  }
  ```
- **SOAP Calls:**
  1. CreateWebUser(userId, fullName, emailAddress, phoneNumber, nRC, employeeNumber, "MWS Portal")
- **Local Storage:**
  - Hashed password saved with WebUser record
- **Error Codes:**
  - 400: Missing required fields
  - 500: SOAP CreateWebUser failure or password hashing error
- **Terminal Output:**
  - Detailed SOAP CreateWebUser request/response
  - Password hashing confirmation
  - Final account creation status

---

## sessionStorage Data Structure

**Key:** `registrationData`

**Step 1 (After check-employee success):**
```json
{
  "employee_number": "12345",
  "phone_number": "260123456789",
  "otp_result": "123456"
}
```

**Step 2 (After OTP verification):**
```json
{
  "employee_number": "12345",
  "phone_number": "260123456789",
  "otp_result": "123456",
  "otpVerified": true
}
```

**Step 3 (After account creation):**
- **Cleared from sessionStorage**
- User redirected to `/login`

---

## Business Central SOAP Details

### WebService URL
```
http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebAPI
```

### Authentication
```
Username: WEBUSER
Password: Pass@123!$
Method: Basic Auth (Base64 encoded)
```

### SOAP Functions Used in Registration

#### EmployeeExist(employeeNumber)
- **Purpose:** Check if employee exists in Business Central
- **Returns:** "1" = exists, "0" = not found
- **Used in:** Step 1 (check-employee)

#### WebUserExist(employeeNumber)
- **Purpose:** Check if employee already registered as web user
- **Returns:** "1" = already registered, "0" = not registered yet
- **Used in:** Step 1 (check-employee)

#### SendOTP(employeeNumber, accountNumber, phoneNumber)
- **Purpose:** Send OTP code to employee's phone number
- **Parameters:**
  - employeeNumber: Employee ID
  - accountNumber: Employee account number
  - phoneNumber: Phone number to send OTP to (e.g., "260123456789" without "+")
- **Returns:** Numeric OTP code (e.g., "123456")
- **Used in:** Step 1 (check-employee)

#### CreateWebUser(userId, fullName, emailAddress, phoneNumber, nRC, employeeNumber, registeredFrom)
- **Purpose:** Create new web user account in Business Central
- **Parameters:**
  - userId: Unique user identifier
  - fullName: User's full name
  - emailAddress: User's email address
  - phoneNumber: User's phone number
  - nRC: National Registration Card number
  - employeeNumber: Associated employee number
  - registeredFrom: "MWS Portal"
- **Returns:** "1" = success, "0" = failure
- **Used in:** Step 3 (create-account)

---

## UI Components Used

- `@/components/ui/input` - Text input fields
- `@/components/ui/button` - Submit buttons
- `lucide-react` icons - User, Lock, Mail, ArrowLeft, Hash, Eye, EyeOff
- `@/hooks/use-toast` - Toast notifications
- Next.js `useRouter` - Page navigation
- `useSession` (if protected) - Session validation

---

## Flow Summary

```
1. User visits /register
   ↓
2. Enters Employee Number & Phone Number
   ↓
3. POST check-employee → SOAP validation + OTP send
   ↓
4. Redirected to /register/otp-verification
   ↓
5. Enters 6-digit OTP
   ↓
6. POST verify-otp → OTP format validation
   ↓
7. Redirected to /register/create-account
   ↓
8. Enters User ID, Full Name, Email, NRC, Password
   ↓
9. POST create-account → SOAP CreateWebUser + Password hash
   ↓
10. Redirected to /login
    ↓
11. User can now log in with credentials
```

---

## Important Notes

- **Phone Number Handling:** 
  - Displayed as "+260..." to user
  - Stored in sessionStorage as "260..." (no +)
  - Sent to SOAP API as "260..." (no +)

- **Terminal Logging:** 
  - All SOAP requests logged with formatted output
  - Success/failure indicated with ✅/❌ symbols
  - Timestamps included for debugging

- **Data Persistence:**
  - sessionStorage used for multi-page flow
  - Cleared on successful account creation
  - Lost if browser tab closed

- **Error Recovery:**
  - Back buttons allow users to return to previous step
  - All validation errors shown in toasts
  - Session data preserved during validation failures

- **Security:**
  - Passwords hashed with bcryptjs before storage
  - HTTPS-ready with proper SOAP authentication
  - HTTP-only cookies for session management after login
