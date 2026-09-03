import { faker} from "@faker-js/faker";
import { prisma } from "../lib/prisma";

// this seed is needed for filling up a demo project
const seedDemo = async()=>{
  // Clear existing data (optional, but prevents duplicates)
  await prisma.user.deleteMany()
  //CREATE GUEST ACCOUNT
  await prisma.user.create({
    data:{
      email: 'GuestUser@guest.com',
      name: 'Guest User',
      password: await bcrypt('Guest@us3r', 10)
    }
  })
 
  const userData = [];
  //loads 8 viEWABLE ACCOUNTS
  for(let i = 0 ; i < 10 ; i++){
    if(i >= 8){
      userData.push({
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: await bcrypt.hash(faker.internet.password(), 10),
          photo: faker.image.avatar(),
          isPrivate: true
          
      })
    }else{
      userData.push({
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: await bcrypt.hash(faker.internet.password(), 10),
          photo: faker.image.avatar(),
          
      })      
    }

  }

  await prisma.user.createMany({
    data: userData
  })
  //fetch all users that are not guest or developer
  const demoUsers = await prisma.user.findMany({
    where: {
      AND:[
        {email:{not:'GuestUser@guest.com'}},
        {githubId: null}
      ]
    },
    select:{
      id: true,
      name: true
    }
  });
  // CREATE FRIENDSHIP 
  //define connection: 3 active/ 2 pending / 1 blocked  
  // for Guest user: where email => GuestUser@guest.com
  const guest = await prisma.user.findUnique({
    where:{email: 'GuestUser@guest.com'},
    select: {
      name: true,
      id: true
    }
  })
 

  //define connection: 3 active/ 2 pending / 1 blocked   
  // for devuser : where email => MayaOfTheVoid@gmail.com
  const devUser = await prisma.user.findUnique({
    where: {
      githubId: {not: null}
    },
    select:{
      name: true,
      id: true
    }
  })
  //define random fake friendships between fake users
  //create 8 visible posts per user + two hidden of which 5 are with photos
  const postData = [];

  demoUsers.forEach(user=>{
    for(let i = 0; i < 11; i++){
      if(i >= 8){
        postData.push({
          content: faker.lorem.paragraph(),
          photoUrl: i%2 === 0 ? faker.image.urlPicsumPhotos(): null,
          authorId: user.id,
          visibilty: false 
        })
      }else{
        postData.push({
          content: faker.lorem.paragraph(),
          photoUrl: i%2 === 0 ? faker.image.urlPicsumPhotos(): null,
          authorId: user.id, 
        })        
      }

    }
  })
  await prisma.post.createManyAndReturn({
    data: postData
  })
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