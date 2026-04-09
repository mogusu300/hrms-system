# 📊 Request Tracking Filtering - Implementation Summary

**Date:** February 16, 2026  
**Status:** ✅ Complete  
**Module:** Employee-Scoped Request Tracking

---

## 🎯 Overview

All tracking modules have been updated to **filter and display only requests belonging to the logged-in user**. Each tracking endpoint now:

1. ✅ Extracts the logged-in employee's number from the session cookie
2. ✅ Fetches all requests from Business Central
3. ✅ Filters results to match the employee number
4. ✅ Returns only requests belonging to the logged-in user

---

## 📋 Updated Tracking Modules (5 Endpoints)

### 1. **Leave Applications** ✅
**File:** [app/api/leave-applications/route.ts](app/api/leave-applications/route.ts)
- **Endpoint:** `GET /api/leave-applications`
- **Field Matched:** `Man_Number`
- **Behavior:** Returns only leave applications submitted by the logged-in employee
- **Example:** Employee "M1174" sees only leave requests with `Man_Number = "M1174"`

### 2. **Work Orders** ✅
**File:** [app/api/work-orders/route.ts](app/api/work-orders/route.ts)
- **Endpoint:** `GET /api/work-orders`
- **Field Matched:** `Man_Number`
- **Behavior:** Returns only work orders assigned to or submitted by the logged-in employee
- **Example:** Employee "M1174" sees only work orders with `Man_Number = "M1174"`

### 3. **Transport Requests** ✅
**File:** [app/api/transport-requests/route.ts](app/api/transport-requests/route.ts)
- **Endpoint:** `GET /api/transport-requests`
- **Field Matched:** `Man_Number`
- **Behavior:** Returns only transport requests submitted by the logged-in employee
- **Example:** Employee "M1174" sees only requests with `Man_Number = "M1174"`

### 4. **Staff Advances** ✅
**File:** [app/api/staff-advances-tracking/route.ts](app/api/staff-advances-tracking/route.ts)
- **Endpoint:** `GET /api/staff-advances-tracking`
- **Field Matched:** `Man_Number`
- **Behavior:** Returns only staff advance requests submitted by the logged-in employee
- **Note:** When `document_no` parameter is provided, returns single record (if it belongs to user)
- **Example:** Employee "M1174" sees only advances with `Man_Number = "M1174"`

### 5. **Stores Tracking** ✅
**File:** [app/api/stores-tracking/route.ts](app/api/stores-tracking/route.ts)
- **Endpoint:** `GET /api/stores-tracking`
- **Field Matched:** `Man_Number`
- **Behavior:** Returns only store transactions submitted by or assigned to the logged-in employee
- **Note:** When `document_no` parameter is provided, returns single record (if it belongs to user)
- **Example:** Employee "M1174" sees only store transactions with `Man_Number = "M1174"`

### 6. **Purchase Tracking** ✅
**File:** [app/api/purchase-tracking/route.ts](app/api/purchase-tracking/route.ts)
- **Endpoint:** `GET /api/purchase-tracking`
- **Field Matched:** `Man_Number`
- **Behavior:** Returns only purchase requisitions submitted by the logged-in employee
- **Example:** Employee "M1174" sees only purchases with `Man_Number = "M1174"`

---

## 🔧 Core Implementation Changes

### **New Utility Function Added**
**File:** [lib/approval.ts](lib/approval.ts)

```typescript
/**
 * Filter requests to show only those belonging to the logged-in employee
 * Matches against employee_number field, then falls back to name matching
 */
export function filterRequestsByEmployee(
  requests: any[],
  loggedInEmployeeNumber: string | undefined,
  employeeFieldName: string = 'Man_Number',
  employeeNameFieldName?: string
): any[]
```

**Features:**
- Case-insensitive matching
- Handles whitespace normalization
- Returns empty array if no session found
- Type-safe with TypeScript

### **Session Integration**
Each tracking endpoint now:
1. Calls `getEmployeeNumberFromSession(req.cookies)` to get logged-in employee number
2. Uses `filterRequestsByEmployee()` to filter results
3. Returns filtered array to client

---

## 💻 Code Pattern Example

### Before (Without Filtering)
```typescript
export async function GET(req: NextRequest) {
  const res = await fetch(ODATA_URL, { /* ... */ });
  const data = JSON.parse(raw);
  const requests = Array.isArray(data.value) ? data.value : [];
  return NextResponse.json(requests);  // ❌ Returns ALL requests
}
```

### After (With Filtering)
```typescript
import { getEmployeeNumberFromSession, filterRequestsByEmployee } from '@/lib/approval';

export async function GET(req: NextRequest) {
  // Get logged-in employee number from session
  const employeeNumber = getEmployeeNumberFromSession(req.cookies);
  
  const res = await fetch(ODATA_URL, { /* ... */ });
  const data = JSON.parse(raw);
  const requests = Array.isArray(data.value) ? data.value : [];
  
  // Filter requests to show only those from logged-in employee
  const filteredRequests = filterRequestsByEmployee(requests, employeeNumber, 'Man_Number');
  
  return NextResponse.json(filteredRequests);  // ✅ Returns ONLY user's requests
}
```

---

## 🔍 Filtering Logic

### Matching Strategy
1. **Primary Match:** Employee number field (`Man_Number`)
2. **Normalization:** Both strings converted to uppercase and trimmed
3. **Comparison:** Exact match required
4. **Result:** Only matching records returned

