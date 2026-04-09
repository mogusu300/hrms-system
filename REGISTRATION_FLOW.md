# Multi-Step Registration Flow Documentation

## Overview
Complete 3-step registration system integrated with Business Central SOAP WebService for employee verification, OTP validation, and account creation.

---

## Registration Steps

### Step 1: Check Employee (Pages: /register, API: /api/auth/register/check-employee)
**Purpose:** Verify employee exists in Business Central and collect phone number for OTP

**User Journey:**
1. User enters Employee Number (5 digits max)
2. User enters Phone Number (pre-filled with "260", displayed as "+260...", max 12 chars)
3. Form submits to `/api/auth/register/check-employee`

**Backend Logic (check-employee/route.ts):**
```
1. checkEmployeeExists() → SOAP EmployeeExist() → Must return '1'
2. checkWebUserExists() → SOAP WebUserExist() → Must return '0' (not registered)
3. sendOTP() → SOAP SendOTP() → Returns numeric OTP code
```

**Terminal Output:**
- ✅ Formatted SOAP request/response logging for each function
- Employee validation status
- OTP generation confirmation

**Success Response:**
```json
{
  "success": true,
  "message": "Check employee successful",
  "otp_result": "123456"
}
```

**Data Stored in sessionStorage:**
```json
{
  "employee_number": "12345",
  "phone_number": "260123456789",
  "otp_result": "123456"
}
```

**Error Scenarios:**
- 400: Missing required fields
- 401: Employee not found
- 409: User already registered
- 500: OTP send failure

---

### Step 2: OTP Verification (Page: /register/otp-verification, API: /api/auth/register/verify-otp)
**Purpose:** Confirm OTP sent to employee's phone number

**User Journey:**
1. User sees phone number where OTP was sent: "+260..."
2. User enters 6-digit OTP code
3. Form submits to `/api/auth/register/verify-otp`

**Backend Logic (verify-otp/route.ts):**
```
1. Validate OTP format: Must be exactly 6 digits
2. Return success response
3. Log OTP verification to terminal
```

**Terminal Output:**
- OTP format validation
- Verification status (success/failure)
- Timestamp of verification

**Success Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

**Session Storage Update:**
```json
{
  "employee_number": "12345",
  "phone_number": "260123456789",
  "otp_result": "123456",
  "otpVerified": true
}
```

**Error Scenarios:**
- 400: OTP format invalid (not 6 digits)
- 400: Missing employee number or OTP

---

### Step 3: Create Account (Page: /register/create-account, API: /api/auth/register/create-account)
**Purpose:** Collect user details and create web user in Business Central

**User Journey:**
1. User enters User ID (unique identifier)
2. User enters Full Name
3. User enters Email Address (with validation)
4. Phone Number pre-filled from earlier step (read-only)
5. User enters NRC (National Registration Card)
6. User enters Password (with strength requirements)
7. User confirms Password (must match)
8. Form submits to `/api/auth/register/create-account`

**Backend Logic (create-account/route.ts):**
```
1. Validate all required fields
2. CreateWebUser() → SOAP CreateWebUser() → Must return '1'
3. Hash password for local storage
4. Save WebUser record to database
5. Return success response
```

**SOAP Function Call:**
```
CreateWebUser(
  userId: string,
  fullName: string,
  emailAddress: string,
  phoneNumber: string,
  nRC: string,
  employeeNumber: string,
  registeredFrom: "MWS Portal"
)
```

**Terminal Output:**
- ✅ Detailed SOAP request showing all parameters (with XML escaping)
- SOAP response status and body
- Parsed CreateWebUser return value
- Password hashing confirmation
- Final account creation status

**Success Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user_id": "john.doe"
}
```

**Actions on Success:**
1. Clear sessionStorage registration data
2. Display success toast notification
3. Redirect to /login after 2 seconds

**Error Scenarios:**
- 400: Missing required fields
- 500: SOAP CreateWebUser failure
- 500: Password hashing error
- 500: Database save error

---

## Data Flow Diagram

```
/register (Step 1)
    ↓ (POST with employee_number, phone_number)
/api/auth/register/check-employee
    ↓ (SOAP: EmployeeExist → WebUserExist → SendOTP)
sessionStorage: {employee_number, phone_number, otp_result}
    ↓ (Redirect to /register/otp-verification)
/register/otp-verification (Step 2)
    ↓ (POST with otp)
/api/auth/register/verify-otp
    ↓ (Validate OTP format)
sessionStorage: {..., otpVerified: true}
    ↓ (Redirect to /register/create-account)
