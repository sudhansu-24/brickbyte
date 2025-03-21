import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/app/api/proxy';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, `/governance/${params.path.join('/')}`);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, `/governance/${params.path.join('/')}`);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, `/governance/${params.path.join('/')}`);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, `/governance/${params.path.join('/')}`);
}
