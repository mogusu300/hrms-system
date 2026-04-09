import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fetch from 'node-fetch';

const SOAP_URL = "http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/InsertDocuments";
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

// Helper function to format date to MM/DD/YYYY
function formatDateForSOAP(dateString: string): string {
  try {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║    INSERT SALARY ADVANCE HEADER REQUEST            ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    console.log(`👤 Employee Number: ${body.man_number}`);
    console.log(`💵 Amount Required: ${body.currency_code} ${body.amount_required}`);
    console.log(`📅 Date: ${body.date}`);
    console.log(`💬 Reason: ${body.reason}`);
    console.log(`📊 Installments: ${body.no_of_installments}`);
    console.log(`\n═════════════════════════════════════════════════════\n`);

    // Format date
    const formattedDate = formatDateForSOAP(body.date);

    // Validate required fields
    if (!body.man_number || !body.currency_code || !body.reason || !body.amount_required || !body.no_of_installments) {
      console.error('❌ Missing required fields in salary advance header request');
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create SOAP body
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/InsertDocuments">
        <soapenv:Header/>
        <soapenv:Body>
          <web:InsertSalaryAdvHeader>
            <web:manNumber>${escapeXml(body.man_number)}</web:manNumber>
            <web:date>${formattedDate}</web:date>
            <web:currencyCode>${escapeXml(body.currency_code)}</web:currencyCode>
            <web:reason>${escapeXml(body.reason)}</web:reason>
            <web:amountRequired>${body.amount_required}</web:amountRequired>
            <web:noOfInstallments>${body.no_of_installments}</web:noOfInstallments>
          </web:InsertSalaryAdvHeader>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

    console.log(`\n╔════════════════════════════════════════════════════╗`);
    console.log(`║   SOAP REQUEST - InsertSalaryAdvHeader            ║`);
    console.log(`╚════════════════════════════════════════════════════╝\n`);

    console.log(`📍 URL: ${SOAP_URL}`);
    console.log(`📌 Method: POST`);
    console.log(`\n📋 Headers:`);
    console.log(`   • Content-Type: text/xml;charset=UTF-8`);
    console.log(`   • SOAPAction: urn:microsoft-dynamics-schemas/codeunit/InsertDocuments:InsertSalaryAdvHeader`);
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
        'SOAPAction': 'urn:microsoft-dynamics-schemas/codeunit/InsertDocuments:InsertSalaryAdvHeader',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: soapBody,
    });

    const responseText = await response.text();

    console.log(`╔════════════════════════════════════════════════════╗`);
    console.log(`║   SOAP RESPONSE - InsertSalaryAdvHeader           ║`);
    console.log(`╚════════════════════════════════════════════════════╝\n`);

    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`\n📄 Response Body:`);
    console.log(`──────────────────────────────────────────────────`);
    console.log(responseText);
    console.log(`──────────────────────────────────────────────────\n`);

    if (response.status !== 200) {
      console.error(`❌ Error: Salary advance header submission failed`);

      // Try to extract error message from SOAP fault
      const faultMatch = responseText.match(/<faultstring>(.*?)<\/faultstring>/);
      const errorMessage = faultMatch ? faultMatch[1] : 'Unknown SOAP error';

      console.log(`📌 Error Details: ${errorMessage}\n`);

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create salary advance header',
          error: errorMessage,
        },
        { status: response.status }
      );
    }

    // Extract result from response
    const resultMatch = responseText.match(/<web:return_value>(.*?)<\/web:return_value>/);
    const advanceNumber = resultMatch ? resultMatch[1] : null;

    if (!advanceNumber) {
      console.error('❌ No advance number returned from SOAP response');
      return NextResponse.json(
        {
          success: false,
          message: 'No advance number returned',
        },
        { status: 500 }
      );
    }

    console.log(`✅ SUCCESS: Salary advance header created`);
    console.log(`📊 Advance Number: ${advanceNumber}\n`);

    return NextResponse.json({
      success: true,
      advance_number: advanceNumber,
      message: 'Salary advance header created successfully',
    });
  } catch (error: any) {
    console.error('\n❌ Unexpected error in salary advance header creation:');
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
