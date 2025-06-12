import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.checkinLog.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.subscriptionPackage.deleteMany();
  await prisma.event.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding database...');

  // Create admin users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@qrcheckin.com',
      username: 'admin',
      password: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });
  console.log(`Created admin user: ${admin.email}`);
  
  // Create Toan admin user
  const toanPasswordHash = await bcrypt.hash('ToanLinh', 10);
  const toanAdmin = await prisma.user.create({
    data: {
      email: 'toan@zplus.vn',
      username: 'toan',
      password: toanPasswordHash,
      firstName: 'Toan',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log(`Created admin user: ${toanAdmin.email}`);

  // Create staff user
  const staffPasswordHash = await bcrypt.hash('staff123', 10);
  const staff = await prisma.user.create({
    data: {
      email: 'staff@qrcheckin.com',
      username: 'staff',
      password: staffPasswordHash,
      firstName: 'Staff',
      lastName: 'User',
      role: 'STAFF',
    },
  });
  console.log(`Created staff user: ${staff.email}`);

  // Create normal user
  const userPasswordHash = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@qrcheckin.com',
      username: 'user',
      password: userPasswordHash,
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER',
    },
  });
  console.log(`Created regular user: ${user.email}`);

  // Create clubs
  const fitnessClub = await prisma.club.create({
    data: {
      name: 'Fitness Club',
      description: 'A club for fitness enthusiasts',
    },
  });
  console.log(`Created club: ${fitnessClub.name}`);

  const yogaClub = await prisma.club.create({
    data: {
      name: 'Yoga Studio',
      description: 'A peaceful yoga studio',
    },
  });
  console.log(`Created club: ${yogaClub.name}`);

  // Create subscription packages
  const monthlyPackage = await prisma.subscriptionPackage.create({
    data: {
      name: 'Monthly Standard',
      description: 'Standard monthly access to our facility',
      type: 'MONTHLY',
      price: 49.99,
      duration: 30,
      features: ['Gym access', 'Locker rooms', 'Standard equipment'],
      isPopular: true,
      clubId: fitnessClub.id,
    },
  });
  console.log(`Created package: ${monthlyPackage.name}`);

  const yearlyPackage = await prisma.subscriptionPackage.create({
    data: {
      name: 'Yearly Premium',
      description: 'Full yearly access with premium benefits',
      type: 'YEARLY',
      price: 499.99,
      discountPrice: 449.99,
      duration: 365,
      features: ['24/7 access', 'All classes included', 'Personal trainer sessions', 'Towel service', 'Sauna access'],
      isPopular: false,
      clubId: fitnessClub.id,
    },
  });
  console.log(`Created package: ${yearlyPackage.name}`);

  // Create events
  const event1 = await prisma.event.create({
    data: {
      name: 'Morning Yoga',
      description: 'Start your day with a refreshing yoga session',
      startTime: new Date('2025-06-15T08:00:00Z'),
      endTime: new Date('2025-06-15T09:30:00Z'),
      location: 'Studio A',
      maxCapacity: 20,
      clubId: yogaClub.id,
    },
  });
  console.log(`Created event: ${event1.name}`);

  const event2 = await prisma.event.create({
    data: {
      name: 'HIIT Training',
      description: 'High-intensity interval training for maximum results',
      startTime: new Date('2025-06-16T18:00:00Z'),
      endTime: new Date('2025-06-16T19:00:00Z'),
      location: 'Fitness Room B',
      maxCapacity: 15,
      clubId: fitnessClub.id,
    },
  });
  console.log(`Created event: ${event2.name}`);

  // Create subscription for the user
  const now = new Date();
  const userSubscription = await prisma.subscription.create({
    data: {
      name: 'Monthly Subscription',
      type: 'MONTHLY',
      price: monthlyPackage.price,
      duration: monthlyPackage.duration,
      startDate: now,
      endDate: new Date(now.getTime() + monthlyPackage.duration * 24 * 60 * 60 * 1000),
      userId: user.id,
      clubId: fitnessClub.id,
      packageId: monthlyPackage.id,
    },
  });
  console.log(`Created subscription for user: ${userSubscription.name}`);

  // Create QR code for the subscription
  const qrCode = await prisma.qRCode.create({
    data: {
      code: `USER-${user.id}-SUB-${userSubscription.id}`,
      userId: user.id,
      subscriptionId: userSubscription.id,
      expiresAt: userSubscription.endDate,
    },
  });
  console.log(`Created QR code: ${qrCode.code}`);

  // Create check-in log
  const checkinLog = await prisma.checkinLog.create({
    data: {
      type: 'CHECKIN',
      userId: user.id,
      eventId: event2.id,
      subscriptionId: userSubscription.id,
      qrCodeId: qrCode.id,
      location: 'Main Entrance',
      notes: 'First visit',
    },
  });
  console.log(`Created check-in log at ${checkinLog.timestamp}`);

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
