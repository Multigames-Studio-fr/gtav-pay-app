import { prisma } from "@/lib/prisma";
import { UsersAdminClient } from "./UsersAdminClient";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      memberships: {
        include: { company: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <UsersAdminClient users={users as any} />;
}
