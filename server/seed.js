import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Contact from './models/Contact.js';
import Deal from './models/Deal.js';

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('Set MONGO_URI in server/.env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);

  if (process.env.SEED_ONLY_IF_EMPTY === '1') {
    const existing = await User.countDocuments();
    if (existing > 0) {
      console.log('Seed skipped — database already has data.');
      await mongoose.disconnect();
      return;
    }
  }

  await Deal.deleteMany({});
  await Contact.deleteMany({});
  await User.deleteMany({});

  const hashed = await bcrypt.hash('demo123456', 12);
  const user = await User.create({
    name: 'Demo User',
    email: 'demo@crm.local',
    password: hashed,
  });

  const contactData = [
    { name: 'Alex Rivera', email: 'alex@example.com', phone: '+1 555-0101', company: 'Northwind', status: 'lead' },
    { name: 'Jordan Lee', email: 'jordan@acme.io', phone: '+1 555-0102', company: 'Acme Labs', status: 'contacted' },
    { name: 'Sam Patel', email: 'sam@vertex.dev', phone: '+1 555-0103', company: 'Vertex', status: 'qualified' },
    { name: 'Taylor Morgan', email: 'taylor@bright.co', phone: '+1 555-0104', company: 'Bright Co', status: 'customer' },
    { name: 'Riley Chen', email: 'riley@failed.biz', phone: '+1 555-0105', company: 'Failed Biz', status: 'lost' },
    { name: 'Casey Brooks', email: 'casey@ocean.net', phone: '+1 555-0106', company: 'Ocean Net', status: 'lead' },
    { name: 'Morgan Quinn', email: 'morgan@peak.io', phone: '+1 555-0107', company: 'Peak IO', status: 'contacted' },
    { name: 'Jamie Fox', email: 'jamie@spark.dev', phone: '+1 555-0108', company: 'Spark Dev', status: 'qualified' },
    { name: 'Drew Avery', email: 'drew@solid.sys', phone: '+1 555-0109', company: 'Solid Systems', status: 'customer' },
    { name: 'Skyler Reed', email: 'skyler@nova.app', phone: '+1 555-0110', company: 'Nova App', status: 'lead' },
  ];

  const contacts = [];
  for (let i = 0; i < contactData.length; i++) {
    const c = contactData[i];
    const note =
      i % 3 === 0
        ? [{ text: 'Initial outreach sent.', createdBy: user._id }]
        : [];
    contacts.push(
      await Contact.create({
        ...c,
        assignedTo: user._id,
        notes: note,
      })
    );
  }

  const dealsSeed = [
    { title: 'Enterprise SaaS license', value: 48000, stage: 'new', idx: 2 },
    { title: 'Consulting Q1', value: 12000, stage: 'contacted', idx: 1 },
    { title: 'Support renewal', value: 8500, stage: 'proposal', idx: 3 },
    { title: 'Hardware rollout', value: 156000, stage: 'negotiation', idx: 0 },
    { title: 'Pilot program', value: 9000, stage: 'closed-won', idx: 4 },
    { title: 'Legacy migration', value: 22000, stage: 'closed-lost', idx: 5 },
    { title: 'API integration', value: 34000, stage: 'new', idx: 6 },
    { title: 'Training package', value: 6500, stage: 'proposal', idx: 7 },
  ];

  const now = Date.now();
  for (const d of dealsSeed) {
    const close = new Date(now + (30 + d.idx * 7) * 24 * 60 * 60 * 1000);
    await Deal.create({
      title: d.title,
      value: d.value,
      stage: d.stage,
      contact: contacts[d.idx]._id,
      expectedCloseDate: close,
    });
  }

  console.log('Seed complete: 1 user, 10 contacts, 8 deals');
  console.log('Login: demo@crm.local / demo123456');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
