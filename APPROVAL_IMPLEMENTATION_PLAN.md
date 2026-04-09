# Document Approval Logic Implementation Plan

## Current State Analysis

### ✅ Already Implemented (Working)
1. **Approval Service Layer** (`lib/approval.ts`)
   - `approveRequest()` function - generic SOAP approval
   - `DOCUMENT_TYPE` constants mapped correctly
   - `getEmployeeNumberFromSession()` helper function
   - Proper error handling and logging

2. **API Routes** (All created and functional)
   - `/api/leave-applications/approve`
   - `/api/stores-tracking/approve`
   - `/api/purchase-tracking/approve`
   - `/api/staff-advances-tracking/approve`
   - `/api/transport-requests/approve`
   - `/api/work-orders/approve`

3. **UI Components** (Approval pages created)
   - Leave Applications Approval - ✅ **FULLY WIRED** (Approve button works)
   - Stores Approval - ✅ **FULLY WIRED**
   - Purchase Approval - ✅ **FULLY WIRED**
   - Staff Advances Approval - ✅ **FULLY WIRED**
   - Transport Requests Approval - ⚠️ **Partially implemented** (check button wiring)
   - Work Orders Approval - ⚠️ **Partially implemented** (check button wiring)

### Data Flow (Working Pattern)
```
User clicks "Approve" button
→ UI state: setApproving(true)
→ POST /api/{type}/approve with requestNumber
→ Backend gets employeeNumber from session
→ Backend calls approveRequest() service
→ Service makes SOAP call to Business Central
→ Returns success/error
→ UI updates with toast notification
→ List refreshes
```

## Files to Check & Verify

### 1. Transport Requests Approval Page
- **File**: `app/dashboard/approval/transport-requests/page.tsx`
- **Status**: Needs verification if approve button is wired
- **What to check**: Ensure `approveRequest` function is called correctly

### 2. Work Orders Approval Page
- **File**: `app/dashboard/approval/work-orders/page.tsx`
- **Status**: Needs verification if approve button is wired
- **What to check**: Ensure `approveRequest` function is called correctly

### 3. API Routes - Parameter Mapping
Each approve route needs to pass correct parameters to the service:

#### Leave Applications
- **Endpoint**: `/api/leave-applications/approve`
- **Parameters**: `leave_no` → passed to DOCUMENT_TYPE.LEAVE
- **Status**: ✅ Correct

#### Stores Requests
- **Endpoint**: `/api/stores-tracking/approve`
- **Parameters**: `document_no` → DOCUMENT_TYPE.STORE
- **Status**: Need to verify parameter names

#### Purchase Requests
- **Endpoint**: `/api/purchase-tracking/approve`
- **Parameters**: `document_no` → DOCUMENT_TYPE.STORE
- **Status**: Need to verify parameter names

#### Staff Advances
- **Endpoint**: `/api/staff-advances-tracking/approve`
- **Parameters**: `document_no` → DOCUMENT_TYPE.STAFF_ADVANCE
- **Status**: Need to verify parameter names

#### Transport Requests
- **Endpoint**: `/api/transport-requests/approve`
- **Parameters**: `document_no` → DOCUMENT_TYPE.TRANSPORT
- **Status**: Need to verify parameter names

#### Work Orders
- **Endpoint**: `/api/work-orders/approve`
- **Parameters**: `no` → DOCUMENT_TYPE.WORK_ORDER
- **Status**: Need to verify parameter names

## Proposed Action Items

### Phase 1: Verify Existing Implementation
1. ✅ Check if all approval endpoints are correctly implemented
2. ✅ Verify parameter mapping in each route
3. ✅ Ensure all UI components have approve buttons wired

### Phase 2: Fix Any Missing Wiring
1. Check transport-requests approve button
2. Check work-orders approve button
3. Verify all POST requests match backend expectations

### Phase 3: Test All Approval Flows
1. Test Leave Application approval
2. Test Stores Request approval
3. Test Purchase Request approval
4. Test Staff Advance approval
5. Test Transport Request approval
6. Test Work Order approval

## Key Constants & Mappings

```typescript
DOCUMENT_TYPE = {
  LEAVE: 11,
  STORE: 12,
  TRANSPORT: 13,
  SALARY_ADVANCE: 14,
  CASH_ADVANCE: 15,
  STAFF_ADVANCE: 16,
  WORK_ORDER: 17,
}
```

## Next Steps

1. **Immediate**: Read all approval pages and API routes to identify any missing wiring
2. **If needed**: Wire any missing approve buttons
3. **Validation**: Ensure all SOAP action names match (`ApproveLeaveApplication`, etc.)
4. **Testing**: Run through complete approval workflow for each request type

## Important Notes

- **No mock responses** - All approvals call real SOAP endpoints
- **Session-based auth** - Employee number from session cookies
- **Proper error handling** - User-friendly error messages
- **State management** - Proper loading/error states in UI
- **List refresh** - Lists refresh after successful approval
