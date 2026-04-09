import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const employeeNumber = formData.get('employeeNumber') as string;

    if (!file || !employeeNumber) {
      return NextResponse.json(
        { success: false, message: 'File and employee number are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Only JPG, PNG, and GIF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 2MB' },
        { status: 400 }
      );
    }

    // Read file as data URL
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log(`✅ Profile picture processed for employee ${employeeNumber}`);
    console.log(`📁 Data URL length: ${dataUrl.length} characters`);

    return NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      imageUrl: dataUrl,
    });
  } catch (error: any) {
    console.error('Error processing profile picture:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing file', error: error.message },
      { status: 500 }
    );
  }
}

