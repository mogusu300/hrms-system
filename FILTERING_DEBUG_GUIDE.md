# 🔍 Request Tracking Filtering - Debugging Guide

**Date:** February 16, 2026  
**Purpose:** Help diagnose why filtered requests show empty results

---

## ⚠️ Problem: Empty Results with No Errors

If you're seeing empty request lists even though the user has documents in Business Central, follow these steps:

---

## 🧪 Step 1: Check Session is Being Created

### Action:
1. Open browser DevTools (F12)
2. Go to Application → Cookies
3. Look for `session` cookie
4. Check its value contains `employee_number`

### Expected:
```json
{
  "employee_number": "M1174",
  "timestamp": 1707331200000
}
```

### If Missing:
- ❌ Login failed or session not set
- ❌ Try logging in again
- ❌ Check for errors in browser console

---

## 🧪 Step 2: Check Console Logs (Server-Side)

### Action:
1. Open your terminal/console where Next.js is running
2. Navigate to any tracking page (e.g., Leave Applications)
3. Check the server console output

### Look For:

```
╔════════════════════════════════════════════════════════════╗
║          GET LEAVE APPLICATIONS - START                   ║
╚════════════════════════════════════════════════════════════╝

🔐 Session Check: ✅ Found
✅ Session extracted - Employee: "M1174"

📡 Fetching from OData: http://41.216.68.50:7248/...

📊 Total Leaves from Business Central: 5
📋 First Leave Record Sample:
   Keys: Man_Number, Document_No, Status, ...
   Man_Number: "M1174"

╔════════════════════════════════════════════════════════════╗
║            FILTER REQUESTS BY EMPLOYEE                    ║
╚════════════════════════════════════════════════════════════╝

🔍 Logged-in Employee: "M1174"
📊 Total Requests from BC: 5
🏷️  Field to Match: "Man_Number"

📋 Sample of first 3 requests:
   [1] Man_Number: "M1174" | Keys: Man_Number, Document_No...
   [2] Man_Number: "M1175" | Keys: Man_Number, Document_No...
   [3] Man_Number: "M1174" | Keys: Man_Number, Document_No...

✅ Filtered Results: 2 requests matched

✅ Final result to send to client: 2 leaves
```

---

## 🔍 Diagnostic Issues & Solutions

### Issue 1: "🔐 Session Check: ❌ Not Found"

**Problem:** Session cookie not being read

**Solutions:**
1. ✅ Clear browser cookies and login again
2. ✅ Check if in incognito/private mode (might not save cookies)
3. ✅ Check if `httpOnly` flag is causing issues
4. ✅ Verify middleware allows the API endpoint

**Check Middleware:**
```typescript
// middleware.ts should allow /api/leave-applications
const publicRoutes = ['/login', '/register', '/api/auth/login'];
```

---

### Issue 2: "❌ No employee number in session - returning empty array"

**Problem:** Session exists but `employee_number` field is missing

**Solutions:**
1. ✅ Check login endpoint is setting `employee_number` correctly
2. ✅ Verify session cookie format matches:
   ```json
   { "employee_number": "M1174", "timestamp": ... }
   ```
3. ✅ Don't use other names like `userId`, `manNumber`, etc.

**Fix if needed:**
- Go to login route and verify:
```typescript
response.cookies.set('session', JSON.stringify({
  employee_number: employee_number,  // Must be this exact key
  timestamp: Date.now(),
}), { /* ... */ });
```

---

### Issue 3: "📊 Total Leaves from Business Central: 0"

**Problem:** No data returned from Business Central OData

**Solutions:**
1. ✅ OData endpoint might be down
2. ✅ Credentials (WEBUSER/Pass@123!$) might be wrong
3. ✅ URL might be incorrect:
   ```
   http://41.216.68.50:7248/BusinessCentral142/OData/Company('Mulonga%20Water%20Supply')/LeaveApplication
   ```
4. ✅ Network connectivity issue

**Check:**
- Try accessing the OData URL directly in Postman
- Verify Basic Auth credentials work
- Check if Business Central is running

---

### Issue 4: "No requests matched for employee..."

**Problem:** Data returned but no employee matches

**Cause:** Employee number format mismatch

**Examples:**
```
Session has: "M1174"
Business Central has: "M1174 "      ← Space at end (trimmed automatically)
Business Central has: "m1174"       ← Lowercase (uppercased automatically)
Business Central has: "E1174"       ← Different code
```

**Debugging:**
1. Look at console log: "Man_Number: '...'"
2. Compare exactly with session value
3. Check for:
   - Extra spaces
   - Different case
   - Different prefix

**If Format is Different:**
- Modify `employeeFieldName` parameter
- Example: Some systems might use `Employee_Code` instead of `Man_Number`

---

### Issue 5: "Man_Number: NO ❌"

**Problem:** Request objects don't have `Man_Number` field

**Solution:** Field name is wrong

