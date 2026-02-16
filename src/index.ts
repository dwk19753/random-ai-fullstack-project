import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a user
  const user = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice',
    },
  });

  console.log('Created user:', user);

  // Create a post for the user
  const post = await prisma.post.create({
    data: {
      title: 'My First Post',
      body: 'This is a simple database test',
      userId: user.id,
    },
  });

  console.log('Created post:', post);

  // Query all users with their posts
  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
    },
  });

  console.log('All users with posts:', JSON.stringify(allUsers, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
