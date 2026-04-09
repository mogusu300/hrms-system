import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import fetch from 'node-fetch'
import { getEmployeeNumberFromSession } from '@/lib/approval'

const ODATA_URL = "http://41.216.68.50:7248/BusinessCentral142/OData/Company('Mulonga%20Water%20Supply')/StoresTracking"
const SOAP_URL = "http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebAPI";
const USERNAME = 'WEBUSER'
const PASSWORD = 'Pass@123!$'

/**
 * Get employee ID from Business Central (maps employee number to ID)
 * The employee ID is the username format like "CHIBALEW", "MULEYAD", etc.
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
    return soapResponse.FullName || employeeNumber;
  } catch (error: any) {
    console.error('Error fetching employee ID:', error.message);
    return undefined;
  }
}

export async function GET(req: NextRequest) {
  const documentNo = req.nextUrl.searchParams.get('document_no')
  
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║      GET STORES REQUISITIONS FOR APPROVAL          ║');
  console.log('║      (Only show if user is in approval flow)       ║');
  console.log('╚════════════════════════════════════════════════════╝');
  
  // Get logged-in employee number from session
  const employeeNumber = getEmployeeNumberFromSession(req.cookies)
  console.log(`\n👤 Employee Number from Session: ${employeeNumber || 'NOT FOUND'}`);
  
  // Get the employee's ID (username format like "CHIBALEW")
  const employeeId = await getEmployeeId(employeeNumber);
  
  if (!employeeId) {
    console.log('❌ Cannot determine employee ID');
    return NextResponse.json([], { status: 200 });
  }
  
  try {
    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
    const res = await fetch(ODATA_URL, {
      headers: {
        'Accept': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Authorization': `Basic ${basicAuth}`,
      },
      method: 'GET',
    })
    const raw = await res.text();
    if (!res.ok) throw new Error(`OData error: ${res.status}`)
    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return NextResponse.json([], { status: 200 });
    }
    const stores = Array.isArray(data.value) ? data.value : [];
    
    if (documentNo) {
      const store = stores.find((s: any) => s.Document_No === documentNo);
      return NextResponse.json(store || {});
    }
    
    console.log(`\n📊 Total Stores Requisition Records from BC: ${stores.length}`);
    
    // Filter stores: only show if user is listed as an Approver_ID in the approval flow
    const filteredStores = stores.filter((store: any) => {
      const approverFromRecord = String(store.Approver_ID || '').trim().toUpperCase();
      const currentEmployeeUpper = String(employeeId || '').trim().toUpperCase();
      
      const isInApprovalFlow = approverFromRecord === currentEmployeeUpper;
      
      if (isInApprovalFlow) {
        console.log(`  ✅ ${store.Document_No}: Approver "${approverFromRecord}" = Current User`);
      }
      
      return isInApprovalFlow;
    });
    
    console.log(`\n✅ Filtered Results: ${filteredStores.length} stores requisitions where user is in approval flow`);
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    return NextResponse.json(filteredStores);
  } catch (error: any) {
    console.error('Error in stores tracking approval:', error.message);
    return NextResponse.json([], { status: 200 });
  }
}
