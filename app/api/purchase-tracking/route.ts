import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fetch from 'node-fetch';
import { getEmployeeNumberFromSession, approveRequest, DOCUMENT_TYPE } from '@/lib/approval';

const ODATA_URL = "http://41.216.68.50:7248/BusinessCentral142/OData/Company('Mulonga%20Water%20Supply')/PurchaseTracking";
const SOAP_URL = "http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebAPI";
const USERNAME = 'WEBUSER';
const PASSWORD = 'Pass@123!$';

/**
 * Get employee ID from Business Central (maps employee number to ID)
 * The employee ID is the username format like "BRUCE.KABUKA", "CHIBALEW", etc.
 */
async function getEmployeeId(employeeNumber: string | undefined): Promise<string | undefined> {
  if (!employeeNumber) return undefined;
  
  try {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI">
        <soapenv:Header/>
        <soapenv:Body>
          <web:GetEmployeeDetails>
            <web:manNumber>${employeeNumber}</web:manNumber>
          </web:GetEmployeeDetails>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
    const response = await fetch(SOAP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:microsoft-dynamics-schemas/codeunit/WebAPI:GetEmployeeDetails',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: soapBody,
    });

    const responseText = await response.text();
    if (response.status !== 200) return undefined;

    const resultMatch = responseText.match(/<return_value>([\s\S]*?)<\/return_value>/);
    if (!resultMatch || !resultMatch[1]) return undefined;

    const jsonString = resultMatch[1].trim();
    const soapResponse = JSON.parse(jsonString);
    
    // The FullName field contains the employee's ID in BC (e.g., "BRUCE.KABUKA")
    const employeeId = soapResponse.FullName || employeeNumber;
    console.log(`📋 Employee Number: ${employeeNumber}`);
    console.log(`📋 Employee ID/Username: ${employeeId}`);
    
    return employeeId;
  } catch (error: any) {
    console.error('Error fetching employee ID:', error.message);
    return undefined;
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  GET PURCHASE ORDERS FOR APPROVAL                  ║');
    console.log('║  (Only show if user is in approval flow)           ║');
    console.log('╚════════════════════════════════════════════════════╝');
    
    // Get logged-in employee number from session
    const employeeNumber = getEmployeeNumberFromSession(req.cookies);
    console.log(`\n👤 Employee Number from Session: ${employeeNumber || 'NOT FOUND'}`);
    
    // Get the employee's ID (username format like "BRUCE.KABUKA")
    const employeeId = await getEmployeeId(employeeNumber);
    
    if (!employeeId) {
      console.log('❌ Cannot determine employee ID');
      return NextResponse.json([], { status: 200 });
    }
    
    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
    const res = await fetch(ODATA_URL, {
      headers: {
        'Accept': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Authorization': `Basic ${basicAuth}`,
      },
      method: 'GET',
    });
    const raw = await res.text();
    if (!res.ok) throw new Error(`OData error: ${res.status}`);
    
    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.log('❌ Failed to parse OData response');
      return NextResponse.json([], { status: 200 });
    }
    
    const purchases = Array.isArray(data.value) ? data.value : [];
    console.log(`\n📊 Total Purchase Records from BC: ${purchases.length}`);
    
    // Filter purchases: only show if user is listed as an Approver_ID in the approval flow
    const filteredPurchases = purchases.filter((purchase: any) => {
      // Normalize both for case-insensitive comparison
      const approverFromRecord = String(purchase.Approver_ID || '').trim().toUpperCase();
      const currentEmployeeUpper = String(employeeId || '').trim().toUpperCase();
      
      const isInApprovalFlow = approverFromRecord === currentEmployeeUpper;
      
      if (isInApprovalFlow) {
        console.log(`  ✅ ${purchase.Document_No}: Approver "${approverFromRecord}" = Current User`);
      }
      
      return isInApprovalFlow;
    });
    
    console.log(`\n✅ Filtered Results: ${filteredPurchases.length} purchases where user is in approval flow`);
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    return NextResponse.json(filteredPurchases);
  } catch (error: any) {
    console.error('Error in purchase tracking GET:', error.message);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentNo, approverId } = body;
    
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  POST APPROVE PURCHASE ORDER                       ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log(`\n📄 Document: ${documentNo}`);
    console.log(`👤 Approver ID: ${approverId}`);
    
    // Get logged-in employee from session
    const employeeNumber = getEmployeeNumberFromSession(req.cookies);
    const employeeId = await getEmployeeId(employeeNumber);
    
    // Verify that the logged-in user is authorized to approve this purchase
    if (employeeId?.toUpperCase() !== String(approverId).toUpperCase()) {
      console.log(`❌ UNAUTHORIZED: "${employeeId}" is not the approver "${approverId}"`);
      return NextResponse.json({ 
        success: false, 
        message: 'You are not authorized to approve this purchase.' 
      }, { status: 403 });
    }
    
    console.log(`✅ Authorization verified: "${employeeId}" is approved approver`);
    
    // Approve the request using the shared approval function
    const result = await approveRequest(
      documentNo,
      DOCUMENT_TYPE.STORE, // Purchase = Store Document Type (12)
      approverId
    );
    
    console.log(`\n📤 Approval Result:`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message}`);
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Purchase approved successfully.' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.message 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in purchase tracking POST:', error.message);
    return NextResponse.json({ 
      success: false, 
      message: 'Error approving purchase.' 
    }, { status: 500 });
  }
}
