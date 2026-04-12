import { prisma } from "@/lib/prisma";
import { CompaniesAdminClient } from "./CompaniesAdminClient";

export default async function AdminCompaniesPage() {
  const [companies, companyTypes] = await Promise.all([
    prisma.company.findMany({
      include: {
        type: true,
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.companyType.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <CompaniesAdminClient companies={companies as any} companyTypes={companyTypes} />;
}
