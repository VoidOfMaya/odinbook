import { faker} from "@faker-js/faker";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import { useId } from "react";

// this seed is needed for filling up a demo project
const seedDemo = async()=>{
  // Clear existing data (optional, but prevents duplicates)
  await prisma.$transaction(async (pris) =>{
    await pris.comment.deleteMany()
    await pris.post.deleteMany()
    await pris.userFriends.deleteMany()
    await pris.user.deleteMany({
      where:{githubId: null}
    })    
  })

  //CREATE GUEST ACCOUNT
  console.log('start: Creating guest account')
  await prisma.user.create({
    data:{
      email: 'GuestUser@guest.com',
      name: 'Guest User',
      password: await bcrypt.hash('Guest@us3r', 10)
    }
  })
  console.log('Complete: Creating guest account')
  console.log('start: populate demo accounts')
  const userData = [];
  //loads 8 VIEWABLE ACCOUNTS
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
  console.log('finish: populate demo accounts')
  console.log('start: intialize friendships data')
  console.log('start: setting guest friendships')
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

  const friendships = [];

  for(let i = 0; i < 7; i++){
    if(i < 3){
      friendships.push({
        status: 'ACTIVE',
        userId: guest.id,
        friendId: demoUsers[i].id
      })
    }
    if(i >= 3 && i < 6){
      friendships.push({
        status: 'PENDING',
        userId: guest.id,
        friendId: demoUsers[i].id
      })   
    }
      if(i === 6){
      friendships.push({
        status: 'BLOCKED',
        userId: guest.id,
        friendId: demoUsers[i].id
      })   
    }
    if( i > 6){
      friendships.push({
        status: 'DECLINED',
        userId: guest.id,
        friendId: demoUsers[i].id
      })      
    }

  }
  await prisma.userFriends.createMany({
    data:friendships
  })
  console.log('finish: setting guest friendships')
  console.log('start: setting dev friendships')
  //define connection: 4 active {one user is private}/ 2 pending / 1 blocked   
  // for devuser : where email => MayaOfTheVoid@gmail.com
  const devUser = await prisma.user.findFirst({
    where: {
      githubId: {not: null}
    },
    select:{
      name: true,
      id: true
    }
  })
    const devFriendships = [];

  for(let i = 0; i < 10; i++){
    if(i >= 3 && i < 6){
      devFriendships.push({
        status: 'ACTIVE',
        userId: devUser.id,
        friendId: demoUsers[i].id
      })
    }
    if(i >= 6 && i < 8){
      devFriendships.push({
        status: 'PENDING',
        userId: devUser.id,
        friendId: demoUsers[i].id
      })   
    }
      if(i === 8){
      devFriendships.push({
        status: 'BLOCKED',
        userId: devUser.id,
        friendId: demoUsers[i].id
      })   
    }
    if( i === 9){
      devFriendships.push({
        status: 'ACTIVE',
        userId: devUser.id,
        friendId: demoUsers[i].id
      })      
    }

  }
  await prisma.userFriends.createMany({
    data: devFriendships
  })
  console.log('finish: setting dev friendships')
  console.log('finish:intialize friendship data')
  //define random fake friendships between fake users
  //create 8 visible posts per user + 3 hidden of which 5 are with photos
  const postData = [];

  demoUsers.forEach(user=>{
    for(let i = 0; i < 11; i++){
      if(i >= 8){
        postData.push({
          content: faker.lorem.paragraph(),
          photoUrl: i%2 === 0 ? faker.image.urlPicsumPhotos(): null,
          authorId: user.id,
          visibility: false 
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
  const postIds = await prisma.post.createManyAndReturn({
    data: postData,
    select:{
      id: true
    }
  })
  // requires postsids and user ids
  const commentData = [];
  postIds.forEach(postId =>{
    //on eacg post every user should comment
    demoUsers.forEach(user=>{
      for(let i = 0; i < 3; i++){
        commentData.push({
          content: faker.lorem.paragraph(),
          authorId: user.id,
          postId: postId.id
        })        
      }

    })
  })
  await prisma.comment.createMany({
    data: commentData
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