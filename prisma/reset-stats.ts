import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const playerNames = ['Larry', 'Zach', 'Dustin', 'Ron', 'Phil', 'Paul']
  
  // Delete existing relationships and stats
  for (const name of playerNames) {
    const player = await prisma.player.findFirst({
      where: { name }
    })
    
    if (player) {
      // Delete related data
      await prisma.commonPartner.deleteMany({
        where: { playerId: player.id }
      })
      await prisma.topOpponent.deleteMany({
        where: { playerId: player.id }
      })
      await prisma.playerStats.deleteMany({
        where: { playerId: player.id }
      })
      
      // Create fresh stats
      await prisma.playerStats.create({
        data: {
          playerId: player.id,
          totalMatches: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          pointsScored: 0,
          pointsConceded: 0
        }
      })
    }
  }
  
  console.log('Stats reset completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 