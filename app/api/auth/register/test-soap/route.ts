import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to verify SOAP connectivity and authentication
 * Use this to debug 401 errors
 */
export async function GET(request: NextRequest) {
  const WEBSERVICE_URL = 'http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebAPI';
  const AUTH_USERNAME = 'WEBUSER';
  const AUTH_PASSWORD = 'Pass@123!$';

  console.log('\n\n╔══════════════════════════════════════════════════════╗');
  console.log('║          SOAP CONNECTION TEST                        ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  try {
    // Create credentials
    const credentials = Buffer.from(`${AUTH_USERNAME}:${AUTH_PASSWORD}`).toString('base64');
    const authHeader = `Basic ${credentials}`;

    console.log('\n✓ Credentials Generated:');
    console.log('  Username:', AUTH_USERNAME);
    console.log('  Password: [REDACTED]');
    console.log('  Base64:', credentials.substring(0, 20) + '...');
    console.log('  Auth Header:', authHeader.substring(0, 30) + '...');

    // Simple SOAP request for testing
    const testSoapBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI">
    <soapenv:Header/>
    <soapenv:Body>
      <web:EmployeeExist>
        <web:employeeNumber>TEST</web:employeeNumber>
      </web:EmployeeExist>
    </soapenv:Body>
  </soapenv:Envelope>`;

    console.log('\n✓ SOAP Request Details:');
    console.log('  URL:', WEBSERVICE_URL);
    console.log('  Method: POST');
    console.log('  Content-Type: text/xml;charset=UTF-8');
    console.log('  SOAPAction: urn:microsoft-dynamics-schemas/codeunit/WebAPI:EmployeeExist');

    console.log('\n📤 Sending SOAP request...');
    const response = await fetch(WEBSERVICE_URL, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:microsoft-dynamics-schemas/codeunit/WebAPI:EmployeeExist',
      },
      body: testSoapBody,
    });

    console.log('\n📥 Response Received:');
    console.log('  Status:', response.status, response.statusText);
    console.log('  Headers:');
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'set-cookie') {
        console.log(`    ${key}: ${value}`);
      }
    });

    const responseText = await response.text();
    console.log('\n  Body (first 500 chars):');
    console.log('  ' + responseText.substring(0, 500));

    if (response.status === 401) {
      console.log('\n⚠️  401 UNAUTHORIZED ERROR');
      console.log('  Possible causes:');
      console.log('  1. Invalid credentials (WEBUSER / Pass@123!$)');
      console.log('  2. Endpoint URL is incorrect');
      console.log('  3. Server requires different authentication method');
      console.log('  4. Server is down or unreachable');
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      body: responseText.substring(0, 1000),
      message: response.ok ? 'SOAP request successful' : 'SOAP request failed',
    });
  } catch (error) {
    console.error('\n❌ Connection Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to connect to SOAP endpoint',
      },
      { status: 500 }
    );
  }
}
