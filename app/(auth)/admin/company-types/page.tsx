import { prisma } from "@/lib/prisma";
import { CompanyTypesClient } from "./CompanyTypesClient";

export default async function CompanyTypesPage() {
  const types = await prisma.companyType.findMany({
    include: {
      _count: { select: { companies: true, roles: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <CompanyTypesClient types={types as any} />;
}
