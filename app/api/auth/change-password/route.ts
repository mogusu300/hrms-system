import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fetch from 'node-fetch';
import { cookies } from 'next/headers';

const SOAP_URL = "http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebAPI";
const USERNAME = 'WEBUSER';
const PASSWORD = 'Pass@123!$';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { newPassword } = body;

    // Get employee number from session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    let employeeNumber: string | null = null;
    try {
      const sessionData = JSON.parse(sessionCookie.value);
      employeeNumber = sessionData.employee_number;
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }

    if (!employeeNumber) {
      return NextResponse.json(
        { success: false, message: 'Employee number not found in session' },
        { status: 401 }
      );
    }

    // Validate required parameter
    if (!newPassword || newPassword.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'New password is required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  CHANGE PASSWORD REQUEST                                       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`👤 Employee Number: ${employeeNumber}`);
    console.log(`\n════════════════════════════════════════════════════════════════\n`);

    // Create SOAP body
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI">
        <soapenv:Header/>
        <soapenv:Body>
          <web:SaveWebPassword>
            <web:employeeNumber>${employeeNumber}</web:employeeNumber>
            <web:userPassword>${newPassword}</web:userPassword>
          </web:SaveWebPassword>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

    console.log(`╔════════════════════════════════════════════════════════════════╗`);
    console.log(`║  SOAP REQUEST - SaveWebPassword                               ║`);
    console.log(`╚════════════════════════════════════════════════════════════════╝\n`);

    console.log(`📍 URL: ${SOAP_URL}`);
    console.log(`📌 Method: POST`);
    console.log(`\n📋 Headers:`);
    console.log(`   • Content-Type: text/xml;charset=UTF-8`);
    console.log(`   • SOAPAction: urn:microsoft-dynamics-schemas/codeunit/WebAPI:SaveWebPassword`);
    console.log(`   • Authorization: Basic [REDACTED]\n`);

    // Make SOAP request
    const response = await fetch(SOAP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:microsoft-dynamics-schemas/codeunit/WebAPI:SaveWebPassword',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: soapBody,
    });

    const responseText = await response.text();

    console.log(`╔════════════════════════════════════════════════════════════════╗`);
    console.log(`║  SOAP RESPONSE - SaveWebPassword                              ║`);
    console.log(`╚════════════════════════════════════════════════════════════════╝\n`);

    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`\n📄 Response Body:`);
    console.log(`════════════════════════════════════════════════════════════════`);
    console.log(responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    console.log(`════════════════════════════════════════════════════════════════\n`);

    if (response.status !== 200) {
      console.error(`❌ Error: Failed to change password`);

      const faultMatch = responseText.match(/<faultstring>(.*?)<\/faultstring>/);
      const errorMessage = faultMatch ? faultMatch[1] : 'Unknown SOAP error';

      console.log(`📌 Error Details: ${errorMessage}\n`);

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to change password',
          error: errorMessage,
        },
        { status: response.status }
      );
    }

    // Extract result from response
    try {
      let resultMatch = responseText.match(/<return_value>([\s\S]*?)<\/return_value>/);
      
      if (!resultMatch || !resultMatch[1]) {
        resultMatch = responseText.match(/<web:return_value>([\s\S]*?)<\/web:return_value>/);
      }

      if (!resultMatch || !resultMatch[1]) {
        console.error('❌ No return_value found in SOAP response');
        return NextResponse.json(
          {
            success: false,
            message: 'No response from password change service',
          },
          { status: 500 }
        );
      }

      const result = resultMatch[1].trim();

      console.log(`✅ SUCCESS: Password changed successfully`);
      console.log(`📌 Result: ${result}\n`);
      console.log(`════════════════════════════════════════════════════════════════\n`);

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully',
        result,
      });
    } catch (parseError: any) {
      console.error('❌ Error parsing response:');
      console.error(parseError);
      console.log(`\n════════════════════════════════════════════════════════════════\n`);

      return NextResponse.json(
        {
          success: false,
          message: 'Error processing password change',
          error: parseError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('\n❌ Unexpected error in change password:');
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
