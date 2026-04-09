import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fetch from 'node-fetch';
import { getEmployeeNumberFromSession, filterRequestsByEmployee } from '@/lib/approval';

const ODATA_URL = "http://41.216.68.50:7248/BusinessCentral142/OData/Company('Mulonga%20Water%20Supply')/LeaveApplication";
const SOAP_URL = "http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebAPI";
const USERNAME = 'WEBUSER';
const PASSWORD = 'Pass@123!$';

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(req: NextRequest) {
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          GET LEAVE APPLICATIONS - START                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  try {
    // Get logged-in employee number from session
    const employeeNumber = getEmployeeNumberFromSession(req.cookies);
    
    console.log(`\n🔐 Session Check: ${employeeNumber ? '✅ Found' : '❌ Not Found'}`);
    
    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
    
    console.log(`\n📡 Fetching from OData: ${ODATA_URL}`);
    
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
      console.log('❌ Failed to parse JSON from OData');
      return NextResponse.json([], { status: 200 });
    }
    const leaves = Array.isArray(data.value) ? data.value : [];
    
    console.log(`\n📊 Total Leaves from Business Central: ${leaves.length}`);
    if (leaves.length > 0) {
      console.log(`\n📋 First Leave Record Sample:`);
      const firstLeave = leaves[0];
      console.log(`   Keys: ${Object.keys(firstLeave).join(', ')}`);
      console.log(`   Employee_No: "${firstLeave.Employee_No}"`);
    }
    
    // Filter leaves to show only those from logged-in employee
    const filteredLeaves = filterRequestsByEmployee(leaves, employeeNumber, 'Employee_No');
    
    console.log(`\n✅ Final result to send to client: ${filteredLeaves.length} leaves\n`);
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          GET LEAVE APPLICATIONS - COMPLETE                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    return NextResponse.json(filteredLeaves);
  } catch (error: any) {
    console.log(`\n❌ Error occurred: ${error.message}`);
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          GET LEAVE APPLICATIONS - ERROR                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║         📋 INSERT LEAVE APPLICATION REQUEST        ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    console.log(`📌 Employee Number: ${body.man_number}`);
    console.log(`📅 Leave Type: ${body.leave_type}`);
    console.log(`📝 Reason: ${body.reason_for_leave}`);
    console.log(`📅 From Date: ${body.from_date}`);
    console.log(`📅 To Date: ${body.to_date}`);
    console.log(`📅 Resume Date: ${body.date_to_resume}`);
    console.log(`⏳ Days Requested: ${body.days_taken}`);
    console.log(`\n═════════════════════════════════════════════════════\n`);

    // Create SOAP body
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI">
        <soapenv:Header/>
        <soapenv:Body>
          <web:InsertLeaveApplication>
            <web:manNumber>${escapeXml(body.man_number)}</web:manNumber>
            <web:reasonForLeave>${escapeXml(body.reason_for_leave)}</web:reasonForLeave>
            <web:leaveDate>${escapeXml(body.leave_date)}</web:leaveDate>
            <web:residentialAddress>${escapeXml(body.residential_address)}</web:residentialAddress>
            <web:addressWhilstonLeave>${escapeXml(body.address_whilst_on_leave)}</web:addressWhilstonLeave>
            <web:phone1>${escapeXml(body.phone1)}</web:phone1>
            <web:phone2>${escapeXml(body.phone2 || '')}</web:phone2>
            <web:leaveType>${escapeXml(body.leave_type)}</web:leaveType>
            <web:fromDate>${escapeXml(body.from_date)}</web:fromDate>
            <web:todate>${escapeXml(body.to_date)}</web:todate>
            <web:datetoResume>${escapeXml(body.date_to_resume)}</web:datetoResume>
            <web:daysTaken>${body.days_taken}</web:daysTaken>
            <web:daysCommuted>${body.days_commuted || 0}</web:daysCommuted>
          </web:InsertLeaveApplication>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

    console.log(`\n╔════════════════════════════════════════════════════╗`);
    console.log(`║      SOAP REQUEST - InsertLeaveApplication       ║`);
    console.log(`╚════════════════════════════════════════════════════╝\n`);
    
    console.log(`📍 URL: ${SOAP_URL}`);
    console.log(`📌 Method: POST`);
    console.log(`\n📋 Headers:`);
    console.log(`   • Content-Type: text/xml;charset=UTF-8`);
    console.log(`   • SOAPAction: urn:microsoft-dynamics-schemas/codeunit/WebAPI:InsertLeaveApplication`);
    console.log(`   • Authorization: Basic [REDACTED]\n`);
    
    console.log(`📄 SOAP Body:`);
    console.log(`──────────────────────────────────────────────────`);
    console.log(soapBody.trim());
    console.log(`──────────────────────────────────────────────────\n`);

    // Make SOAP request
    const response = await fetch(SOAP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:microsoft-dynamics-schemas/codeunit/WebAPI:InsertLeaveApplication',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: soapBody,
    });

    const responseText = await response.text();

    console.log(`╔════════════════════════════════════════════════════╗`);
    console.log(`║    SOAP RESPONSE - InsertLeaveApplication         ║`);
    console.log(`╚════════════════════════════════════════════════════╝\n`);
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`\n📄 Response Body:`);
    console.log(`──────────────────────────────────────────────────`);
    console.log(responseText);
    console.log(`──────────────────────────────────────────────────\n`);

    if (response.status !== 200) {
      console.log(`❌ Error: Leave application submission failed`);
      
      // Try to extract error message from SOAP fault
      const faultMatch = responseText.match(/<faultstring>(.*?)<\/faultstring>/);
      const errorMessage = faultMatch ? faultMatch[1] : 'Unknown SOAP error';
      
      console.log(`📌 Error Details: ${errorMessage}\n`);
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          message: 'Failed to submit leave application',
        },
        { status: response.status }
      );
    }

    // Extract result from response
    const resultMatch = responseText.match(/<return_value>(.*?)<\/return_value>/);
    const result = resultMatch ? resultMatch[1] : null;

    console.log(`✅ Leave Application submitted successfully`);
    console.log(`📌 Result: ${result}\n`);
    console.log(`═════════════════════════════════════════════════════\n`);

    return NextResponse.json({
      success: true,
      message: 'Leave application submitted successfully',
      result,
    });
  } catch (error: any) {
    console.error('❌ Error submitting leave application:', error.message);
    
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while submitting your request. Please try again later.',
        message: 'Failed to submit leave application',
      },
      { status: 500 }
    );
  }
}
