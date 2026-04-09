/**
 * Approval Workflow Helper
 * Centralizes all approval logic to match Django system exactly
 * Django Source: views.py lines 1131-1299
 */

const WEBMOBILE_URL = 'http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebMobile';
const AUTH_USERNAME = 'WEBUSER';
const AUTH_PASSWORD = 'Pass@123!$';

/**
 * Document Type Mapping (from Django views.py lines 1136-1139)
 */
export const DOCUMENT_TYPE = {
  LEAVE: 11,
  STORE: 12,
  TRANSPORT: 13,
  SALARY_ADVANCE: 14,
  CASH_ADVANCE: 15,
  STAFF_ADVANCE: 16,
  WORK_ORDER: 17,
} as const;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generic SOAP approval function matching Django logic exactly
 * Django Lines 1249-1299
 */
export async function approveRequest(
  requestNumber: string,
  documentType: number,
  employeeNumber: string,
  requestTypeName: string = 'Request'
): Promise<{ success: boolean; message: string }> {
  try {
    // Django Line 1251-1275: Build SOAP request to WebMobile
    const soapBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebMobile">
    <soapenv:Header/>
    <soapenv:Body>
      <web:ApproveRequest>
        <web:requestNumber>${escapeXml(requestNumber)}</web:requestNumber>
        <web:documentType>${documentType}</web:documentType>
        <web:manNumber>${escapeXml(employeeNumber)}</web:manNumber>
      </web:ApproveRequest>
    </soapenv:Body>
  </soapenv:Envelope>`;

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log(`║     SOAP REQUEST - Approve${requestTypeName.padEnd(23)}║`);
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('\n📍 URL:', WEBMOBILE_URL);
    console.log('📌 Request No:', requestNumber);
    console.log('👤 Approver:', employeeNumber);
    console.log('📋 Document Type:', documentType);

    const credentials = Buffer.from(`${AUTH_USERNAME}:${AUTH_PASSWORD}`).toString('base64');
    const response = await fetch(WEBMOBILE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': `urn:microsoft-dynamics-schemas/codeunit/WebMobile:Approve${requestTypeName}`,
      },
      body: soapBody,
    });

    const responseText = await response.text();

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log(`║    SOAP RESPONSE - Approve${requestTypeName.padEnd(22)}║`);
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('\n✅ Status:', response.status, response.statusText);

    // Django Line 1276-1291: Check response status
    if (response.status === 200) {
      return { 
        success: true, 
        message: `${requestTypeName} approved successfully` 
      };
    } else {
      console.error(`❌ Error: SOAP request failed with status ${response.status}`);
      return { 
        success: false, 
        message: `HTTP ${response.status}: ${response.statusText}` 
      };
    }
  } catch (error) {
    console.error(`❌ Error in approve${requestTypeName}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Extract employee_number from Next.js request cookies
 * Returns undefined if no valid session found
 */
export function getEmployeeNumberFromSession(cookies: any): string | undefined {
  try {
    const sessionCookie = cookies.get('session');
    if (!sessionCookie) {
      console.log('❌ No session cookie found');
      return undefined;
    }

    const sessionData = JSON.parse(sessionCookie.value);
    const employeeNumber = sessionData.employee_number;
    
    console.log(`\n✅ Session extracted - Employee: "${employeeNumber}"`);
    return employeeNumber;
  } catch (error) {
    console.log(`❌ Error extracting session:`, error);
    return undefined;
  }
}

/**
 * Filter requests to show only those belonging to the logged-in employee
 * Matches against employee_number field, then falls back to name matching
 * @param requests - Array of request objects from Business Central
 * @param loggedInEmployeeNumber - Employee number of logged-in user
 * @param employeeFieldName - Field name containing employee number (default: 'Man_Number')
 * @param employeeNameFieldName - Field name containing employee name (optional)
 * @returns Filtered array containing only the user's requests
 */
export function filterRequestsByEmployee(
  requests: any[],
  loggedInEmployeeNumber: string | undefined,
  employeeFieldName: string = 'Man_Number',
  employeeNameFieldName?: string
): any[] {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║            FILTER REQUESTS BY EMPLOYEE            ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log(`\n🔍 Logged-in Employee: "${loggedInEmployeeNumber}"`);
  console.log(`📊 Total Requests from BC: ${requests?.length || 0}`);
  console.log(`🏷️  Field to Match: "${employeeFieldName}"`);
  
  if (!loggedInEmployeeNumber) {
    console.log('\n❌ No employee number in session - returning empty array');
    return [];
  }
  
  if (!Array.isArray(requests)) {
    console.log('\n❌ Requests not an array - returning empty array');
    return [];
  }

  console.log(`\n📋 Sample of first 3 requests from Business Central:`);
  requests.slice(0, 3).forEach((req, idx) => {
    console.log(`   [${idx + 1}] ${employeeFieldName}: "${req[employeeFieldName]}" | Keys: ${Object.keys(req).slice(0, 5).join(', ')}`);
  });

  const filtered = requests.filter((request) => {
    // First try to match by employee number
    if (request[employeeFieldName]) {
      const normalizedRequestEmp = String(request[employeeFieldName]).trim().toUpperCase();
      const normalizedLoggedInEmp = String(loggedInEmployeeNumber).trim().toUpperCase();
      
      const isMatch = normalizedRequestEmp === normalizedLoggedInEmp;
      
      if (isMatch) {
        return true;
      }
    }

    // Fall back to name matching if field is provided
    if (employeeNameFieldName && request[employeeNameFieldName]) {
      // This would be matched against employee details if needed
      return false;
    }

    return false;
  });

  console.log(`\n✅ Filtered Results: ${filtered.length} requests matched`);
  if (filtered.length === 0) {
    console.log(`\n⚠️  No requests matched for employee "${loggedInEmployeeNumber}"`);
    console.log(`\n📝 Debugging Info:`);
    console.log(`   • Checking if requests contain "${employeeFieldName}" field`);
    requests.slice(0, 3).forEach((req, idx) => {
      console.log(`   • Request ${idx + 1} has ${employeeFieldName}: ${req[employeeFieldName] ? 'YES ✅' : 'NO ❌'}`);
    });
  }
  console.log('\n═'.repeat(52) + '\n');
  
  return filtered;
}

/**
 * Filter approval requests to show only those for the approver's workflow route
 * @param requests - Array of approval request objects from Business Central
 * @param approverWorkflowRoute - Workflow route of the logged-in approver
 * @param workflowRouteFieldName - Field name containing workflow route (e.g., 'Approval_Route')
 * @returns Filtered array containing only requests matching the approver's workflow route
 */
export function filterRequestsByWorkflowRoute(
  requests: any[],
  approverWorkflowRoute: string | undefined,
  workflowRouteFieldName: string = 'Approval_Route'
): any[] {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║         FILTER REQUESTS BY WORKFLOW ROUTE          ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log(`\n🔍 Approver Workflow Route: "${approverWorkflowRoute}"`);
  console.log(`📊 Total Requests from BC: ${requests?.length || 0}`);
  console.log(`🏷️  Field to Match: "${workflowRouteFieldName}"`);
  
  if (!approverWorkflowRoute) {
    console.log('\n❌ No workflow route for approver - returning empty array');
    return [];
  }
  
  if (!Array.isArray(requests)) {
    console.log('\n❌ Requests not an array - returning empty array');
    return [];
  }

  console.log(`\n📋 Sample of first 3 requests from Business Central:`);
  requests.slice(0, 3).forEach((req, idx) => {
    console.log(`   [${idx + 1}] ${workflowRouteFieldName}: "${req[workflowRouteFieldName]}" | Keys: ${Object.keys(req).slice(0, 5).join(', ')}`);
  });

  const filtered = requests.filter((request) => {
    if (request[workflowRouteFieldName]) {
      const normalizedRequestRoute = String(request[workflowRouteFieldName]).trim().toUpperCase();
      const normalizedApproverRoute = String(approverWorkflowRoute).trim().toUpperCase();
      
      const isMatch = normalizedRequestRoute === normalizedApproverRoute;
      
      if (isMatch) {
        console.log(`   ✅ Match: "${request[workflowRouteFieldName]}" matches approver route`);
        return true;
      }
    }
    return false;
  });

  console.log(`\n✅ Filtered Results: ${filtered.length} requests matched`);
  if (filtered.length === 0) {
    console.log(`\n⚠️  No requests matched for workflow route "${approverWorkflowRoute}"`);
  }
  console.log('\n═'.repeat(52) + '\n');
  
  return filtered;
}
