import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';

const WEBSERVICE_URL = 'http://41.216.68.50:7247/BusinessCentral142/WS/Mulonga%20Water%20Supply/Codeunit/WebAPI';
const WEBUSER = 'WEBUSER';
const PASSWORD = 'Pass@123!$';

function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function createWebUser(
  userId: string,
  fullName: string,
  emailAddress: string,
  phoneNumber: string,
  nrc: string,
  employeeNumber: string
): Promise<{ success: boolean; result: string }> {
  const soapBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI">
  <soapenv:Header/>
  <soapenv:Body>
    <web:CreateWebUser>
      <web:userId>${escapeXml(userId)}</web:userId>
      <web:fullName>${escapeXml(fullName)}</web:fullName>
      <web:emailAddress>${escapeXml(emailAddress)}</web:emailAddress>
      <web:phoneNumber>${escapeXml(phoneNumber)}</web:phoneNumber>
      <web:nRC>${escapeXml(nrc)}</web:nRC>
      <web:employeeNumber>${escapeXml(employeeNumber)}</web:employeeNumber>
      <web:registeredFrom>2023</web:registeredFrom>
    </web:CreateWebUser>
  </soapenv:Body>
</soapenv:Envelope>`;

  console.log('\n📤 SOAP REQUEST (CreateWebUser)');
  console.log('─'.repeat(61));
  console.log('URL:', WEBSERVICE_URL);
  console.log('Method: POST');
  console.log('\nHeaders:');
  console.log('  Content-Type: text/xml;charset=UTF-8');
  console.log('  SOAPAction: urn:microsoft-dynamics-schemas/codeunit/WebAPI:CreateWebUser');
  console.log('\nBody:');
  console.log(soapBody);
  console.log('─'.repeat(61));

  const response = await fetch(WEBSERVICE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${WEBUSER}:${PASSWORD}`)}`,
      'Content-Type': 'text/xml;charset=UTF-8',
      'SOAPAction': 'urn:microsoft-dynamics-schemas/codeunit/WebAPI:CreateWebUser',
    },
    body: soapBody,
  });

  const responseText = await response.text();

  console.log('\n📥 SOAP RESPONSE (CreateWebUser)');
  console.log('─'.repeat(61));
  console.log('Status:', response.status, response.statusText);
  console.log('\nResponse Body:');
  console.log(responseText);
  console.log('─'.repeat(61));

  if (!response.ok) {
    console.log('\n❌ Error: SOAP Request failed with status', response.status);
    throw new Error(`SOAP request failed: ${response.statusText}`);
  }

  // Parse the return value from the SOAP response
  // Try both namespaced (<web:return_value>) and non-namespaced (<return_value>) patterns
  let returnMatch = responseText.match(/<web:return_value>(.+?)<\/web:return_value>/);
  if (!returnMatch) {
    returnMatch = responseText.match(/<return_value>(.+?)<\/return_value>/);
  }
  const returnValue = returnMatch ? returnMatch[1].trim() : null;

  console.log('\n📋 Parsed Result:');
  console.log('Return Value:', returnValue);
  console.log('─'.repeat(61) + '\n');

  // Business Central returns numeric values: 0=false/error, >0=true/success
  const success = returnValue !== '0' && returnValue !== null && returnValue.toLowerCase() !== 'false';
  if (success) {
    return { success: true, result: returnValue };
  } else {
    return { success: false, result: returnValue || 'Unknown error' };
  }
}

async function saveWebPassword(
  userId: string,
  userPassword: string,
  employeeNumber: string
): Promise<{ success: boolean; result: string }> {
  const soapBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="urn:microsoft-dynamics-schemas/codeunit/WebAPI">
  <soapenv:Header/>
  <soapenv:Body>
    <web:SaveWebPassword>
      <web:userId>${escapeXml(userId)}</web:userId>
      <web:userPassword>${escapeXml(userPassword)}</web:userPassword>
      <web:employeeNumber>${escapeXml(employeeNumber)}</web:employeeNumber>
    </web:SaveWebPassword>
  </soapenv:Body>
</soapenv:Envelope>`;

  console.log('\n📤 SOAP REQUEST (SaveWebPassword)');
  console.log('─'.repeat(61));
  console.log('URL:', WEBSERVICE_URL);
  console.log('Method: POST');
  console.log('\nHeaders:');
  console.log('  Content-Type: text/xml;charset=UTF-8');
  console.log('  SOAPAction: urn:microsoft-dynamics-schemas/codeunit/WebAPI:SaveWebPassword');
  console.log('\nBody:');
  console.log(soapBody);
  console.log('─'.repeat(61));

  const response = await fetch(WEBSERVICE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${WEBUSER}:${PASSWORD}`)}`,
      'Content-Type': 'text/xml;charset=UTF-8',
      'SOAPAction': 'urn:microsoft-dynamics-schemas/codeunit/WebAPI:SaveWebPassword',
    },
    body: soapBody,
  });

  const responseText = await response.text();

  console.log('\n📥 SOAP RESPONSE (SaveWebPassword)');
  console.log('─'.repeat(61));
  console.log('Status:', response.status, response.statusText);
  console.log('\nResponse Body:');
  console.log(responseText);
  console.log('─'.repeat(61));

  if (!response.ok) {
    console.log('\n❌ Error: SOAP Request failed with status', response.status);
    throw new Error(`SOAP request failed: ${response.statusText}`);
  }

  // Parse the return value from the SOAP response
  // Try both namespaced (<web:return_value>) and non-namespaced (<return_value>) patterns
  let returnMatch = responseText.match(/<web:return_value>(.+?)<\/web:return_value>/);
  if (!returnMatch) {
    returnMatch = responseText.match(/<return_value>(.+?)<\/return_value>/);
  }
  const returnValue = returnMatch ? returnMatch[1].trim() : null;

  console.log('\n📋 Parsed Result:');
  console.log('Return Value:', returnValue);
  console.log('─'.repeat(61) + '\n');

  // Business Central returns numeric values: 0=false/error, >0=true/success
  const success = returnValue !== '0' && returnValue !== null && returnValue.toLowerCase() !== 'false';
  if (success) {
    return { success: true, result: returnValue };
  } else {
    return { success: false, result: returnValue || 'Unknown error' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      full_name,
      email_address,
      phone_number,
      nrc,
      password,
      employee_number,
    } = body;

    console.log('\n\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║           👤 CREATE ACCOUNT REQUEST RECEIVED               ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n📝 Registration Data:');
    console.log('  User ID:', user_id);
    console.log('  Full Name:', full_name);
    console.log('  Email:', email_address);
    console.log('  Phone:', phone_number);
    console.log('  NRC:', nrc);
    console.log('  Employee Number:', employee_number);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('\n' + '═'.repeat(61) + '\n');

    // Validate required fields
    if (!user_id || !full_name || !email_address || !phone_number || !nrc || !password || !employee_number) {
      console.log('❌ Missing required fields\n');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    console.log('📋 Step 1: Creating web user via SOAP...');
    const createResult = await createWebUser(
      user_id,
      full_name,
      email_address,
      phone_number,
      nrc,
      employee_number
    );

    if (!createResult.success) {
      console.log('❌ Failed to create web user');
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║           ❌ ACCOUNT CREATION FAILED                      ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log('\n' + '═'.repeat(61) + '\n\n');
      return NextResponse.json(
        { error: 'Failed to create web user: ' + createResult.result },
        { status: 500 }
      );
    }

    console.log('✅ Web user created successfully in Business Central');

    console.log('\n📋 Step 2: Saving password to Business Central...');
    const passwordResult = await saveWebPassword(
      user_id,
      password,
      employee_number
    );

    if (!passwordResult.success) {
      console.log('❌ Failed to save password to Business Central');
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║           ❌ ACCOUNT CREATION FAILED                      ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log('\n' + '═'.repeat(61) + '\n\n');
      return NextResponse.json(
        { error: 'Failed to save password: ' + passwordResult.result },
        { status: 500 }
      );
    }

    console.log('✅ Password saved successfully to Business Central');

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║         ✅ ACCOUNT CREATED SUCCESSFULLY                   ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n' + '═'.repeat(61) + '\n\n');

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user_id: user_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('\n❌ Account creation error:', error);
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║          ❌ ACCOUNT CREATION ERROR                         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n' + '═'.repeat(61) + '\n\n');
    
    return NextResponse.json(
      { error: 'An error occurred while creating your account. Please try again later.' },
      { status: 500 }
    );
  }
}
