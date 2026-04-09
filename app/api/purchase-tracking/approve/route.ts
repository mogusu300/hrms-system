import { NextRequest, NextResponse } from 'next/server';
import { approveRequest, DOCUMENT_TYPE, getEmployeeNumberFromSession } from '@/lib/approval';
import fetch from 'node-fetch';

const SOAP_URL = "http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebAPI";
const USERNAME = 'WEBUSER';
const PASSWORD = 'Pass@123!$';

/**
 * Get employee ID from Business Central (maps employee number to ID)
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document_no } = body;

    if (!document_no) {
      return NextResponse.json({ error: 'document_no is required' }, { status: 400 });
    }

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  APPROVE PURCHASE ORDER (ENDPOINT)                 ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log(`\n📄 Document: ${document_no}`);

    // Django Line 1249: Get employee_number from session
    const employeeNumber = getEmployeeNumberFromSession(request.cookies);
    if (!employeeNumber) {
      console.log('❌ Employee number not available in session');
      return NextResponse.json(
        { error: 'Employee number not available' },
        { status: 403 }
      );
    }

    // Get the employee's ID (username format like "BRUCE.KABUKA")
    const employeeId = await getEmployeeId(employeeNumber);
    console.log(`👤 Current User ID: ${employeeId}`);

    // Call approval function - Purchase Tracking uses STORE document type (12)
    const result = await approveRequest(
      document_no, 
      DOCUMENT_TYPE.STORE, 
      employeeId || employeeNumber, 
      'PurchaseRequest'
    );

    console.log(`\n📤 Approval Result:`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message}`);
    console.log('╚════════════════════════════════════════════════════╝\n');

    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error in purchase tracking approval:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again later.' },
      { status: 500 }
    );
  }
}
