# Approval Workflow Route Filtering Implementation

## Summary
Implemented workflow route-based filtering for all approval pages. Approvers now only see requests assigned to their workflow route in Business Central, ensuring proper authorization and request routing.

## Changes Made

### 1. Library Updates
**File**: [lib/approval.ts](lib/approval.ts)
- ✅ **Added**: `filterRequestsByWorkflowRoute()` function
  - Filters approval requests by matching approver's workflow route
  - Logs detailed filtering information for debugging
  - Case-insensitive matching for reliability
  - Returns only requests matching the approver's assigned workflow route

### 2. API Endpoints Updated
All approval API endpoints now:
1. Extract employee number from session
2. Fetch employee's workflow route via SOAP GetEmployeeDetails
3. Filter requests by workflow route instead of employee number

**Updated Endpoints:**

#### [app/api/work-orders/route.ts](app/api/work-orders/route.ts)
- ✅ Added: `getEmployeeWorkflowRoute()` helper function
- ✅ Changed: Filter field from `Employee_No` to `Approval_Route`
- ✅ Uses: `filterRequestsByWorkflowRoute()`
- ✅ OData Source: `/WorkOrders`

#### [app/api/purchase-tracking/route.ts](app/api/purchase-tracking/route.ts)
- ✅ Added: `getEmployeeWorkflowRoute()` helper function
- ✅ Changed: Filter field from `Employee_No` to `Approval_Route`
- ✅ Uses: `filterRequestsByWorkflowRoute()`
- ✅ OData Source: `/PurchaseTracking`

#### [app/api/transport-requests/route.ts](app/api/transport-requests/route.ts)
- ✅ Added: `getEmployeeWorkflowRoute()` helper function
- ✅ Changed: Filter field from `Employee_No` to `Approval_Route`
- ✅ Uses: `filterRequestsByWorkflowRoute()`
- ✅ OData Source: `/TransportRequest`

#### [app/api/staff-advances-tracking/route.ts](app/api/staff-advances-tracking/route.ts)
- ✅ Added: `getEmployeeWorkflowRoute()` helper function
- ✅ Changed: Filter field from `Employee_No` to `Approval_Route`
- ✅ Uses: `filterRequestsByWorkflowRoute()`
- ✅ OData Source: `/StaffAdvance`
- ✅ Removed: Debug console logs

### 3. Approval Pages (No Code Changes Required)
The following approval pages automatically benefit from the API changes:
- [app/dashboard/approval/work-orders/page.tsx](app/dashboard/approval/work-orders/page.tsx)
- [app/dashboard/approval/purchase/page.tsx](app/dashboard/approval/purchase/page.tsx)
- [app/dashboard/approval/transport-requests/page.tsx](app/dashboard/approval/transport-requests/page.tsx)
- [app/dashboard/approval/staff-advances/page.tsx](app/dashboard/approval/staff-advances/page.tsx)

These pages call the updated APIs and automatically get filtered results.

## How It Works

### Flow Diagram
```
1. Approver loads approval page
   ↓
2. Frontend calls API endpoint (e.g., /api/work-orders)
   ↓
3. API extracts employee number from session cookie
   ↓
4. API calls GetEmployeeDetails SOAP service
   ↓
5. Business Central returns employee's WorkflowRoute (e.g., "1000-2003-LA-001")
   ↓
6. API fetches all pending requests from OData endpoint
   ↓
7. filterRequestsByWorkflowRoute() matches Approval_Route field
   ↓
8. Only requests with matching workflow route are returned
   ↓
9. Frontend displays filtered results
```

### Example
- Approver: John (Employee M1114, Workflow Route: "1000-2003-LA-001")
- Request A: Work order with Approval_Route = "1000-2003-LA-001" → **SHOWN** ✅
- Request B: Work order with Approval_Route = "1000-2003-SA-002" → **HIDDEN** ❌

## Logging
Each API endpoint logs:
- Approver's employee number
- Approver's workflow route
- Total requests fetched from Business Central
- Filtered results count
- Sample of first 3 requests for debugging

Example console output:
```
╔════════════════════════════════════════════════════╗
║      GET PURCHASE ORDERS FOR APPROVAL              ║
╚════════════════════════════════════════════════════╝

✅ Session extracted - Employee: "M1114"
✅ Approver Workflow Route Retrieved: "1000-2003-LA-001"

╔════════════════════════════════════════════════════╗
║         FILTER REQUESTS BY WORKFLOW ROUTE          ║
╚════════════════════════════════════════════════════╝

🔍 Approver Workflow Route: "1000-2003-LA-001"
📊 Total Requests from BC: 45
🏷️  Field to Match: "Approval_Route"

✅ Filtered Results: 8 requests matched
```

## Database Field Mapping
- Business Central Table: Employee
  - Field: `Workflow_Route` (read via GetEmployeeDetails)
- Business Central Tables: WorkOrder, PurchaseRequisition, TransportRequest, StaffAdvance
  - Field: `Approval_Route` (filtered against)

## Testing Checklist
- [ ] Approver sees only requests for their assigned route
- [ ] Requests for other routes are not displayed
- [ ] Empty state message shows when no matching requests exist
- [ ] Console logs show correct filtering details
- [ ] All 4 approval pages work correctly

## Files Modified
1. `lib/approval.ts` - Added new filtering function
2. `app/api/work-orders/route.ts` - Updated with workflow route filtering
3. `app/api/purchase-tracking/route.ts` - Updated with workflow route filtering
4. `app/api/transport-requests/route.ts` - Updated with workflow route filtering
5. `app/api/staff-advances-tracking/route.ts` - Updated with workflow route filtering
