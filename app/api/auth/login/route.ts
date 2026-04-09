import { NextRequest, NextResponse } from 'next/server';

// WebService endpoint for Business Central
const WEBSERVICE_URL = 'http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebAPI';

// Basic Auth credentials
const AUTH_USERNAME = 'WEBUSER';
const AUTH_PASSWORD = 'Pass@123!$';

const getAuthHeader = () => {
  const credentials = Buffer.from(`${AUTH_USERNAME}:${AUTH_PASSWORD}`).toString('base64');
  return `Basic ${credentials}`;
};

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Make SOAP request to Business Central WebAPI
 */
async function makeSoapRequest(
  soapBody: string,
  soapAction: string
): Promise<{ success: boolean; result: string | null; message: string }> {
  try {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log(`║          SOAP REQUEST - ${soapAction.padEnd(24)}║`);
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('\n📍 URL:', WEBSERVICE_URL);
    console.log('📌 Method: POST');
    console.log('\n📋 Headers:');
    console.log('   • Authorization: Basic [REDACTED]');
    console.log('   • Content-Type: text/xml;charset=UTF-8');
    console.log(`   • SOAPAction: urn:microsoft-dynamics-schemas/codeunit/WebAPI:${soapAction}`);
    console.log('\n📄 SOAP Body:');
    console.log('─'.repeat(50));
    console.log(soapBody);
    console.log('─'.repeat(50));

    const response = await fetch(WEBSERVICE_URL, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': `urn:microsoft-dynamics-schemas/codeunit/WebAPI:${soapAction}`,
      },
      body: soapBody,
    });

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log(`║          SOAP RESPONSE - ${soapAction.padEnd(24)}║`);
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('\n✅ Status:', response.status, response.statusText);
    console.log('\n📋 Response Headers:');
    response.headers.forEach((value, key) => {
      console.log(`   • ${key}: ${value}`);
    });

    const responseText = await response.text();
    console.log('\n📄 Response Body:');
    console.log('─'.repeat(50));
    console.log(responseText);
    console.log('─'.repeat(50));

    if (!response.ok) {
      console.error(`\n❌ SOAP error: ${response.status} ${response.statusText}`);
      
      // Try to extract SOAP fault message
      let faultMessage = `HTTP ${response.status}: ${response.statusText}`;
      const faultMatch = responseText.match(/<faultstring[^>]*>([^<]+)<\/faultstring>/);
      if (faultMatch && faultMatch[1]) {
        faultMessage = faultMatch[1].trim();
        console.log('Fault Message:', faultMessage);
      }
      
      return { 
        success: false, 
        result: null,
        message: faultMessage 
      };
    }

    // Parse SOAP response
    try {
      // Try to find return_value in different possible locations
      let resultMatch = responseText.match(/<web:return_value>(.+?)<\/web:return_value>/) ||
                       responseText.match(/<return_value>(.+?)<\/return_value>/) ||
                       responseText.match(/<ns\d+:return_value>(.+?)<\/ns\d+:return_value>/);
      
      if (resultMatch && resultMatch[1]) {
        const result = resultMatch[1].trim();
        console.log(`\n✓ Result extracted: ${result}`);
        // Business Central returns numeric values: 0=false/not exist, >0=true/exists
        // Also handle string 'true'/'false' responses
        const success = (result !== '0' && result.toLowerCase() !== 'false') && result !== '';
        return { 
          success, 
          result,
          message: success ? 'Success' : 'Failed' 
        };
      }

      console.log('\n⚠️  Could not find return_value in response');
      return { 
        success: false, 
        result: null,
        message: 'Could not parse response - no return_value found' 
      };
    } catch (parseError) {
      console.error(`\n❌ Error parsing XML response:`, parseError);
      return { 
        success: false, 
        result: null,
        message: parseError instanceof Error ? parseError.message : 'Parse error' 
      };
    }
  } catch (error) {
    console.error('\n❌ Error making SOAP request:', error);
    return { 
      success: false, 
      result: null,
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Check if employee exists
 */
async function checkEmployeeExists(employeeNumber: string): Promise<boolean> {
  const soapBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI">
    <soapenv:Header/>
    <soapenv:Body>
      <web:EmployeeExist>
        <web:employeeNumber>${escapeXml(employeeNumber)}</web:employeeNumber>
      </web:EmployeeExist>
    </soapenv:Body>
  </soapenv:Envelope>`;

  const result = await makeSoapRequest(soapBody, 'EmployeeExist');
  return result.success;
}

/**
 * Check if web user exists
 */
async function checkWebUserExists(employeeNumber: string): Promise<boolean> {
  const soapBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI">
    <soapenv:Header/>
    <soapenv:Body>
      <web:WebUserExist>
        <web:employeeNumber>${escapeXml(employeeNumber)}</web:employeeNumber>
      </web:WebUserExist>
    </soapenv:Body>
  </soapenv:Envelope>`;

  const result = await makeSoapRequest(soapBody, 'WebUserExist');
  return result.success;
}

/**
 * Check password using SOAP
 */
async function checkPassword(employeeNumber: string, password: string): Promise<{ success: boolean; message: string }> {
  const soapBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI">
    <soapenv:Header/>
    <soapenv:Body>
      <web:CheckPassword>
        <web:employeeNumber>${escapeXml(employeeNumber)}</web:employeeNumber>
        <web:userPassword>${escapeXml(password)}</web:userPassword>
      </web:CheckPassword>
    </soapenv:Body>
  </soapenv:Envelope>`;

  const result = await makeSoapRequest(soapBody, 'CheckPassword');
  console.log(`\n🔐 Password Check Result: ${result.success ? '✓ VALID' : '✗ INVALID'}`);
  if (!result.success) {
    console.log(`💬 Message: ${result.message}`);
  }
  return { success: result.success, message: result.message };
}

/**
 * Get user info from Business Central
 */
async function getUserInfo(employeeNumber: string): Promise<any> {
  try {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║        Getting User Information from SOAP           ║');
    console.log('╚════════════════════════════════════════════════════╝');

    // In a real scenario, you'd call another SOAP method to get user details
    // For now, we'll return basic info that can be expanded
    return {
      ID: employeeNumber,
      Employee_Number: employeeNumber,
      Full_Name: 'User',
      User_Role: 'Employee',
    };
  } catch (error) {
    console.error('\n❌ Error fetching user info:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_number, password } = body;

    console.log('\n\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                   🔐 LOGIN REQUEST RECEIVED               ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n👤 Employee Number:', employee_number);
    console.log('🔑 Password: [REDACTED]');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('\n' + '═'.repeat(61) + '\n');

    // Django Line 387: Check if employee_number already in session
    // If yes, would redirect to dashboard. In API context, we allow re-login.
    // But we don't check - user may re-login

    if (!employee_number || !password) {
      console.log('\n❌ Missing credentials - validation failed\n');
      return NextResponse.json(
        { error: 'Employee number and password are required' },
        { status: 400 }
      );
    }

    // Django Line 388-410: Extract credentials and call CheckPassword SOAP
    console.log('\n📋 Step 1: Calling CheckPassword SOAP...');
    const passwordResult = await checkPassword(employee_number, password);
    
    // Django Line 414-420: Parse response, check for SOAP Fault first
    if (!passwordResult.success) {
      // Django returns render login.html with error - we return 401 API response
      console.log(`\n❌ Invalid credentials (Result: ${passwordResult.message})`);
      console.log('═'.repeat(61) + '\n');
      return NextResponse.json(
        { error: 'Invalid employee number or password' },
        { status: 401 }
      );
    }
    
    // Django Line 425-430: Success - return_value == '1'
    console.log('✅ Password valid');

    // Django Line 431: Set session key 'employee_number'
    // Django Line 432: Set session expiry to 86400 (24 hours)
    const response = NextResponse.json(
      {
        success: true,
        user: {
          employee_number: employee_number,
        },
      },
      { status: 200 }
    );

    // Set session cookie with EXACT 86400 second expiry (matches Django line 432)
    response.cookies.set('session', JSON.stringify({
      employee_number: employee_number,
      timestamp: Date.now(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours in seconds - MATCHES DJANGO
      path: '/',
    });

    console.log('\n✅ Session created with 24-hour expiry (86400 seconds)');
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║               ✅ LOGIN SUCCESSFUL                         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n' + '═'.repeat(61) + '\n\n');

    return response;
  } catch (error) {
    console.error('\n❌ Login error:', error);
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║               ❌ LOGIN ERROR                              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n' + '═'.repeat(61) + '\n\n');
    return NextResponse.json(
      { error: 'An error occurred during login. Please try again later.' },
      { status: 500 }
    );
  }
}
