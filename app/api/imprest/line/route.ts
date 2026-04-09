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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║       INSERT IMPREST LINE REQUEST                  ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    console.log(`👤 Employee Number: ${body.man_number}`);
    console.log(`📋 Imprest Number: ${body.imprest_number}`);
    console.log(`🏦 Account Number: ${body.account_number}`);
    console.log(`📝 Description: ${body.description}`);
    console.log(`📦 Quantity: ${body.quantity}`);
    console.log(`💵 Unit Cost: ${body.unit_cost}`);
    console.log(`\n═════════════════════════════════════════════════════\n`);

    // Validate required fields
    const requiredFields = ['man_number', 'imprest_number', 'account_number', 'description', 'quantity', 'unit_cost'];
    const missingFields = requiredFields.filter(field => !body[field] && body[field] !== 0);

    if (missingFields.length > 0) {
      console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create SOAP body for InsertImprestLine on WebAPI codeunit
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI">
        <soapenv:Header/>
        <soapenv:Body>
          <web:InsertImprestLine>
            <web:manNumber>${escapeXml(body.man_number)}</web:manNumber>
            <web:imprestNumber>${escapeXml(body.imprest_number)}</web:imprestNumber>
            <web:accountNumber>${escapeXml(body.account_number)}</web:accountNumber>
            <web:description>${escapeXml(body.description)}</web:description>
            <web:quantity>${body.quantity}</web:quantity>
            <web:unitCost>${body.unit_cost}</web:unitCost>
          </web:InsertImprestLine>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

    console.log(`\n╔════════════════════════════════════════════════════╗`);
    console.log(`║   SOAP REQUEST - InsertImprestLine                 ║`);
    console.log(`╚════════════════════════════════════════════════════╝\n`);

    console.log(`📍 URL: ${SOAP_URL}`);
    console.log(`📌 Method: POST`);
    console.log(`\n📋 Headers:`);
    console.log(`   • Content-Type: text/xml;charset=UTF-8`);
    console.log(`   • SOAPAction: urn:microsoft-dynamics-schemas/codeunit/WebAPI:InsertImprestLine`);
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
        'SOAPAction': 'urn:microsoft-dynamics-schemas/codeunit/WebAPI:InsertImprestLine',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: soapBody,
    });

    const responseText = await response.text();

    console.log(`╔════════════════════════════════════════════════════╗`);
    console.log(`║   SOAP RESPONSE - InsertImprestLine                ║`);
    console.log(`╚════════════════════════════════════════════════════╝\n`);

    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`\n📄 Response Body:`);
    console.log(`──────────────────────────────────────────────────`);
    console.log(responseText);
    console.log(`──────────────────────────────────────────────────\n`);

    if (response.status !== 200) {
      console.error(`❌ Error: Imprest line submission failed`);

      const faultMatch = responseText.match(/<faultstring>(.*?)<\/faultstring>/);
      const errorMessage = faultMatch ? faultMatch[1] : 'Unknown SOAP error';

      console.log(`📌 Error Details: ${errorMessage}\n`);

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to submit imprest line',
          error: errorMessage,
        },
        { status: response.status }
      );
    }

    // Extract result from response
    const resultMatch = responseText.match(/<return_value>(.*?)<\/return_value>/) ||
      responseText.match(/<web:return_value>(.*?)<\/web:return_value>/) ||
      responseText.match(/<ns\d+:return_value>(.*?)<\/ns\d+:return_value>/);
    const result = resultMatch ? resultMatch[1] : null;

    console.log(`✅ SUCCESS: Imprest line submitted`);
    console.log(`📋 Result: ${result}\n`);

    return NextResponse.json({
      success: true,
      result: result,
      message: 'Imprest line submitted successfully',
    });
  } catch (error: any) {
    console.error('\n❌ Unexpected error in imprest line submission:');
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
