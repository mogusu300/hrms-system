import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fetch from 'node-fetch';

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
  try {
    const { searchParams } = new URL(req.url);
    const employeeNumber = searchParams.get('employeeNumber');

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║       GET PHONE NUMBER REQUEST                     ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    console.log(`👤 Employee Number: ${employeeNumber}`);
    console.log(`\n═════════════════════════════════════════════════════\n`);

    if (!employeeNumber) {
      return NextResponse.json(
        { success: false, message: 'Employee number is required' },
        { status: 400 }
      );
    }

    // Create SOAP body for GetPhoneNumber on WebAPI codeunit
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI">
        <soapenv:Header/>
        <soapenv:Body>
          <web:GetPhoneNumber>
            <web:employeeNumber>${escapeXml(employeeNumber)}</web:employeeNumber>
          </web:GetPhoneNumber>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

    console.log(`\n╔════════════════════════════════════════════════════╗`);
    console.log(`║       SOAP REQUEST - GetPhoneNumber                ║`);
    console.log(`╚════════════════════════════════════════════════════╝\n`);

    console.log(`📍 URL: ${SOAP_URL}`);
    console.log(`📌 Method: POST`);
    console.log(`\n📋 Headers:`);
    console.log(`   • Content-Type: text/xml;charset=UTF-8`);
    console.log(`   • SOAPAction: urn:microsoft-dynamics-schemas/codeunit/WebAPI:GetPhoneNumber`);
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
        'SOAPAction': 'urn:microsoft-dynamics-schemas/codeunit/WebAPI:GetPhoneNumber',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: soapBody,
    });

    const responseText = await response.text();

    console.log(`╔════════════════════════════════════════════════════╗`);
    console.log(`║       SOAP RESPONSE - GetPhoneNumber               ║`);
    console.log(`╚════════════════════════════════════════════════════╝\n`);

    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`\n📄 Response Body:`);
    console.log(`──────────────────────────────────────────────────`);
    console.log(responseText);
    console.log(`──────────────────────────────────────────────────\n`);

    if (response.status !== 200) {
      console.error(`❌ Error: Get phone number failed`);

      const faultMatch = responseText.match(/<faultstring>(.*?)<\/faultstring>/);
      const errorMessage = faultMatch ? faultMatch[1] : 'Unknown SOAP error';

      console.log(`📌 Error Details: ${errorMessage}\n`);

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to get phone number',
          error: errorMessage,
        },
        { status: response.status }
      );
    }

    // Extract phone number from response
    const resultMatch = responseText.match(/<return_value>(.*?)<\/return_value>/) ||
      responseText.match(/<web:return_value>(.*?)<\/web:return_value>/) ||
      responseText.match(/<ns\d+:return_value>(.*?)<\/ns\d+:return_value>/);
    const phoneNumber = resultMatch ? resultMatch[1] : null;

    console.log(`✅ SUCCESS: Phone number retrieved`);
    console.log(`📞 Phone Number: ${phoneNumber}\n`);

    return NextResponse.json({
      success: true,
      phone_number: phoneNumber,
      message: 'Phone number retrieved successfully',
    });
  } catch (error: any) {
    console.error('\n❌ Unexpected error in get phone number:');
    console.error(error);
    console.log(`\n═════════════════════════════════════════════════════\n`);

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
