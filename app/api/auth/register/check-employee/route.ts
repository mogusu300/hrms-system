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

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

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
    
    // Debug: Log actual auth header
    const authHeader = getAuthHeader();
    console.log('   • Auth Header (first 20 chars):', authHeader.substring(0, 20) + '...');
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

    const responseText = await response.text();
    console.log('\n📄 Response Body:');
    console.log('─'.repeat(50));
    console.log(responseText);
    console.log('─'.repeat(50));

    if (!response.ok) {
      console.error(`\n❌ SOAP error: ${response.status} ${response.statusText}`);
      return { 
        success: false, 
        result: null,
        message: `HTTP ${response.status}: ${response.statusText}` 
      };
    }

    // Parse SOAP response
    try {
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
          message: success ? 'Success' : result
        };
      }

      console.log('\n⚠️  Could not find return_value in response');
      return { 
        success: false, 
        result: null,
        message: 'Could not parse response' 
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

async function checkEmployeeExists(employeeNumber: string): Promise<{ exists: boolean; result: string | null }> {
  const soapBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI"><soapenv:Header/><soapenv:Body><web:EmployeeExist><web:employeeNumber>${escapeXml(employeeNumber)}</web:employeeNumber></web:EmployeeExist></soapenv:Body></soapenv:Envelope>`;

  const result = await makeSoapRequest(soapBody, 'EmployeeExist');
  console.log(`\n👤 EmployeeExist Result: ${result.result}`);
  return { exists: result.result === '1', result: result.result };
}

async function checkWebUserExists(employeeNumber: string): Promise<{ exists: boolean; result: string | null }> {
  const soapBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI"><soapenv:Header/><soapenv:Body><web:WebUserExist><web:employeeNumber>${escapeXml(employeeNumber)}</web:employeeNumber></web:WebUserExist></soapenv:Body></soapenv:Envelope>`;

  const result = await makeSoapRequest(soapBody, 'WebUserExist');
  console.log(`\n🔐 WebUserExist Result: ${result.result}`);
  return { exists: result.result === '1', result: result.result };
}

async function sendOTP(employeeNumber: string, phoneNumber: string): Promise<{ success: boolean; otp: string | null; result: string | null }> {
  const soapBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI"><soapenv:Header/><soapenv:Body><web:SendOTP><web:employeeNumber>${escapeXml(employeeNumber)}</web:employeeNumber><web:accountNumber>${escapeXml(employeeNumber)}</web:accountNumber><web:phoneNumber>${escapeXml(phoneNumber)}</web:phoneNumber></web:SendOTP></soapenv:Body></soapenv:Envelope>`;

  const result = await makeSoapRequest(soapBody, 'SendOTP');
  console.log(`\n📱 SendOTP Result: ${result.result}`);
  
  // OTP result should be numeric
  const isValidOTP = result.result && typeof result.result === 'string' && /^\d+$/.test(result.result);
  
  // Print OTP to terminal for testing purposes
  if (isValidOTP) {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║              🔐 OTP FOR TESTING                  ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log(`\n📌 Employee: ${employeeNumber}`);
    console.log(`📱 Phone: +${phoneNumber}`);
    console.log(`\n🔑 OTP CODE: ${result.result}`);
    console.log('\n' + '═'.repeat(61) + '\n');
  }
  
  return { 
    success: isValidOTP as boolean, 
    otp: isValidOTP ? result.result : null,
    result: result.result 
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_number, phone_number } = body;

    console.log('\n\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║            📋 CHECK EMPLOYEE REQUEST RECEIVED             ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n👤 Employee Number:', employee_number);
    console.log('📱 Phone Number: +', phone_number);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('\n' + '═'.repeat(61) + '\n');

    if (!employee_number || !phone_number) {
      console.log('❌ Missing required fields\n');
      return NextResponse.json(
        { error: 'Employee number and phone number are required' },
        { status: 400 }
      );
    }

    // Step 1: Check if employee exists
    console.log('📋 Step 1: Checking if employee exists...');
    const employeeCheck = await checkEmployeeExists(employee_number);
    
    if (employeeCheck.result !== '1') {
      console.log(`\n❌ Employee not found (Result: ${employeeCheck.result})`);
      console.log('═'.repeat(61) + '\n');
      return NextResponse.json(
        { error: 'Employee not found in system' },
        { status: 401 }
      );
    }
    console.log('✅ Employee exists');

    // Step 2: Check if web user already exists
    console.log('\n📋 Step 2: Checking if web user already exists...');
    const webUserCheck = await checkWebUserExists(employee_number);
    
    // If WebUserExist returns 1 or 2, user is already registered - reject for registration
    // Only allow 0 (not registered at all)
    if (webUserCheck.result !== '0') {
      console.log(`\n❌ User already registered (Result: ${webUserCheck.result})`);
      console.log('═'.repeat(61) + '\n');
      return NextResponse.json(
        { error: 'User already registered. Please login instead.' },
        { status: 409 }
      );
    }
    console.log('✅ User not yet registered');

    // Step 3: Send OTP (only if not already registered)
    console.log('\n📋 Step 3: Sending OTP to phone number...');
    const otpResult = await sendOTP(employee_number, phone_number);
    
    if (!otpResult.success || !otpResult.otp) {
      console.log(`\n❌ Failed to send OTP (Result: ${otpResult.result})`);
      console.log('═'.repeat(61) + '\n');
      return NextResponse.json(
        { error: `Failed to send OTP: ${otpResult.result}` },
        { status: 500 }
      );
    }
    console.log(`✅ OTP sent successfully (OTP: ${otpResult.otp})`);

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║            ✅ CHECK EMPLOYEE SUCCESSFUL                   ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n' + '═'.repeat(61) + '\n\n');

    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent to your phone',
        otp_result: otpResult.otp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('\n❌ Check employee error:', error);
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║               ❌ CHECK EMPLOYEE ERROR                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n' + '═'.repeat(61) + '\n\n');
    return NextResponse.json(
      { error: 'An error occurred while checking your details. Please try again later.' },
      { status: 500 }
    );
  }
}
