import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

type JwtPayload = {
  userId: string;
  [key: string]: unknown;
};

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const owner_id = decoded.userId;

    const body = await request.json();
    const {
      name,
      location,
      type,
      image_url,
      description,
      total_shares,
      price_per_share,
      rental_yield,
      contract_address,
      blockchain_property_id
    } = body;

    // Validate required fields
    if (!name || !location || !type || !total_shares || !price_per_share || !rental_yield || !contract_address || !blockchain_property_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        location,
        type,
        image_url,
        description,
        total_shares,
        available_shares: total_shares,
        price_per_share,
        rental_yield,
        owner_id,
        contract_address,
        blockchain_property_id
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
} 