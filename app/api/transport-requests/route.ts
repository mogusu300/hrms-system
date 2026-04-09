import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fetch from 'node-fetch';
import { getEmployeeNumberFromSession, approveRequest, DOCUMENT_TYPE } from '@/lib/approval';

const ODATA_URL = "http://41.216.68.50:7248/BusinessCentral142/OData/Company('Mulonga%20Water%20Supply')/TransportRequest";
const SOAP_URL = "http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebAPI";
const USERNAME = 'WEBUSER';
const PASSWORD = 'Pass@123!$';

/**
 * Get employee ID from Business Central (maps employee number to ID)
 * The employee ID is the username format like "MICHELO.HIMAANGA", "ROY.AKUFUNA", etc.
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
  try {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║    GET TRANSPORT REQUESTS FOR APPROVAL             ║');
    console.log('║    (Only show if user is in approval flow)         ║');
    console.log('╚════════════════════════════════════════════════════╝');
    
    // Get logged-in employee number from session
    const employeeNumber = getEmployeeNumberFromSession(req.cookies);
    console.log(`\n👤 Employee Number from Session: ${employeeNumber || 'NOT FOUND'}`);
    
    // Get the employee's ID (username format like "MICHELO.HIMAANGA")
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
      return NextResponse.json([], { status: 200 });
    }
    const requests = Array.isArray(data.value) ? data.value : [];
    
    console.log(`\n📊 Total Transport Request Records from BC: ${requests.length}`);
    
    // Filter transport requests: only show if user is listed as an Approver_ID AND Status_WF is "Open"
    const filteredRequests = requests.filter((request: any) => {
      const approverFromRecord = String(request.Approver_ID || '').trim().toUpperCase();
      const currentEmployeeUpper = String(employeeId || '').trim().toUpperCase();
      const statusWF = String(request.Status_WF || '').trim();
      
      const isCorrectApprover = approverFromRecord === currentEmployeeUpper;
      const isOpenStatus = statusWF === 'Open';
      
      const isInApprovalFlow = isCorrectApprover && isOpenStatus;
      
      if (isInApprovalFlow) {
        console.log(`  ✅ ${request.Document_No}: Approver "${approverFromRecord}" = Current User, Status: "${statusWF}"`);
      }
      
      return isInApprovalFlow;
    });
    
    console.log(`\n✅ Filtered Results: ${filteredRequests.length} transport requests where user is in approval flow`);
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    return NextResponse.json(filteredRequests);
  } catch (error: any) {
    console.error('Error in transport requests approval:', error.message);
    return NextResponse.json([], { status: 200 });
  }
}
