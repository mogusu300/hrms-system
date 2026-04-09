# Employee Details Auto-Population Implementation

**Status:** ✅ COMPLETE

## Overview
Implemented automatic population of employee details in all leave and advance request forms using the `/api/employee-details` endpoint. This ensures that employee number is auto-populated from the session, and other details like address and phone numbers are pre-filled where applicable.

---

## Implementation Summary

### Leave Request Form
**File:** `app/dashboard/requests/leave/page.tsx`

**Changes:**
- ✅ Auto-populates `employeeNumber` from session
- ✅ Fetches employee details using `/api/employee-details?manNumber={encodedEmpNumber}`
- ✅ Auto-fills `residentialAddress` from `employeeDetails.address`
- ✅ Auto-fills `phone1` from `employeeDetails.phone1`
- ✅ Auto-fills `phone2` from `employeeDetails.phone2`
- ✅ Sets `addressWhilstOnLeave` to same as residential address by default

**Fields Auto-Populated:**
```typescript
{
  employeeNumber: session.session?.employee_number,
  residentialAddress: employeeDetails.address,
  phone1: employeeDetails.phone1,
  phone2: employeeDetails.phone2,
  addressWhilstOnLeave: employeeDetails.address
}
```

**Backend Submission:**
The backend at `/api/leave-applications` receives:
```json
{
  "man_number": "EMP001",
  "reason_for_leave": "...",
  "residential_address": "123 Main St",
  "address_whilst_on_leave": "123 Main St",
  "phone1": "+1234567890",
  "phone2": "+1234567891",
  "leave_type": "Annual",
  "from_date": "2024-01-16",
  "to_date": "2024-01-20",
  "date_to_resume": "2024-01-21",
  "days_taken": 5,
  "days_commuted": 0
}
```

---

### Cash Advance Request Form
**File:** `app/dashboard/requests/cash-advance/page.tsx`

**Changes:**
- ✅ Auto-populates `employeeNumber` from session
- ✅ Fetches employee details (optional, not used for form fields)
- ✅ Uses corrected session key: `session.session?.employee_number`

**Note:** Cash advance doesn't require employee details for form pre-fill, but fetches it for consistency and future use.

---

### Salary Advance Request Form
**File:** `app/dashboard/requests/salary-advance/page.tsx`

**Changes:**
- ✅ Auto-populates `employeeNumber` from session
- ✅ Fetches employee details (optional, not used for form fields)
- ✅ Uses corrected session key: `session.session?.employee_number`

**Note:** Salary advance is a two-step process (header submission, then line items). Employee details fetched for consistency.

---

### Purchase Requisition Form
**File:** `app/dashboard/requests/purchase-requisition/page.tsx`

**Changes:**
- ✅ Auto-populates `employeeNumber` from session
- ✅ Fetches employee details (optional, not used for form fields)
- ✅ Uses corrected session key: `session.session?.employee_number`
- ✅ Maintains existing item loading logic from Business Central

**Note:** Purchase requisition is a multi-step process (header submission, then item selection). Employee details fetched for consistency.

---

### Stores Requisition Form
**File:** `app/dashboard/requests/stores-requisition/page.tsx`

**Changes:**
- ✅ Auto-populates `employeeNumber` from session
- ✅ Fetches employee details (optional, not used for form fields)
- ✅ Uses corrected session key: `session.session?.employee_number`
- ✅ Maintains existing item loading logic from Business Central

**Note:** Multi-step process similar to purchase requisition.

---

### Stores Return Form
**File:** `app/dashboard/requests/stores-return/page.tsx`

**Changes:**
- ✅ Auto-populates `employeeNumber` from session
- ✅ Fetches employee details (optional, not used for form fields)
- ✅ Uses corrected session key: `session.session?.employee_number`
- ✅ Maintains existing item loading logic from Business Central

**Note:** Multi-step process similar to stores requisition.

---

## Session Key Access Pattern

All request forms now use the corrected, unified session key pattern:

**Before (WRONG):**
```typescript
const empNumber = data.employeeNumber  // ❌ May not work with Django backend
```

**After (CORRECT):**
```typescript
const empNumber = sessionData.session?.employee_number || sessionData.employeeNumber
// ✅ Works with Django backend structure where session data is nested
```

---

## Employee Details API

**Endpoint:** `/api/employee-details?manNumber={encodedEmployeeNumber}`

