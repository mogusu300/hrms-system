# Purchase Approval Authorization Implementation

## Overview
Implemented approval-specific authorization for purchase orders. Only employees listed as specific approvers for a purchase can approve that purchase. This is more granular than workflow route filtering.

## Security Model

### Before (Workflow Route Only)
- Anyone with matching workflow route → Can approve any request in that route
- Example: If workflow route is "1000-2003-LA-001", anyone assigned that route could approve all purchases in that route
- ❌ Not secure - allows unauthorized approvals

### After (Specific Approver Authorization)
- Only employees listed in that specific purchase's approval flow → Can approve that purchase
- Example: PRN-000001 has approval flow: BRUCE.KABUKA → CHIBALEW → MULEYAD
- Only those 3 people can approve that specific purchase
- ✅ Secure - matches Business Central's actual approval structure

## Implementation Details

### 1. Employee ID Resolution
- Created `getEmployeeId()` function in both purchase tracking endpoints
- Fetches employee details from GetEmployeeDetails SOAP service
- Maps employee number (M1114) to employee username (BRUCE.KABUKA)
- This username matches the Approver_ID field in Business Central

### 2. Purchase Tracking GET Endpoint
**File**: `app/api/purchase-tracking/route.ts`

**Logic**:
1. Get logged-in employee's number from session
2. Call `getEmployeeId()` to get employee's username
3. Fetch all purchases from OData
4. Filter: Only return purchases where `Approver_ID === employeeUsername`
5. Result: User only sees purchases they're authorized to approve

**Console Output**:
```
╔════════════════════════════════════════════════════╗
║  GET PURCHASE ORDERS FOR APPROVAL                  ║
║  (Only show if user is in approval flow)           ║
╚════════════════════════════════════════════════════╝

👤 Employee Number from Session: M1114
📋 Employee Number: M1114
📋 Employee ID/Username: BRUCE.KABUKA

📊 Total Purchase Records from BC: 10
  ✅ PRN-000001: Approver "BRUCE.KABUKA" = Current User
  ✅ PRN-000003: Approver "BRUCE.KABUKA" = Current User

✅ Filtered Results: 2 purchases where user is in approval flow
╚════════════════════════════════════════════════════╝
```

### 3. Purchase Tracking Approve Endpoint
**File**: `app/api/purchase-tracking/approve/route.ts`

**Logic**:
1. Get logged-in employee's number from session
2. Call `getEmployeeId()` to get employee's username
3. Pass employeeId to `approveRequest()` function
4. BC's ApproveRequest service validates approver against approval flow
5. Result: Only listed approvers can actually approve

**Console Output**:
```
╔════════════════════════════════════════════════════╗
║  APPROVE PURCHASE ORDER (ENDPOINT)                 ║
╚════════════════════════════════════════════════════╝

📄 Document: PRN-000001
👤 Current User ID: BRUCE.KABUKA

📤 Approval Result:
   Success: true
   Message: Approval submitted successfully
╚════════════════════════════════════════════════════╝
```

### 4. Purchase Tracking Main Endpoint (POST)
**File**: `app/api/purchase-tracking/route.ts` (POST method)

**Logic**:
1. Get logged-in employee from session
2. Verify employee is the specified approver
3. If mismatch: Return 403 Forbidden with "You are not authorized to approve this purchase"
4. If match: Call `approveRequest()` to process approval

**Validation**:
```typescript
// BEFORE approval
if (employeeId?.toUpperCase() !== String(approverId).toUpperCase()) {
  return NextResponse.json({ 
    success: false, 
    message: 'You are not authorized to approve this purchase.' 
  }, { status: 403 });
}
```

## Data Structure

### Purchase Record from OData
```json
{
  "Document_No": "PRN-000001",
  "Status_RP": "Pending Approval",
  "Approver_ID": "BRUCE.KABUKA",
  "Amount": 50000.00,
  "Originator": "MWANSA.CHILANDO",
  "AuxiliaryIndex1": "1",
  "AuxiliaryIndex2": "1"
}
```

