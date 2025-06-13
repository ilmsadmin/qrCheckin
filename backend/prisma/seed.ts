import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data (order matters for foreign keys)
  await prisma.payment.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.checkinLog.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.subscriptionPackage.deleteMany();
  await prisma.event.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.club.deleteMany();

  console.log('Seeding B2B SaaS database...');

  // Create System Admin
  const systemAdminPasswordHash = await bcrypt.hash('systemadmin123', 10);
  const systemAdmin = await prisma.user.create({
    data: {
      email: 'system@qrcheckin.com',
      username: 'systemadmin',
      password: systemAdminPasswordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'SYSTEM_ADMIN',
    },
  });
  console.log(`Created system admin: ${systemAdmin.email}`);

  // Create clubs (our B2B clients)
  const fitnessClub = await prisma.club.create({
    data: {
      name: 'Elite Fitness Club',
      description: 'Premium fitness facility with state-of-the-art equipment',
      subdomain: 'elite-fitness',
      contactEmail: 'admin@elitefitness.com',
      contactPhone: '+1-555-0123',
      address: '123 Fitness Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94102',
      planType: 'PROFESSIONAL',
      planPrice: 99.00,
      subscriptionStatus: 'ACTIVE',
      trialEndsAt: null,
      subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      maxCustomers: 1000,
      maxEvents: 50,
      maxStaff: 10,
      commissionRate: 0.05,
    },
  });
  console.log(`Created club: ${fitnessClub.name}`);

  const yogaStudio = await prisma.club.create({
    data: {
      name: 'Zen Yoga Studio',
      description: 'Peaceful yoga studio for mind and body wellness',
      subdomain: 'zen-yoga',
      contactEmail: 'contact@zenyoga.com',
      contactPhone: '+1-555-0456',
      address: '456 Meditation Lane',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      postalCode: '90210',
      planType: 'STARTER',
      planPrice: 49.00,
      subscriptionStatus: 'TRIAL',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      maxCustomers: 200,
      maxEvents: 20,
      maxStaff: 5,
      commissionRate: 0.03,
    },
  });
  console.log(`Created club: ${yogaStudio.name}`);

  // Create club admin and staff users
  const fitnessAdminPasswordHash = await bcrypt.hash('fitadmin123', 10);
  const fitnessAdmin = await prisma.user.create({
    data: {
      email: 'admin@elitefitness.com',
      username: 'fitadmin',
      password: fitnessAdminPasswordHash,
      firstName: 'John',
      lastName: 'Smith',
      role: 'CLUB_ADMIN',
      clubId: fitnessClub.id,
    },
  });
  console.log(`Created club admin: ${fitnessAdmin.email}`);

  const fitnessStaffPasswordHash = await bcrypt.hash('fitstaff123', 10);
  const fitnessStaff = await prisma.user.create({
    data: {
      email: 'staff@elitefitness.com',
      username: 'fitstaff',
      password: fitnessStaffPasswordHash,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'CLUB_STAFF',
      clubId: fitnessClub.id,
    },
  });
  console.log(`Created club staff: ${fitnessStaff.email}`);

  const yogaAdminPasswordHash = await bcrypt.hash('yogaadmin123', 10);
  const yogaAdmin = await prisma.user.create({
    data: {
      email: 'contact@zenyoga.com',
      username: 'yogaadmin',
      password: yogaAdminPasswordHash,
      firstName: 'Mary',
      lastName: 'Chen',
      role: 'CLUB_ADMIN',
      clubId: yogaStudio.id,
    },
  });
  console.log(`Created club admin: ${yogaAdmin.email}`);

  // Create customers (end users who buy subscriptions)
  const customer1 = await prisma.customer.create({
    data: {
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Wilson',
      phone: '+1-555-1001',
      dateOfBirth: new Date('1990-05-15'),
      address: '789 Customer Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94103',
      emergencyContactName: 'Bob Wilson',
      emergencyContactPhone: '+1-555-1002',
      clubId: fitnessClub.id,
    },
  });
  console.log(`Created customer: ${customer1.email}`);

  const customer2 = await prisma.customer.create({
    data: {
      email: 'bob@example.com',
      firstName: 'Bob',
      lastName: 'Davis',
      phone: '+1-555-2001',
      dateOfBirth: new Date('1985-08-20'),
      address: '321 Yoga Avenue',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      postalCode: '90211',
      clubId: yogaStudio.id,
    },
  });
  console.log(`Created customer: ${customer2.email}`);

  // Create more customers for testing
  const customer3 = await prisma.customer.create({
    data: {
      email: 'sarah.wilson@example.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      phone: '+1-555-3001',
      dateOfBirth: new Date('1992-03-15'),
      address: '456 Health Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94103',
      clubId: fitnessClub.id,
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      email: 'mike.taylor@example.com',
      firstName: 'Mike',
      lastName: 'Taylor',
      phone: '+1-555-3002',
      dateOfBirth: new Date('1988-11-22'),
      address: '789 Gym Boulevard',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94104',
      clubId: fitnessClub.id,
    },
  });

  const customer5 = await prisma.customer.create({
    data: {
      email: 'emma.brown@example.com',
      firstName: 'Emma',
      lastName: 'Brown',
      phone: '+1-555-3003',
      dateOfBirth: new Date('1995-07-08'),
      address: '321 Wellness Way',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94105',
      clubId: fitnessClub.id,
    },
  });

  const customer6 = await prisma.customer.create({
    data: {
      email: 'david.clark@example.com',
      firstName: 'David',
      lastName: 'Clark',
      phone: '+1-555-3004',
      dateOfBirth: new Date('1987-12-03'),
      address: '654 Fitness Road',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94106',
      clubId: fitnessClub.id,
    },
  });

  const customer7 = await prisma.customer.create({
    data: {
      email: 'lisa.martinez@example.com',
      firstName: 'Lisa',
      lastName: 'Martinez',
      phone: '+1-555-3005',
      dateOfBirth: new Date('1993-09-17'),
      address: '987 Active Lane',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94107',
      clubId: fitnessClub.id,
    },
  });

  const customer8 = await prisma.customer.create({
    data: {
      email: 'james.anderson@example.com',
      firstName: 'James',
      lastName: 'Anderson',
      phone: '+1-555-3006',
      dateOfBirth: new Date('1991-04-25'),
      address: '147 Strength Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94108',
      clubId: fitnessClub.id,
    },
  });

  const customer9 = await prisma.customer.create({
    data: {
      email: 'anna.garcia@example.com',
      firstName: 'Anna',
      lastName: 'Garcia',
      phone: '+1-555-3007',
      dateOfBirth: new Date('1990-06-12'),
      address: '258 Power Place',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94109',
      clubId: fitnessClub.id,
    },
  });

  const customer10 = await prisma.customer.create({
    data: {
      email: 'ryan.thomas@example.com',
      firstName: 'Ryan',
      lastName: 'Thomas',
      phone: '+1-555-3008',
      dateOfBirth: new Date('1989-01-30'),
      address: '369 Energy Avenue',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94110',
      clubId: fitnessClub.id,
    },
  });

  // Yoga studio customers
  const customer11 = await prisma.customer.create({
    data: {
      email: 'sophia.lee@example.com',
      firstName: 'Sophia',
      lastName: 'Lee',
      phone: '+1-555-4001',
      dateOfBirth: new Date('1994-05-18'),
      address: '741 Zen Circle',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      postalCode: '90212',
      clubId: yogaStudio.id,
    },
  });

  const customer12 = await prisma.customer.create({
    data: {
      email: 'alex.white@example.com',
      firstName: 'Alex',
      lastName: 'White',
      phone: '+1-555-4002',
      dateOfBirth: new Date('1986-10-07'),
      address: '852 Mindful Street',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      postalCode: '90213',
      clubId: yogaStudio.id,
    },
  });

  const customer13 = await prisma.customer.create({
    data: {
      email: 'olivia.hall@example.com',
      firstName: 'Olivia',
      lastName: 'Hall',
      phone: '+1-555-4003',
      dateOfBirth: new Date('1992-02-14'),
      address: '963 Balance Boulevard',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      postalCode: '90214',
      clubId: yogaStudio.id,
    },
  });

  console.log('Created 13 total customers for testing');

  // Create subscription packages
  const monthlyFitnessPackage = await prisma.subscriptionPackage.create({
    data: {
      name: 'Monthly Elite Access',
      description: 'Full gym access with premium amenities',
      type: 'MONTHLY',
      price: 89.99,
      duration: 30,
      maxCheckins: 30,
      features: ['24/7 gym access', 'All equipment', 'Locker access', 'Shower facilities'],
      isActive: true,
      isPopular: true,
      clubId: fitnessClub.id,
    },
  });
  console.log(`Created package: ${monthlyFitnessPackage.name}`);

  const yearlyFitnessPackage = await prisma.subscriptionPackage.create({
    data: {
      name: 'Annual Elite Membership',
      description: 'Best value annual membership with all perks',
      type: 'YEARLY',
      price: 999.99,
      discountPrice: 799.99,
      duration: 365,
      features: ['Everything in monthly', 'Personal trainer sessions', 'Nutrition consultation', 'Guest passes'],
      isActive: true,
      isFeatured: true,
      clubId: fitnessClub.id,
    },
  });
  console.log(`Created package: ${yearlyFitnessPackage.name}`);

  const monthlyYogaPackage = await prisma.subscriptionPackage.create({
    data: {
      name: 'Monthly Zen Pass',
      description: 'Unlimited yoga classes and meditation sessions',
      type: 'MONTHLY',
      price: 59.99,
      duration: 30,
      features: ['Unlimited classes', 'Mat rental included', 'Meditation sessions'],
      isActive: true,
      isPopular: true,
      clubId: yogaStudio.id,
    },
  });
  console.log(`Created package: ${monthlyYogaPackage.name}`);

  // Create events
  const fitnessEvent = await prisma.event.create({
    data: {
      name: 'HIIT Bootcamp',
      description: 'High-intensity interval training for all levels',
      startTime: new Date('2025-06-15T18:00:00Z'),
      endTime: new Date('2025-06-15T19:00:00Z'),
      location: 'Main Gym Floor',
      maxCapacity: 20,
      currentCapacity: 0,
      requiresSubscription: true,
      clubId: fitnessClub.id,
    },
  });
  console.log(`Created event: ${fitnessEvent.name}`);

  const yogaEvent = await prisma.event.create({
    data: {
      name: 'Morning Flow',
      description: 'Gentle vinyasa flow to start your day',
      startTime: new Date('2025-06-16T08:00:00Z'),
      endTime: new Date('2025-06-16T09:30:00Z'),
      location: 'Studio A',
      maxCapacity: 15,
      currentCapacity: 0,
      requiresSubscription: true,
      allowWalkIns: true,
      walkInPrice: 25.00,
      clubId: yogaStudio.id,
    },
  });
  console.log(`Created event: ${yogaEvent.name}`);

  // Create subscriptions for customers
  const now = new Date();
  const customer1Subscription = await prisma.subscription.create({
    data: {
      name: 'Alice Monthly Membership',
      type: 'MONTHLY',
      status: 'ACTIVE',
      originalPrice: monthlyFitnessPackage.price,
      finalPrice: monthlyFitnessPackage.price,
      duration: monthlyFitnessPackage.duration,
      maxCheckins: monthlyFitnessPackage.maxCheckins,
      usedCheckins: 5,
      startDate: now,
      endDate: new Date(now.getTime() + monthlyFitnessPackage.duration * 24 * 60 * 60 * 1000),
      paymentStatus: 'COMPLETED',
      customerId: customer1.id,
      clubId: fitnessClub.id,
      packageId: monthlyFitnessPackage.id,
    },
  });
  console.log(`Created subscription: ${customer1Subscription.name}`);

  const customer2Subscription = await prisma.subscription.create({
    data: {
      name: 'Bob Monthly Zen Pass',
      type: 'MONTHLY',
      status: 'ACTIVE',
      originalPrice: monthlyYogaPackage.price,
      finalPrice: monthlyYogaPackage.price,
      duration: monthlyYogaPackage.duration,
      startDate: now,
      endDate: new Date(now.getTime() + monthlyYogaPackage.duration * 24 * 60 * 60 * 1000),
      paymentStatus: 'COMPLETED',
      customerId: customer2.id,
      clubId: yogaStudio.id,
      packageId: monthlyYogaPackage.id,
    },
  });
  console.log(`Created subscription: ${customer2Subscription.name}`);

  // Create QR codes for subscriptions
  const qrCode1 = await prisma.qRCode.create({
    data: {
      code: `QR-${customer1.id}-${customer1Subscription.id}`,
      clubId: fitnessClub.id,
      customerId: customer1.id,
      subscriptionId: customer1Subscription.id,
      expiresAt: customer1Subscription.endDate,
      usageCount: 5,
      lastUsedAt: new Date(),
    },
  });
  console.log(`Created QR code: ${qrCode1.code}`);

  const qrCode2 = await prisma.qRCode.create({
    data: {
      code: `QR-${customer2.id}-${customer2Subscription.id}`,
      clubId: yogaStudio.id,
      customerId: customer2.id,
      subscriptionId: customer2Subscription.id,
      expiresAt: customer2Subscription.endDate,
    },
  });
  console.log(`Created QR code: ${qrCode2.code}`);

  // Create subscriptions and QR codes for additional members
  const members = [customer3, customer4, customer5, customer6, customer7, customer8, customer9, customer10];
  const packages = [monthlyFitnessPackage, yearlyFitnessPackage];
  
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const selectedPackage = packages[i % packages.length];
    
    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        name: `${selectedPackage.name} - ${member.firstName}`,
        type: selectedPackage.type,
        status: i < 6 ? 'ACTIVE' : (i === 6 ? 'EXPIRED' : 'CANCELED'),
        originalPrice: selectedPackage.price,
        finalPrice: selectedPackage.discountPrice || selectedPackage.price,
        duration: selectedPackage.duration,
        maxCheckins: selectedPackage.maxCheckins,
        usedCheckins: Math.floor(Math.random() * (selectedPackage.maxCheckins || 30)),
        startDate: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)), // Staggered start dates
        endDate: new Date(Date.now() + (selectedPackage.duration - i * 7) * 24 * 60 * 60 * 1000),
        paymentStatus: 'COMPLETED',
        customerId: member.id,
        packageId: selectedPackage.id,
        clubId: fitnessClub.id,
      },
    });

    // Create QR code
    const qrCode = await prisma.qRCode.create({
      data: {
        code: `QR-${member.id}-${subscription.id}`,
        clubId: fitnessClub.id,
        customerId: member.id,
        subscriptionId: subscription.id,
        expiresAt: subscription.endDate,
        usageCount: Math.floor(Math.random() * 20),
        lastUsedAt: i < 5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
      },
    });
    
    console.log(`Created subscription and QR code for ${member.firstName} ${member.lastName}`);
  }

  // Create subscriptions for yoga studio members
  const yogaMembers = [customer11, customer12, customer13];
  for (let i = 0; i < yogaMembers.length; i++) {
    const member = yogaMembers[i];
    
    const subscription = await prisma.subscription.create({
      data: {
        name: `${monthlyYogaPackage.name} - ${member.firstName}`,
        type: monthlyYogaPackage.type,
        status: 'ACTIVE',
        originalPrice: monthlyYogaPackage.price,
        finalPrice: monthlyYogaPackage.price,
        duration: monthlyYogaPackage.duration,
        maxCheckins: monthlyYogaPackage.maxCheckins,
        usedCheckins: Math.floor(Math.random() * 15),
        startDate: new Date(Date.now() - (i * 5 * 24 * 60 * 60 * 1000)),
        endDate: new Date(Date.now() + (30 - i * 5) * 24 * 60 * 60 * 1000),
        paymentStatus: 'COMPLETED',
        customerId: member.id,
        packageId: monthlyYogaPackage.id,
        clubId: yogaStudio.id,
      },
    });

    const qrCode = await prisma.qRCode.create({
      data: {
        code: `QR-${member.id}-${subscription.id}`,
        clubId: yogaStudio.id,
        customerId: member.id,
        subscriptionId: subscription.id,
        expiresAt: subscription.endDate,
        usageCount: Math.floor(Math.random() * 15),
        lastUsedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
      },
    });
    
    console.log(`Created yoga subscription and QR code for ${member.firstName} ${member.lastName}`);
  }

  // Create check-in logs
  const checkinLog1 = await prisma.checkinLog.create({
    data: {
      type: 'CHECKIN',
      clubId: fitnessClub.id,
      customerId: customer1.id,
      eventId: fitnessEvent.id,
      subscriptionId: customer1Subscription.id,
      qrCodeId: qrCode1.id,
      location: 'Main Entrance',
      processedBy: fitnessStaff.id,
      notes: 'Regular member check-in',
    },
  });
  console.log(`Created check-in log at ${checkinLog1.timestamp}`);

  // Create payment records
  const payment1 = await prisma.payment.create({
    data: {
      amount: monthlyFitnessPackage.price,
      currency: 'USD',
      status: 'COMPLETED',
      method: 'CREDIT_CARD',
      netAmount: monthlyFitnessPackage.price * 0.97, // After processing fees
      transactionFee: monthlyFitnessPackage.price * 0.03,
      description: 'Monthly Elite Access subscription',
      clubId: fitnessClub.id,
      customerId: customer1.id,
      subscriptionId: customer1Subscription.id,
    },
  });
  console.log(`Created payment record: $${payment1.amount}`);

  console.log('B2B SaaS database seeding completed!');
  console.log('\n=== Login Credentials ===');
  console.log('System Admin: system@qrcheckin.com / systemadmin123');
  console.log('Fitness Club Admin: admin@elitefitness.com / fitadmin123');
  console.log('Fitness Club Staff: staff@elitefitness.com / fitstaff123');
  console.log('Yoga Studio Admin: contact@zenyoga.com / yogaadmin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
