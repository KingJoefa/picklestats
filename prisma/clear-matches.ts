import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.match.deleteMany({})
  console.log('All matches deleted!')
}

main().finally(() => prisma.$disconnect()) 