### Employee Details from SOAP
```json
{
  "Employee_No": "M1114",
  "FullName": "BRUCE.KABUKA",
  "Job_Title": "IT Manager",
  "Department_Code": "1000",
  "WorkflowRoute": "1000-2003-LA-001"
}
```

## Security Advantages

1. **Specific Approver Matching**: Only exact username matches can approve
2. **Case-Insensitive**: "BRUCE.KABUKA" = "bruce.kabuka" (security bypass prevention)
3. **Session-Based**: Employee ID extracted from httpOnly cookie (cannot be spoofed from frontend)
4. **Backend Validation**: All checks happen server-side
5. **BC Validation**: ApproveRequest SOAP service does additional validation

## Testing

### Test Case 1: User is Authorized Approver
- User: M1114 (BRUCE.KABUKA)
- Purchase: PRN-000001 with Approver_ID = "BRUCE.KABUKA"
- Expected: ✅ User sees purchase in list, can approve it

### Test Case 2: User is NOT Authorized Approver
- User: M1114 (BRUCE.KABUKA)
- Purchase: PRN-000005 with Approver_ID = "CHIBALEW"
- Expected: ❌ User does not see purchase in list

### Test Case 3: Unauthorized Approve Attempt
- User: M1114 (BRUCE.KABUKA)
- Attempt to approve: PRN-000005 (Approver_ID = "CHIBALEW")
- Expected: ❌ 403 Forbidden response "You are not authorized to approve this purchase"

## Logging

All endpoints now provide detailed console logs showing:
- Employee number and username resolution
- Total records before filtering
- Individual match results for each record
- Final filtered count
- Approval attempt details and results

Example:
```
👤 Employee Number from Session: M1114
📋 Employee Number: M1114
📋 Employee ID/Username: BRUCE.KABUKA
📊 Total Purchase Records from BC: 10
  ✅ PRN-000001: Approver "BRUCE.KABUKA" = Current User
  ✅ PRN-000003: Approver "BRUCE.KABUKA" = Current User
✅ Filtered Results: 2 purchases where user is in approval flow
```

## Files Modified

1. **app/api/purchase-tracking/route.ts**
   - Updated GET method: Approver ID filtering
   - Added getEmployeeId() function
   - Added POST method: Verify authorization before approval
   - Enhanced console logging

2. **app/api/purchase-tracking/approve/route.ts**
   - Updated POST method: Get employee ID from SOAP
   - Added employee ID to approveRequest() call
   - Enhanced console logging
   - Added getEmployeeId() helper function

## Next Steps (Optional)

Same pattern can be applied to other approval modules:
- `app/api/staff-advances-tracking/route.ts`
- `app/api/stores-tracking/route.ts`
- `app/api/transport-requests/route.ts`
- `app/api/leave-applications/route.ts`
- `app/api/work-orders/route.ts`

Each would need:
1. getEmployeeId() function in their routes
2. Filter by Approver_ID field in GET method
3. Authorization check in approve endpoint
4. Enhanced logging

## Notes

- Employee username format: "FIRSTNAME.LASTNAME" (e.g., "BRUCE.KABUKA")
- Comparison is case-insensitive for security
- httpOnly cookies prevent frontend tampering with employee ID
- SOAP GetEmployeeDetails service ensures correct employee-to-username mapping
- OData PurchaseTracking service provides list of purchases with Approver_ID

## Related Documentation

- [COMPLETE_APPROVAL_SYSTEM.md](COMPLETE_APPROVAL_SYSTEM.md) - Overall approval architecture
- [APPROVAL_WORKFLOW_ROUTE_FILTERING.md](APPROVAL_WORKFLOW_ROUTE_FILTERING.md) - Workflow route filtering (predecessor to this)
- Business Central OData: PurchaseTracking entity
- Business Central SOAP: GetEmployeeDetails, ApproveRequest services
