import bcrypt from "bcrypt";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  // Users
  const users = [
    { username: "admin", password: await bcrypt.hash("admin123", 10), role: "admin", phoneNumber: "0700000001", email: "admin@bt.com" },
    { username: "worker1", password: await bcrypt.hash("worker123", 10), role: "worker", phoneNumber: "0700000002", email: "worker1@bt.com" },
    { username: "customer1", password: await bcrypt.hash("cust123", 10), role: "customer", phoneNumber: "0700000003", email: "customer1@bt.com" },
    { username: "customer2", password: await bcrypt.hash("cust123", 10), role: "customer", phoneNumber: "0700000004", email: "customer2@bt.com" },
    { username: "customer3", password: await bcrypt.hash("cust123", 10), role: "customer", phoneNumber: "0700000005", email: "customer3@bt.com" },
  ];
  for (const u of users) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: u,
    });
  }

  // Products
  const products = [
    { name: "Basic Phone", description: "A simple phone", price: 49.99, stock: 10 },
    { name: "Smartphone", description: "Modern smartphone", price: 299.99, stock: 15 },
    { name: "Tablet", description: "Portable tablet", price: 199.99, stock: 8 },
    { name: "Charger", description: "Fast charger", price: 19.99, stock: 30 },
    { name: "Headphones", description: "Wireless headphones", price: 59.99, stock: 20 },
  ];
  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  // Services (remove durationMin)
  const services = [
    { name: "Screen Repair", description: "Fix broken screen", price: 25.0 },
    { name: "Battery Replacement", description: "Replace battery", price: 20.0 },
    { name: "Software Update", description: "Update device software", price: 15.0 },
    { name: "Water Damage Repair", description: "Repair water damage", price: 40.0 },
    { name: "Speaker Fix", description: "Fix speaker issues", price: 18.0 },
  ];
  for (const s of services) {
    await prisma.service.create({ data: s });
  }

  // Orders & OrderItems
  const userIds = (await prisma.user.findMany()).map(u => u.id);
  const productIds = (await prisma.product.findMany()).map(p => p.id);

  for (let i = 0; i < 5; i++) {
    await prisma.order.create({
      data: {
        userId: userIds[i % userIds.length],
        status: "pending",
        items: {
          create: [
            { productId: productIds[i % productIds.length], quantity: 1 },
            { productId: productIds[(i + 1) % productIds.length], quantity: 2 },
          ],
        },
      },
    });
  }

  // Bookings
  const serviceIds = (await prisma.service.findMany()).map(s => s.id);
  for (let i = 0; i < 5; i++) {
    await prisma.booking.create({
      data: {
        userId: userIds[(i + 2) % userIds.length],
        serviceId: serviceIds[i % serviceIds.length],
        status: "scheduled",
        date: new Date(Date.now() + i * 86400000), // next 5 days
      },
    });
  }

  console.log("Seeded 5+ records in each table.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