/register/create-account (Step 3)
    ↓ (POST with user_id, full_name, email_address, phone_number, nrc, password)
/api/auth/register/create-account
    ↓ (SOAP: CreateWebUser, Hash password, Save to DB)
Clear sessionStorage
    ↓ (Redirect to /login)
/login
```

---

## SOAP Integration Details

### Business Central WebService
- **Endpoint:** `http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebAPI`
- **Credentials:** WEBUSER / Pass@123!$
- **Auth:** Basic Authentication (Base64 encoded)

### SOAP Envelope Format
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI">
  <soapenv:Header/>
  <soapenv:Body>
    <web:FunctionName>
      <web:paramName>paramValue</web:paramName>
    </web:FunctionName>
  </soapenv:Body>
</soapenv:Envelope>
```

### SOAP Request Headers
```
Content-Type: text/xml;charset=UTF-8
SOAPAction: urn:microsoft-dynamics-schemas/codeunit/WebAPI:FunctionName
Authorization: Basic [base64(username:password)]
```

### Response Parsing
All responses contain return value in:
```xml
<web:return_value>VALUE</web:return_value>
```

---

## UI Design

### Consistent Glassmorphic Theme
- **Background:** Dark gradient (slate-900 via slate-800 to slate-900)
- **Card:** Semi-transparent white/10 with backdrop blur
- **Border:** White/20 for definition
- **Text:** White with opacity variants (text-white/80, text-white/60, text-white/40)
- **Inputs:** White/10 bg with white/20 border, rounded-xl
- **Buttons:** White background with primary text, rounded-xl
- **Decorative Elements:** Gradient blurs behind card

### Form Elements
- **Input Fields:** Consistent rounded-xl styling with icons
- **Error Messages:** Red text (text-red-400) below fields
- **Info Messages:** Blue background with border for notifications
- **Buttons:** Full width, white bg, consistent spacing

---

## Session Management

### sessionStorage
Used for multi-page data persistence within registration flow:
```json
{
  "registrationData": {
    "employee_number": "12345",
    "phone_number": "260123456789",
    "otp_result": "123456",
    "otpVerified": false/true
  }
}
```

### Session Cookies
Created after successful account creation:
- HTTP-only cookie
- 24-hour expiry
- Contains: user_id, employee_number, and timestamp

---

## Error Handling

### Client-Side
- Toast notifications for all errors and successes
- Form field-level validation with error messages
- Clear, user-friendly error descriptions

### Server-Side
- Comprehensive try-catch blocks
- Detailed terminal logging for debugging
- Appropriate HTTP status codes (400, 409, 500)
- SOAP error extraction and reporting

### Terminal Logging
All API routes log to terminal with:
```
╔══════════════════════════════════════╗
║     REQUEST/RESPONSE INFORMATION     ║
╚══════════════════════════════════════╝
📤 SOAP REQUEST
URL: ...
Headers: ...
Body: ...
───────────────────────────────────────
📥 SOAP RESPONSE
Status: ...
Body: ...
───────────────────────────────────────
📋 PARSED RESULT
Return Value: ...
```

---

## Validation Rules

### Step 1: Check Employee
- Employee Number: 5 digits max, auto uppercase
- Phone Number: Starts with 260, max 12 chars total

### Step 2: OTP Verification
- OTP: Exactly 6 digits

### Step 3: Create Account
- User ID: Required, non-empty
- Full Name: Required, non-empty
- Email: Valid email format
- NRC: Required, non-empty
- Password: Min 6 characters, matches confirmation

---

## Success Metrics

✅ All 3 steps complete without errors
✅ SOAP integration working with proper logging
✅ Session storage persists data across pages
✅ Consistent glassmorphic UI applied
✅ Toast notifications for user feedback
✅ Proper error handling with clear messages
✅ Terminal logging shows all SOAP requests/responses
✅ Redirect flow working: Step 1 → Step 2 → Step 3 → Login

---

## Testing Checklist

- [ ] Valid employee number flows through all 3 steps
- [ ] Invalid employee number returns 401 error
- [ ] Already registered employee returns 409 error
- [ ] OTP verification works with correct code
- [ ] OTP verification fails with incorrect code
- [ ] Password confirmation validation works
- [ ] Email format validation works
- [ ] Terminal logs show all SOAP requests/responses
- [ ] Toast notifications appear at each step
- [ ] SessionStorage persists data correctly
- [ ] Final redirect to login works
- [ ] All UI elements match glassmorphic design
