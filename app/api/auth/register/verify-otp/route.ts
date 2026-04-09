import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_number, otp, otp_sent } = body;

    console.log('\n\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║              🔐 OTP VERIFICATION REQUEST RECEIVED          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n👤 Employee Number:', employee_number);
    console.log('🔑 OTP Entered: [REDACTED]');
    console.log('🔑 OTP Expected: [REDACTED]');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('\n' + '═'.repeat(61) + '\n');

    if (!employee_number || !otp) {
      console.log('❌ Missing required fields\n');
      return NextResponse.json(
        { error: 'Employee number and OTP are required' },
        { status: 400 }
      );
    }

    // Django Line 216: Exact string match: otp_input == otp_result
    const otpStored = typeof otp === 'string' ? otp : String(otp);
    
    console.log('📋 Step 1: Verifying OTP...');
    
    // String comparison ONLY - no format validation like Django line 216
    if (otp_sent && otpStored === String(otp_sent)) {
      console.log('✅ OTP matches');
      console.log('\n╔═══════════════════════════════════════════════════════════╗');
      console.log('║            ✅ OTP VERIFICATION SUCCESSFUL                 ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log('\n' + '═'.repeat(61) + '\n\n');

      // Django Line 223: Redirect to create_web_user on success
      // In API, we return 200 with success flag, frontend redirects
      const response = NextResponse.json(
        {
          success: true,
          message: 'OTP verified successfully',
        },
        { status: 200 }
      );

      return response;
    } else {
      console.log('❌ OTP does not match');
      console.log(`   Entered: ${otpStored}`);
      console.log(`   Expected: ${otp_sent || 'not provided'}`);
      console.log('═'.repeat(61) + '\n');
      
      // Django Line 219-221: Return render login.html with error
      // In API, return plain text response with 200 status (like Django)
      // Django returns: HttpResponse("Invalid OTP. Please try again.")
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 200 } // Django returns 200 on OTP mismatch, not 401
      );
    }
  } catch (error) {
    console.error('\n❌ OTP verification error:', error);
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║             ❌ OTP VERIFICATION ERROR                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n' + '═'.repeat(61) + '\n\n');
    return NextResponse.json(
      { error: 'An error occurred while verifying the OTP. Please try again later.' },
      { status: 500 }
    );
  }
}