**Check:**
1. Look at first request keys: `Keys: ...`
2. Find the correct field name (might be):
   - `Employee_Number`
   - `EmpNumber`
   - `ManNumber` (without underscore)
   - `Employee_No`
   - `Emp_Code`

**Fix:**
Update the filtering call:
```typescript
// Change from:
filterRequestsByEmployee(leaves, employeeNumber, 'Man_Number')

// To (example):
filterRequestsByEmployee(leaves, employeeNumber, 'Employee_Number')
```

---

## 📊 Debug Checklist

Use this checklist to verify everything is working:

```
SESSION CHECKS
[ ] Session cookie exists in browser
[ ] Session contains employee_number key
[ ] employee_number has correct format (e.g., "M1174")
[ ] Console shows "✅ Session extracted"

DATA FETCHING
[ ] OData endpoint returns data (not empty)
[ ] Status is OK (200)
[ ] JSON parses correctly
[ ] First request shows all expected fields

FIELD MATCHING
[ ] Correct field name is in use
[ ] Field values exist in data
[ ] Field values match session format
[ ] Case/spacing is consistent

FILTERING
[ ] Employee number is found
[ ] Matching logic runs
[ ] At least 1 record should match
[ ] If no matches, verify field name
```

---

## 🔧 Temporary Fix: Disable Filtering

If you need to quickly disable filtering to verify data is being fetched:

**In `lib/approval.ts`:**
```typescript
export function filterRequestsByEmployee(
  requests: any[],
  loggedInEmployeeNumber: string | undefined,
  employeeFieldName: string = 'Man_Number',
  employeeNameFieldName?: string
): any[] {
  // TEMPORARY: Return all data without filtering
  return requests;
  
  // Original logic below (commented out for testing)
  /*
  if (!loggedInEmployeeNumber || !Array.isArray(requests)) {
    return [];
  }
  ...
  */
}
```

**After testing:** Remember to restore the original filtering logic!

---

## 🧪 Manual Testing Steps

### Test 1: Check Session Extraction
1. Login as employee M1174
2. Open DevTools Console (F12)
3. Run: `document.cookie`
4. Should see session cookie with `employee_number`

### Test 2: Check API Response
1. Open DevTools Network tab
2. Navigate to Leave Applications
3. Find `GET /api/leave-applications` request
4. Check Response - should show array of leaves (or empty if no leaves)

### Test 3: Check Server Logs
1. Look at terminal running `npm run dev`
2. Should see detailed logging like above
3. Follow the flow to find where it breaks

### Test 4: Test Different Employee
1. Logout
2. Login as different employee (M1175)
3. Check if they see different leaves
4. Verify filtering is working correctly

---

## 📱 Real-World Test Scenarios

### Scenario 1: Employee with 1 Request
```
Session: M1174
Business Central Data: 5 leaves total
  - M1174 (1 leave)
  - M1175 (2 leaves)
  - M1176 (2 leaves)
Expected: 1 leaf shown
```

### Scenario 2: Employee with No Requests
```
Session: M1177
Business Central Data: 5 leaves total
  - M1174 (1 leave)
  - M1175 (2 leaves)
  - M1176 (2 leaves)
Expected: Empty array (0 leaves)
```

### Scenario 3: Employee with Multiple Requests
```
Session: M1174
Business Central Data: 5 leaves total
  - M1174 (3 leaves)
  - M1175 (1 leaf)
  - M1176 (1 leaf)
Expected: 3 leaves shown
```

---

## 💡 Quick Fixes

### Quick Fix 1: Wrong Field Name
```typescript
// If Man_Number doesn't exist, try:
filterRequestsByEmployee(leaves, employeeNumber, 'Employee_Number')
filterRequestsByEmployee(leaves, employeeNumber, 'EmpNumber')
filterRequestsByEmployee(leaves, employeeNumber, 'Emp_Code')
```

### Quick Fix 2: Session Not Set Properly
Check login endpoint returns:
```typescript
response.cookies.set('session', JSON.stringify({
  employee_number: employee_number,  // MUST use this key name
  timestamp: Date.now(),
}), {
  httpOnly: true,
  maxAge: 86400,
  path: '/',
});
```

### Quick Fix 3: Temporarily Show All Data
```typescript
// Add before filtering to see if data exists:
console.log('ALL LEAVES:', JSON.stringify(leaves, null, 2));
```

---

## 📞 Getting Help

If you're still stuck, collect this information:

1. ✅ Server console output (screenshot or paste)
2. ✅ Session cookie value (DevTools → Application → Cookies)
3. ✅ First few records from Business Central (paste JSON response)
4. ✅ Employee number being used for test
5. ✅ Which tracking module shows empty (leaves, work orders, etc.)

---

## 📝 Notes

- All console logs are now **detailed and descriptive**
- Logs show the full flow: Session → Fetch → Filter → Return
- If you don't see all the logs, check server terminal (not browser console)
- Remove logging once issue is fixed (for production)

---

**Next Step:** Run the debugging steps above and report what you see in the server console!

