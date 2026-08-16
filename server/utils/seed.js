import { faker} from "@faker-js/faker";
import { prisma } from "../lib/prisma";

// this seed is needed for filling up a demo project
const seedDemo = async()=>{
  // Clear existing data (optional, but prevents duplicates)
  await prisma.user.deleteMany()

  // Add your seed data

  
  console.log('Database seeded successfully!')
}

seedDemo()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })