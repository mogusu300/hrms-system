import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Django Line 498: Log current session state
    const sessionCookie = request.cookies.get('session');
    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(sessionCookie.value);
        console.log('\n📋 Current Session Before Logout:', sessionData);
      } catch (e) {
        console.log('\n📋 Current Session Before Logout: [Invalid JSON]');
      }
    } else {
      console.log('\n📋 Current Session Before Logout: [No Session]');
    }

    // Django Line 501-504: Iterate over keys and delete
    // The session keys to delete are: ['user_id', 'employee_number']
    // In our case, we'll clear the entire session cookie
    
    // Django Line 507-508: Flush session completely and call logout()
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Django Line 510: Log new empty session state
    console.log('\n📋 Session After Logout (Flushed): {}');

    // Clear the session cookie completely (equivalent to Django flush + logout)
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Immediately expires the cookie
      path: '/',
    });

    console.log('\n✅ Session cleared and cookie removed');
    console.log('═'.repeat(61) + '\n');

    // Django Line 512: Redirect to login (in API, we just return success - frontend redirects)
    return response;
  } catch (error) {
    console.error('\n❌ Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
