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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  CREATE STORES REQUISITION HEADER REQUEST                       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`👤 Employee Number: ${body.man_number}`);
    console.log(`📦 Type: ${body.stores_type}`);
    console.log(`📝 Reason: ${body.reason}`);
    console.log(`\n════════════════════════════════════════════════════════════════\n`);

    // Validate required fields
    if (!body.man_number || !body.reason) {
      console.error('❌ Missing required fields in stores requisition header request');
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
          <web:InsertStoresRequisitionHeader>
            <web:manNumber>${escapeXml(body.man_number)}</web:manNumber>
            <web:storesType>${escapeXml(body.stores_type || 'Requisition')}</web:storesType>
            <web:reason>${escapeXml(body.reason)}</web:reason>
          </web:InsertStoresRequisitionHeader>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

    console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
    console.log(`║  SOAP REQUEST - InsertStoresRequisitionHeader                  ║`);
    console.log(`╚════════════════════════════════════════════════════════════════╝\n`);

    console.log(`📍 URL: ${SOAP_URL}`);
    console.log(`📌 Method: POST`);
    console.log(`\n📋 Headers:`);
    console.log(`   • Content-Type: text/xml;charset=UTF-8`);
    console.log(`   • SOAPAction: urn:microsoft-dynamics-schemas/codeunit/InsertDocuments:InsertStoresRequisitionHeader`);
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
        'SOAPAction': 'urn:microsoft-dynamics-schemas/codeunit/InsertDocuments:InsertStoresRequisitionHeader',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: soapBody,
    });

    const responseText = await response.text();

    console.log(`╔════════════════════════════════════════════════════════════════╗`);
    console.log(`║  SOAP RESPONSE - InsertStoresRequisitionHeader                 ║`);
    console.log(`╚════════════════════════════════════════════════════════════════╝\n`);

    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`\n📄 Response Body:`);
    console.log(`════════════════════════════════════════════════════════════════`);
    console.log(responseText);
    console.log(`════════════════════════════════════════════════════════════════\n`);

    if (response.status !== 200) {
      console.error(`❌ Error: Stores requisition header creation failed`);

      const faultMatch = responseText.match(/<faultstring>(.*?)<\/faultstring>/);
      const errorMessage = faultMatch ? faultMatch[1] : 'Unknown SOAP error';

      console.log(`📌 Error Details: ${errorMessage}\n`);

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create stores requisition header',
          error: errorMessage,
        },
        { status: response.status }
      );
    }

    // Extract result from response
    const resultMatch = responseText.match(/<web:return_value>(.*?)<\/web:return_value>/);
    const documentNumber = resultMatch ? resultMatch[1] : null;

    if (!documentNumber) {
      console.error('❌ No document number returned from SOAP response');
      return NextResponse.json(
        {
          success: false,
          message: 'No document number returned',
        },
        { status: 500 }
      );
    }

    console.log(`✅ SUCCESS: Stores requisition header created`);
    console.log(`📊 Document Number: ${documentNumber}\n`);

    return NextResponse.json({
      success: true,
      document_number: documentNumber,
      message: 'Stores requisition header created successfully',
    });
  } catch (error: any) {
    console.error('\n❌ Unexpected error in stores requisition header creation:');
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
