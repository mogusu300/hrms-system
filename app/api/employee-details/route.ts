import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fetch from 'node-fetch';

const SOAP_URL = "http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebAPI";
const USERNAME = 'WEBUSER';
const PASSWORD = 'Pass@123!$';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const manNumber = searchParams.get('manNumber');

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  GET EMPLOYEE DETAILS REQUEST                                  ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`👤 Employee Number: ${manNumber}`);
    console.log(`\n════════════════════════════════════════════════════════════════\n`);

    // Validate required parameter
    if (!manNumber) {
      console.error('❌ Missing manNumber parameter');
      return NextResponse.json(
        { success: false, message: 'Missing manNumber parameter' },
        { status: 400 }
        
      );
    }

    // Create SOAP body
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI">
        <soapenv:Header/>
        <soapenv:Body>
          <web:GetEmployeeDetails>
            <web:manNumber>${manNumber}</web:manNumber>
          </web:GetEmployeeDetails>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

    console.log(`╔════════════════════════════════════════════════════════════════╗`);
    console.log(`║  SOAP REQUEST - GetEmployeeDetails                            ║`);
    console.log(`╚════════════════════════════════════════════════════════════════╝\n`);

    console.log(`📍 URL: ${SOAP_URL}`);
    console.log(`📌 Method: POST`);
    console.log(`\n📋 Headers:`);
    console.log(`   • Content-Type: text/xml;charset=UTF-8`);
    console.log(`   • SOAPAction: urn:microsoft-dynamics-schemas/codeunit/WebAPI:GetEmployeeDetails`);
    console.log(`   • Authorization: Basic [REDACTED]\n`);

    console.log(`📄 SOAP Body:`);
    console.log(`════════════════════════════════════════════════════════════════`);
    console.log(soapBody.trim());
    console.log(`════════════════════════════════════════════════════════════════\n`);

    // Make SOAP request
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

    console.log(`╔════════════════════════════════════════════════════════════════╗`);
    console.log(`║  SOAP RESPONSE - GetEmployeeDetails                           ║`);
    console.log(`╚════════════════════════════════════════════════════════════════╝\n`);

    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`\n📄 Response Body:`);
    console.log(`════════════════════════════════════════════════════════════════`);
    console.log(responseText.substring(0, 1000) + (responseText.length > 1000 ? '...' : ''));
    console.log(`════════════════════════════════════════════════════════════════\n`);

    if (response.status !== 200) {
      console.error(`❌ Error: Failed to fetch employee details`);

      const faultMatch = responseText.match(/<faultstring>(.*?)<\/faultstring>/);
      const errorMessage = faultMatch ? faultMatch[1] : 'Unknown SOAP error';

      console.log(`📌 Error Details: ${errorMessage}\n`);

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch employee details',
          error: errorMessage,
        },
        { status: response.status }
      );
    }

    // Extract result from response - handle both possible tag patterns
    try {
      // Try pattern 1: <return_value>...</return_value>
      let resultMatch = responseText.match(/<return_value>([\s\S]*?)<\/return_value>/);
      
      if (!resultMatch || !resultMatch[1]) {
        // Try pattern 2: with namespace <web:return_value>...</web:return_value>
        resultMatch = responseText.match(/<web:return_value>([\s\S]*?)<\/web:return_value>/);
      }

      if (!resultMatch || !resultMatch[1]) {
        console.error('❌ No return_value found in SOAP response');
        return NextResponse.json(
          {
            success: false,
            message: 'No employee details returned',
          },
          { status: 500 }
        );
      }

      // Parse the JSON string from the SOAP response
      const jsonString = resultMatch[1].trim();
      const soapResponse = JSON.parse(jsonString);

      // Map SOAP response fields to standardized format
      const employeeDetails = {
        name: soapResponse.Name || '',
        employee_number: manNumber,
        department: soapResponse.Department || '',
        job_title: soapResponse.JobTitle || '',
        workflow_route: soapResponse.WorkflowRoute || '',
        phone1: soapResponse.Phone1 || '',
        phone2: soapResponse.Phone2 || '',
        address: soapResponse.Address || '',
        response_code: soapResponse.Response || null,
      };

      console.log(`✅ SUCCESS: Employee details retrieved`);
      console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
      console.log(`║           RAW SOAP RESPONSE (All Fields)                       ║`);
      console.log(`╚════════════════════════════════════════════════════════════════╝\n`);
      console.log(JSON.stringify(soapResponse, null, 2));

      console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
      console.log(`║           ALL API FIELDS (Everything from BC)                 ║`);
      console.log(`╚════════════════════════════════════════════════════════════════╝\n`);
      
      const allFields = Object.entries(soapResponse);
      console.log(`Total Fields Returned: ${allFields.length}\n`);
      
      allFields.forEach(([key, value]) => {
        const displayValue = value === null || value === undefined ? 'NULL/EMPTY' : value;
        console.log(`  🔹 ${key}: ${displayValue}`);
      });

      console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
      console.log(`║           MAPPED EMPLOYEE DETAILS                             ║`);
      console.log(`╚════════════════════════════════════════════════════════════════╝\n`);
      console.log(`📋 Employee Number: ${employeeDetails.employee_number}`);
      console.log(`👤 Full Name: ${employeeDetails.name}`);
      console.log(`💼 Job Title: ${employeeDetails.job_title}`);
      console.log(`🏢 Department: ${employeeDetails.department}`);
      console.log(`📍 Workflow Route: ${employeeDetails.workflow_route || 'N/A'}`);
      console.log(`📱 Phone 1: ${employeeDetails.phone1 || 'N/A'}`);
      console.log(`📱 Phone 2: ${employeeDetails.phone2 || 'N/A'}`);
      console.log(`🏠 Address: ${employeeDetails.address || 'N/A'}`);
      console.log(`✔️  Response Code: ${employeeDetails.response_code}`);

      console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
      console.log(`║           COMPLETE JSON RESPONSE                              ║`);
      console.log(`╚════════════════════════════════════════════════════════════════╝\n`);
      console.log(JSON.stringify(employeeDetails, null, 2));
      console.log(`\n════════════════════════════════════════════════════════════════\n`);

      return NextResponse.json(employeeDetails);
    } catch (parseError: any) {
      console.error('❌ Error parsing employee details JSON:');
      console.error(parseError);
      console.log(`\n════════════════════════════════════════════════════════════════\n`);

      return NextResponse.json(
        {
          success: false,
          message: 'Error parsing employee details',
          error: parseError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('\n❌ Unexpected error in get employee details:');
    console.error(error);
    console.log(`\n════════════════════════════════════════════════════════════════\n`);

    return NextResponse.json(
      {
        success: false,
        message: 'Unexpected error occurred',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