### Example Flow
```
Session Cookie
    ↓
Extract: employee_number = "M1174"
    ↓
Fetch all requests from Business Central
[
  { Man_Number: "M1174", Document_No: "PO001", ... },  ✅ Match
  { Man_Number: "M1175", Document_No: "PO002", ... },  ❌ No match
  { Man_Number: "M1174", Document_No: "PO003", ... }   ✅ Match
]
    ↓
Filter by employee number
[
  { Man_Number: "M1174", Document_No: "PO001", ... },
  { Man_Number: "M1174", Document_No: "PO003", ... }
]
    ↓
Return filtered array to client
```

---

## 🛡️ Security Benefits

### ✅ Data Isolation
- Users only see their own requests
- No access to other employees' data
- Session-based authentication enforced

### ✅ Privacy
- Approved filtering happens server-side
- Client cannot override filters
- Employee number extracted securely from session

### ✅ Consistency
- All tracking modules use same filtering logic
- Centralized utility function ensures consistency
- Easy to audit and maintain

---

## 📱 User Experience Impact

### Before Implementation
- Employee sees ALL requests in the system
- Must manually identify their own requests
- Confusion with large dataset

### After Implementation
- Employee sees ONLY their own requests
- Cleaner, focused dashboard
- Better performance on large datasets
- Improved usability

---

## 🧪 Testing Recommendations

### Manual Testing
```bash
# 1. Login as Employee M1174
# 2. Navigate to leave applications
# 3. Verify only M1174's leaves are displayed
# 4. Check database - confirm other employees' leaves are NOT shown

# 5. Repeat for each tracking module:
#    - Work Orders
#    - Transport Requests
#    - Staff Advances
#    - Stores Tracking
#    - Purchase Tracking
```

### Verification Points
- ✅ Session cookie contains correct `employee_number`
- ✅ API returns only matching records
- ✅ Filtering happens before sending to client
- ✅ Empty array returned if no matches
- ✅ Each employee sees different data

---

## 📊 Fields Being Matched

| Module | OData Entity | Field Name | Type | Example |
|--------|-------------|-----------|------|---------|
| Leave Applications | LeaveApplication | Man_Number | String | M1174 |
| Work Orders | WorkOrders | Man_Number | String | M1174 |
| Transport Requests | TransportRequest | Man_Number | String | M1174 |
| Staff Advances | StaffAdvance | Man_Number | String | M1174 |
| Stores Tracking | StoresTracking | Man_Number | String | M1174 |
| Purchase Tracking | PurchaseTracking | Man_Number | String | M1174 |

---

## 🚀 Future Enhancements

### Possible Extensions
1. **Name-Based Fallback**: If `Man_Number` not found, match by employee name
2. **Multiple Fields**: Match against multiple identifying fields
3. **Department Filtering**: Show requests from entire department (admin only)
4. **Status-Based Filtering**: Filter by approval status
5. **Date Range Filtering**: Show recent requests only

### Recommended Next Steps
1. Test with multiple users
2. Monitor performance with large datasets
3. Consider caching filtered results
4. Add audit logging for data access
5. Implement role-based filtering for managers/approvers

---

## 📝 Files Modified

### Core Files
1. ✅ `lib/approval.ts` - Added `filterRequestsByEmployee()` function
2. ✅ `app/api/leave-applications/route.ts` - Added filtering
3. ✅ `app/api/work-orders/route.ts` - Added filtering
4. ✅ `app/api/transport-requests/route.ts` - Added filtering
5. ✅ `app/api/staff-advances-tracking/route.ts` - Added filtering
6. ✅ `app/api/stores-tracking/route.ts` - Added filtering
7. ✅ `app/api/purchase-tracking/route.ts` - Added filtering

### Total Changes
- **Files Modified:** 7
- **Lines Added:** ~50
- **New Function:** 1 (`filterRequestsByEmployee`)
- **Modules Updated:** 6
- **Breaking Changes:** None (backward compatible)

---

## ✅ Validation Checklist

- [x] All tracking endpoints updated
- [x] Session extraction working
- [x] Filtering logic implemented
- [x] TypeScript compilation passes
- [x] No breaking changes
- [x] Backward compatible
- [x] Error handling included
- [x] Case-insensitive matching
- [x] Whitespace normalization
- [x] Empty array on no session
- [x] Empty array on no matches

---

## 🎓 Developer Notes

### Adding Filtering to New Endpoints

To add filtering to a new tracking endpoint:

1. Import utilities:
```typescript
import { getEmployeeNumberFromSession, filterRequestsByEmployee } from '@/lib/approval';
```

2. In GET handler:
```typescript
const employeeNumber = getEmployeeNumberFromSession(req.cookies);
const filteredData = filterRequestsByEmployee(data, employeeNumber, 'Man_Number');
```

3. Return filtered data:
```typescript
return NextResponse.json(filteredData);
```

### Important Notes
- Always use `Man_Number` field for matching (Business Central standard)
- Handle case sensitivity (function does this automatically)
- Return empty array if no session
- Return empty array if no matches
- Keep filtering logic in `lib/approval.ts` for consistency

---

**Status:** ✅ Complete and Ready for Testing  
**Performance Impact:** Minimal (filtering done in-memory after fetch)  
**Security Level:** High (server-side filtering, session-based)  
**User Impact:** Positive (cleaner, focused view of their data)

