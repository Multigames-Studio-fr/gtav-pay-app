import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.isWebmaster)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, description, typeId } = await req.json();
  const company = await prisma.company.create({
    data: { name, description, typeId },
  });
  return NextResponse.json(company);
}
