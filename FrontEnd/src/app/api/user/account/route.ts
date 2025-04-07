import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';

// ✅ اضافه شدن /api و دامنه مناسب برای production
const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/users/account`
  : 'http://localhost:3001/api/users/account';

export async function GET(request: NextRequest) { 
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]; 
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status !== 200) {
      return NextResponse.json({ error: 'Failed to retrieve user data' }, { status: response.status });
    }

    const userData = response.data; 
    return NextResponse.json({
      phone: userData.phone || 'N/A',
      email: userData.email || 'N/A',
      address: userData.address || 'N/A',
      fullname: userData.fullname || 'N/A',
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = status >= 500 ? 'Server error occurred' : 'Client error occurred';
      
      return NextResponse.json({ error: message, details: error.response?.data }, { status });
    } else {
      return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
    }
  }
}
