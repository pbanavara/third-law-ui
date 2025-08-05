import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = searchParams.get('offset') || '0';
    const limit = searchParams.get('limit') || '100';
    
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { error: 'Backend URL is not configured' },
        { status: 500 }
      );
    }

    // Forward the request to the backend
    const documentsUrl = new URL('/api/v1/documents', backendUrl).toString();
    const urlWithParams = `${documentsUrl}?offset=${offset}&limit=${limit}`;
    
    const response = await fetch(urlWithParams, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Documents proxy error:', error);
    return NextResponse.json(
      { error: 'Error fetching documents' },
      { status: 500 }
    );
  }
} 