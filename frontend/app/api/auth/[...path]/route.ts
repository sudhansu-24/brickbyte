import { NextRequest } from "next/server";
import { proxyRequest } from "../../proxy";

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/");
  return proxyRequest(req, `/auth/${path}`);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/");
  return proxyRequest(req, `/auth/${path}`);
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/");
  return proxyRequest(req, `/auth/${path}`);
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/");
  return proxyRequest(req, `/auth/${path}`);
}
