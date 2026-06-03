import { prisma } from "./src/lib/prisma";

async function main() {
  const permissions = [
    { key: "product:create" },
    { key: "product:edit" },
    { key: "product:delete" },
    { key: "sales:create" },
    { key: "sales:view" },
    { key: "sales:void" },
    { key: "sales:history" },
    { key: "inventory:view" },
    { key: "inventory:edit" },
    { key: "inventory:stock_adjust" },
    { key: "staff:view" },
    { key: "staff:edit" },
    { key: "staff:payroll" },
    { key: "reports:view" },
    { key: "reports:export" },
    { key: "accounting:view" },
    { key: "accounting:edit" },
    { key: "system:settings" },
    { key: "system:audit_logs" },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: {},
      create: { key: p.key },
    });
  }
  console.log('✅ Permissions seeded.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
