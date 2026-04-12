import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function checkWebmaster() {
  const session = await auth();
  return session?.user?.isWebmaster ? session : null;
}

export async function POST(req: Request) {
  const session = await checkWebmaster();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, description, procedures, color } = await req.json();
  const type = await prisma.companyType.create({
    data: { name, description, procedures, color: color ?? "#6366f1" },
  });
  return NextResponse.json(type);
}