**Response Fields:**
```typescript
{
  Full_Name: string,
  Department: string,
  job_title: string,
  phone1: string,
  phone2: string,
  address: string,
  workflow_route?: string,
  ... other fields
}
```

**Error Handling:**
- If employee details fetch fails, forms still work with employee number alone
- Graceful degradation: user can manually fill missing fields
- Console warning logged for debugging

---

## Backend Integration

### Leave Application Submission
**File:** `app/api/leave-applications/route.ts`

The backend now receives all required fields pre-filled:
- Employee number from session
- Address and phone from employee details API
- Dates calculated on frontend
- Days taken calculated from date range

**SOAP Call:** `InsertLeaveApplication` with complete payload including:
```xml
<web:manNumber>EMP001</web:manNumber>
<web:residentialAddress>123 Main St</web:residentialAddress>
<web:phone1>+1234567890</web:phone1>
<web:phone2>+1234567891</web:phone2>
<web:fromDate>2024-01-16</web:fromDate>
<web:todate>2024-01-20</web:todate>
<web:datetoResume>2024-01-21</web:datetoResume>
```

---

## Data Flow

### For Leave Requests (Complete Auto-Population):
```
User Logs In
    ↓
Session Created (session.employee_number)
    ↓
User Opens Leave Request Form
    ↓
Frontend fetches /api/session
    ↓
Gets employee_number from session
    ↓
Fetches /api/employee-details?manNumber=EMP001
    ↓
Gets address, phone1, phone2 from response
    ↓
Form auto-populated with:
  - Employee Number
  - Residential Address
  - Phone Numbers
  - Address While on Leave (same as residential)
    ↓
User fills in:
  - Leave Type
  - Reason for Leave
  - From Date, To Date, Resume Date
    ↓
Frontend calculates days
    ↓
Backend submission with complete payload
```

### For Advance/Requisition Forms (Employee Number Only):
```
Same as above, but only employee_number is used for form
Other fields filled manually by user or used in backend logic
```

---

## Files Modified (6 Total)

| File | Type | Changes |
|------|------|---------|
| `app/dashboard/requests/leave/page.tsx` | Leave Request | ✅ Full auto-population |
| `app/dashboard/requests/cash-advance/page.tsx` | Cash Advance | ✅ Session key fix |
| `app/dashboard/requests/salary-advance/page.tsx` | Salary Advance | ✅ Session key fix |
| `app/dashboard/requests/purchase-requisition/page.tsx` | Purchase Req | ✅ Session key fix |
| `app/dashboard/requests/stores-requisition/page.tsx` | Stores Req | ✅ Session key fix |
| `app/dashboard/requests/stores-return/page.tsx` | Stores Return | ✅ Session key fix |

---

## Testing Checklist

- [ ] Log in with valid employee credentials
- [ ] Open Leave Request form
- [ ] Verify employee number is auto-populated
- [ ] Verify residential address is auto-filled from employee details
- [ ] Verify phone1 and phone2 are auto-filled
- [ ] Verify addressWhilstOnLeave defaults to residential address
- [ ] Modify dates and verify days calculation works
- [ ] Submit leave request and verify backend receives complete payload
- [ ] Check each advance/requisition form can fetch employee details
- [ ] Verify session key access works across all forms
- [ ] Test with invalid employee number (graceful error handling)

---

## Error Handling

All forms implement graceful error handling:

1. **Session Fetch Fails:** Form shows error, user cannot proceed
2. **Employee Details Fetch Fails:** Employee number still populated, other fields empty
3. **Form Submission Fails:** Toast notification with error message
4. **Invalid Dates:** Validation on frontend before submission

---

## Future Enhancements

1. **Department Auto-Population:** If departments are used in approval workflows, could auto-populate from employee details
2. **Department Pre-filtering:** Filter which leave types are available based on department
3. **Workflow Route Validation:** Check workflow_route from employee details for routing rules
4. **Job Title Display:** Show employee's job title on form header for reference

---

## Notes

- **Session Structure:** All forms now expect `session.session?.employee_number` (nested structure from Django backend)
- **Fallback Logic:** Forms work even if employee details API fails (employee number is always available)
- **Consistent Pattern:** All 6 request forms now use the same session fetching pattern
- **No Breaking Changes:** Existing functionality preserved, only enhanced with auto-population

---

**Implementation Status:** ✅ COMPLETE
**Testing Status:** Ready for QA
**Deployment Status:** Ready for deployment
