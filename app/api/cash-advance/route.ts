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
    console.log('║       INSERT CASH ADVANCE REQUEST                  ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    console.log(`👤 Employee Number: ${body.man_number}`);
    console.log(`💵 Amount: ${body.currency} ${body.amount}`);
    console.log(`📅 Advance Date: ${body.advance_date}`);
    console.log(`📋 Category: ${body.advance_category}`);
    console.log(`💬 Reason: ${body.advance_reason}`);
    console.log(`📆 Promised Retirement: ${body.promised_retirement_date}`);
    console.log(`\n═════════════════════════════════════════════════════\n`);

    // Format dates
    const formattedAdvanceDate = formatDateForSOAP(body.advance_date);
    const formattedRetirementDate = formatDateForSOAP(body.promised_retirement_date);

    // Validate required fields
    const requiredFields = ['man_number', 'advance_date', 'advance_category', 'currency', 'amount', 'promised_retirement_date', 'advance_reason', 'detailed_description'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create SOAP body
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/InsertDocuments">
        <soapenv:Header/>
        <soapenv:Body>
          <web:InsertCashAdvance>
            <web:manNumber>${escapeXml(body.man_number)}</web:manNumber>
            <web:advanceDate>${formattedAdvanceDate}</web:advanceDate>
            <web:advanceCategory>${escapeXml(body.advance_category)}</web:advanceCategory>
            <web:currency>${escapeXml(body.currency)}</web:currency>
            <web:amount>${body.amount}</web:amount>
            <web:promisedRetirementDate>${formattedRetirementDate}</web:promisedRetirementDate>
            <web:advanceReason>${escapeXml(body.advance_reason)}</web:advanceReason>
            <web:detailedDescription>${escapeXml(body.detailed_description)}</web:detailedDescription>
          </web:InsertCashAdvance>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

    console.log(`\n╔════════════════════════════════════════════════════╗`);
    console.log(`║       SOAP REQUEST - InsertCashAdvance            ║`);
    console.log(`╚════════════════════════════════════════════════════╝\n`);

    console.log(`📍 URL: ${SOAP_URL}`);
    console.log(`📌 Method: POST`);
    console.log(`\n📋 Headers:`);
    console.log(`   • Content-Type: text/xml;charset=UTF-8`);
    console.log(`   • SOAPAction: urn:microsoft-dynamics-schemas/codeunit/InsertDocuments:InsertCashAdvance`);
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
        'SOAPAction': 'urn:microsoft-dynamics-schemas/codeunit/InsertDocuments:InsertCashAdvance',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: soapBody,
    });

    const responseText = await response.text();

    console.log(`╔════════════════════════════════════════════════════╗`);
    console.log(`║       SOAP RESPONSE - InsertCashAdvance           ║`);
    console.log(`╚════════════════════════════════════════════════════╝\n`);

    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`\n📄 Response Body:`);
    console.log(`──────────────────────────────────────────────────`);
    console.log(responseText);
    console.log(`──────────────────────────────────────────────────\n`);

    if (response.status !== 200) {
      console.error(`❌ Error: Cash advance submission failed`);

      // Try to extract error message from SOAP fault
      const faultMatch = responseText.match(/<faultstring>(.*?)<\/faultstring>/);
      const errorMessage = faultMatch ? faultMatch[1] : 'Unknown SOAP error';

      console.log(`📌 Error Details: ${errorMessage}\n`);

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to submit cash advance',
          error: errorMessage,
        },
        { status: response.status }
      );
    }

    // Extract result from response
    const resultMatch = responseText.match(/<web:return_value>(.*?)<\/web:return_value>/);
    const result = resultMatch ? resultMatch[1] : null;

    if (!result) {
      console.error('❌ No return value in SOAP response');
      return NextResponse.json(
        {
          success: false,
          message: 'No result returned from server',
        },
        { status: 500 }
      );
    }

    console.log(`✅ SUCCESS: Cash advance submitted`);
    console.log(`📋 Result: ${result}\n`);

    return NextResponse.json({
      success: true,
      result: result,
      message: 'Cash advance request submitted successfully',
    });
  } catch (error: any) {
    console.error('\n❌ Unexpected error in cash advance submission:');
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
