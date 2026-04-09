# Purchase Approval Authorization - Testing Scenarios

## Quick Verification

### Console Logging Verification

When you log in as an employee and navigate to **Dashboard → Approval → Purchase**, you should see console logs like:

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

This means:
- ✅ Employee ID resolution working
- ✅ Purchase filtering by Approver_ID working
- ✅ Only 2 out of 10 purchases are showing (because only BRUCE.KABUKA is approver for those 2)

## Verification Steps

### 1. Check Employee ID Mapping
**Expected**: Employee number (M1114) correctly maps to username (BRUCE.KABUKA)

Console should show:
```
📋 Employee Number: M1114
📋 Employee ID/Username: BRUCE.KABUKA
```

If you see mismatched names → Check GetEmployeeDetails SOAP response mapping

### 2. Check Purchase Filtering
**Expected**: Only purchases where current user is in Approver_ID list

If you're seeing too many purchases:
- Check if all purchases have matching Approver_ID
- Check if employee ID extraction failed (look for 404 errors in network)

If you're seeing no purchases:
- Check if any purchases exist for that approver
- Verify the Approver_ID field exists in Purchase Tracking OData

### 3. Check Approval Button
**Expected**: Approve button is clickable and submits

When clicked:
1. Should call `/api/purchase-tracking/approve` with document_no
2. Console should show:
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

### 4. Check Authorization
**Expected**: Cannot approve purchase if not in approval flow

Test by:
1. Try to approve a purchase where current user is NOT the Approver_ID
2. Should get error response: "You are not authorized to approve this purchase"
3. HTTP Status: 403 Forbidden

## Troubleshooting

### Issue: "Cannot determine employee ID"
**Cause**: GetEmployeeDetails SOAP service failed or returned unexpected data

**Fix**:
1. Check console for SOAP errors
2. Verify employee exists in Business Central
3. Check XML parsing in getEmployeeId function

### Issue: Wrong purchases showing
**Cause**: Approver_ID filtering logic issue

**Fix**:
1. Check console logs for individual purchase filtering
2. Verify Approver_ID field name in Business Central (might be different case)
3. Check if Approver_ID contains extra spaces

### Issue: "Unauthorized" when approving
**Cause**: Employee ID doesn't match selected approver

**Fix**:
1. Verify correct approver ID is being used
2. Check case sensitivity (should be case-insensitive)
3. Verify employee ID extraction is consistent

## Code Locations

1. **GET Endpoint**: `app/api/purchase-tracking/route.ts` (lines 70-121)
   - Employee ID retrieval
   - Purchase filtering logic
   - Console logging

2. **POST Endpoint**: `app/api/purchase-tracking/route.ts` (lines 123-180)
   - Authorization check
   - Approval submission

3. **Approve Endpoint**: `app/api/purchase-tracking/approve/route.ts` (lines 45-115)
   - Employee ID retrieval
   - Approval call with employee ID

4. **UI Component**: `app/dashboard/approval/purchase/page.tsx`
   - Displays filtered purchases
   - Shows approve button
   - Handles approval submission

## Expected Behavior

### User with Matching Approver_ID
- ✅ Sees purchase in list
- ✅ Can click "View Details"
- ✅ Can click "Approve"
- ✅ Approval succeeds with "Success" toast

### User with Non-Matching Approver_ID
- ❌ Does not see purchase in list
- ❌ Cannot approve (even if they manually craft request)
- ❌ Gets 403 Forbidden response

## Security Validation

✅ Session-based: Employee ID from httpOnly cookie
✅ Server-side: All filtering happens on backend
✅ Case-insensitive: Prevents bypass with different cases
✅ SOAP validation: BC service validates approval again
✅ Authorization check: Double-checked before approval
✅ Proper HTTP status codes: 403 for unauthorized

## Related Files

- [PURCHASE_APPROVAL_AUTHORIZATION.md](PURCHASE_APPROVAL_AUTHORIZATION.md) - Implementation details
- [COMPLETE_APPROVAL_SYSTEM.md](COMPLETE_APPROVAL_SYSTEM.md) - Overall approval architecture
- Business Central OData: PurchaseTracking entity
- Business Central SOAP: GetEmployeeDetails service
