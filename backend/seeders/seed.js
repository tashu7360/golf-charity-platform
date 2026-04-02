require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize, User, Charity, Score, Draw, DrawEntry, Winner, Payment } = require('../models');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // WARNING: drops all tables
    console.log('✅ Database synced (fresh)\n');

    // ── 1. Admin user ────────────────────────────────────────────────────────
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@golfcharity.com',
      password: 'Admin@12345',
      role: 'admin',
      subscriptionStatus: 'active',
    });
    console.log(`✅ Admin created: admin@golfcharity.com / Admin@12345`);

    // ── 2. Charities ─────────────────────────────────────────────────────────
    const charities = await Charity.bulkCreate([
      {
        name: 'Golf Foundation',
        description: 'Making golf accessible to young people across the UK, building life skills through the sport.',
        category: 'Youth & Sport',
        country: 'UK',
        website: 'https://www.golf-foundation.org',
        isFeatured: true,
        isActive: true,
        registrationNumber: 'CH-001234',
        upcomingEvents: [
          { title: 'Junior Golf Day', date: '2026-05-15', location: 'St Andrews' },
          { title: 'Charity Cup 2026', date: '2026-07-20', location: 'Wentworth' },
        ],
      },
      {
        name: "Alzheimer's Research UK",
        description: "Pioneering research into dementia to find preventions, treatments, and ultimately a cure.",
        category: 'Health & Research',
        country: 'UK',
        website: 'https://www.alzheimersresearchuk.org',
        isFeatured: true,
        isActive: true,
        registrationNumber: 'CH-005678',
        upcomingEvents: [
          { title: 'Golf Memory Walk', date: '2026-06-08', location: 'London' },
        ],
      },
      {
        name: 'Macmillan Cancer Support',
        description: 'Providing specialist health care, information and financial support to people affected by cancer.',
        category: 'Health & Wellbeing',
        country: 'UK',
        website: 'https://www.macmillan.org.uk',
        isFeatured: false,
        isActive: true,
        registrationNumber: 'CH-002117',
        upcomingEvents: [],
      },
      {
        name: 'Save the Children UK',
        description: "Fighting for children's rights and delivering immediate and lasting change in their lives.",
        category: 'Children & Education',
        country: 'UK',
        website: 'https://www.savethechildren.org.uk',
        isFeatured: false,
        isActive: true,
        registrationNumber: 'CH-213890',
        upcomingEvents: [],
      },
      {
        name: 'WWF UK',
        description: 'Working to conserve nature and reduce the most pressing threats to the diversity of life on Earth.',
        category: 'Environment',
        country: 'UK',
        website: 'https://www.wwf.org.uk',
        isFeatured: false,
        isActive: true,
        registrationNumber: 'CH-115142',
        upcomingEvents: [],
      },
    ]);
    console.log(`✅ ${charities.length} charities created`);

    // ── 3. Subscriber users ──────────────────────────────────────────────────
    const subscriberData = [
      { firstName: 'James', lastName: 'Harrington', email: 'james@example.com', plan: 'monthly' },
      { firstName: 'Sophie', lastName: 'Clarke', email: 'sophie@example.com', plan: 'yearly' },
      { firstName: 'Liam', lastName: 'Patterson', email: 'liam@example.com', plan: 'monthly' },
      { firstName: 'Emma', lastName: 'Wright', email: 'emma@example.com', plan: 'monthly' },
      { firstName: 'Oliver', lastName: 'Bennett', email: 'oliver@example.com', plan: 'yearly' },
      { firstName: 'Ava', lastName: 'Thompson', email: 'ava@example.com', plan: 'monthly' },
      { firstName: 'Noah', lastName: 'Davis', email: 'noah@example.com', plan: 'monthly' },
      { firstName: 'Isabella', lastName: 'Morgan', email: 'isabella@example.com', plan: 'yearly' },
    ];

    const subscribers = [];
    for (const data of subscriberData) {
      const charityIndex = Math.floor(Math.random() * charities.length);
      const user = await User.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: 'User@12345',
        role: 'subscriber',
        subscriptionStatus: 'active',
        subscriptionPlan: data.plan,
        subscriptionStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        selectedCharityId: charities[charityIndex].id,
        charityContributionPercent: [10, 15, 20][Math.floor(Math.random() * 3)],
        handicap: (Math.random() * 28).toFixed(1),
        country: 'UK',
      });
      subscribers.push(user);
    }
    console.log(`✅ ${subscribers.length} subscriber users created (password: User@12345)`);

    // ── 4. Scores for each subscriber ────────────────────────────────────────
    const scorePool = [18, 22, 25, 28, 30, 32, 34, 36, 38, 40, 27, 29, 31, 33, 35];
    for (const user of subscribers) {
      const numScores = 5;
      for (let i = 0; i < numScores; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7 + Math.floor(Math.random() * 5)));
        await Score.create({
          userId: user.id,
          score: scorePool[Math.floor(Math.random() * scorePool.length)],
          playedAt: date.toISOString().split('T')[0],
          courseName: ['St Andrews Links', 'Wentworth Club', 'Royal Birkdale', 'Gleneagles', 'Augusta National'][Math.floor(Math.random() * 5)],
        });
      }
    }
    console.log(`✅ Scores seeded for all subscribers`);

    // ── 5. Payments ──────────────────────────────────────────────────────────
    for (const user of subscribers) {
      const amount = user.subscriptionPlan === 'yearly' ? 99.99 : 9.99;
      await Payment.create({
        userId: user.id,
        amount,
        currency: 'gbp',
        plan: user.subscriptionPlan,
        status: 'succeeded',
        charityContribution: parseFloat((amount * (user.charityContributionPercent / 100)).toFixed(2)),
        prizePoolContribution: parseFloat((amount * 0.6).toFixed(2)),
        periodStart: user.subscriptionStart,
        periodEnd: user.subscriptionEnd,
      });
    }
    console.log(`✅ Payments seeded`);

    // ── 6. A published draw ──────────────────────────────────────────────────
    const now = new Date();
    const drawnNumbers = [18, 25, 30, 34, 38];
    const draw = await Draw.create({
      name: 'March 2026 Monthly Draw',
      month: 3,
      year: 2026,
      drawType: 'random',
      status: 'published',
      drawnNumbers,
      totalPool: 59.94,
      jackpotPool: 23.98,
      fourMatchPool: 20.98,
      threeMatchPool: 14.99,
      totalParticipants: subscribers.length,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      jackpotRolledOver: true,
      rolledOverAmount: 0,
    });

    // Create draw entries
    for (const user of subscribers) {
      const userScores = await Score.findAll({ where: { userId: user.id }, order: [['playedAt', 'DESC']], limit: 5 });
      const scoreVals = userScores.map((s) => s.score);
      const matched = scoreVals.filter((s) => drawnNumbers.includes(s));
      const count = matched.length;
      const matchType = count >= 5 ? '5-match' : count === 4 ? '4-match' : count >= 3 ? '3-match' : 'none';

      await DrawEntry.create({
        drawId: draw.id,
        userId: user.id,
        scores: userScores.map((s) => ({ score: s.score, playedAt: s.playedAt })),
        matchType,
        matchedNumbers: matched,
        prizeAmount: matchType !== 'none' ? (matchType === '3-match' ? 14.99 : 20.98) : 0,
      });

      if (matchType === '3-match') {
        await Winner.create({
          drawId: draw.id,
          userId: user.id,
          matchType: '3-match',
          prizeAmount: 14.99,
          paymentStatus: 'paid',
          paidAt: new Date(),
        });
      }
    }
    console.log(`✅ Published draw seeded with entries`);

    // ── 7. Pending draw for current month ────────────────────────────────────
    await Draw.create({
      name: 'April 2026 Monthly Draw',
      month: 4,
      year: 2026,
      drawType: 'random',
      status: 'pending',
      totalPool: 59.94,
      jackpotPool: 47.96, // includes jackpot rollover
      fourMatchPool: 20.98,
      threeMatchPool: 14.99,
      rolledOverAmount: 23.98,
      totalParticipants: subscribers.length,
    });
    console.log(`✅ Pending April 2026 draw created`);

    console.log('\n🎉 Seed complete!\n');
    console.log('─────────────────────────────────────────');
    console.log('  CREDENTIALS');
    console.log('─────────────────────────────────────────');
    console.log('  Admin  : admin@golfcharity.com / Admin@12345');
    console.log('  Users  : james@example.com / User@12345');
    console.log('           sophie@example.com / User@12345');
    console.log('           (and 6 more — all use User@12345)');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
