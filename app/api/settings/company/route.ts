import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface CompanySettings {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  company_logo?: string;
  industry?: string;
}

const DEFAULT_SETTINGS: CompanySettings = {
  company_name: 'Mulonga Water Supply',
  company_email: 'info@mulongawater.com',
  company_phone: '+260 211 123 456',
  company_address: 'Cairo Road, Lusaka, Zambia',
  industry: 'Water Supply',
};

export async function GET(request: NextRequest) {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  GET COMPANY SETTINGS REQUEST                                  ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Return default settings - client will manage persistence via localStorage
    console.log(`✅ SUCCESS: Returning default company settings`);
    console.log(JSON.stringify(DEFAULT_SETTINGS, null, 2));
    console.log(`\n════════════════════════════════════════════════════════════════\n`);

    return NextResponse.json(DEFAULT_SETTINGS);
  } catch (error: any) {
    console.error('\n❌ Unexpected error in get company settings:', error);
    console.log(`\n════════════════════════════════════════════════════════════════\n`);

    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_name, company_email, company_phone, company_address, industry } = body;

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  UPDATE COMPANY SETTINGS REQUEST                               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`📋 Updated Settings:`);
    console.log(`   • Company Name: ${company_name}`);
    console.log(`   • Email: ${company_email}`);
    console.log(`   • Phone: ${company_phone}`);
    console.log(`   • Address: ${company_address}`);
    console.log(`   • Industry: ${industry}\n`);

    // Settings are stored in localStorage on client side
    // Server just acknowledges the update
    console.log(`✅ SUCCESS: Company settings acknowledged for client storage`);
    console.log(`\n════════════════════════════════════════════════════════════════\n`);

    return NextResponse.json({
      success: true,
      message: 'Company settings updated successfully',
    });
  } catch (error: any) {
    console.error('\n❌ Unexpected error in update company settings:', error);
    console.log(`\n════════════════════════════════════════════════════════════════\n`);

    return NextResponse.json(
      { success: false, message: 'Unexpected error occurred', error: error.message },
      { status: 500 }
    );
  }
}

