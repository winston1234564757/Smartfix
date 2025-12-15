const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log("🔧 STARTING SYSTEM REPAIR...");

// --- 1. DEFINING CORRECT FILES CONTENT ---

const SCHEMA = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id               String        @id @default(cuid())
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  
  title            String
  slug             String        @unique
  brand            String
  model            String
  description      String?
  price            Decimal
  purchaseCost     Decimal       @default(0)
  repairCost       Decimal       @default(0)
  
  images           String[]
  status           ProductStatus @default(AVAILABLE)
  
  arrivalDate      DateTime?
  estimatedArrival DateTime?
  quantity         Int           @default(1)

  category         Category
  grade            Grade
  storage          String
  color            String
  
  // SPECS
  cpu              String?
  ram              String?
  gpu              String?
  screenSize       String?
  
  checklist        Json?
  upgrades         Json?

  orderItems       OrderItem[]
  requests         ProductRequest[]
}

model Order {
  id             String      @id @default(cuid())
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  status         String      @default("PENDING")
  total          Decimal
  customerName   String
  phone          String
  city           String      @default("")
  warehouse      String      @default("")
  internalNotes  String?     @db.Text
  warrantyType   String      @default("BASIC")
  warrantyPrice  Decimal     @default(0)
  userId         String?
  items          OrderItem[]
}

model OrderItem {
  id             String   @id @default(cuid())
  orderId        String
  order          Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId      String
  product        Product  @relation(fields: [productId], references: [id])
  quantity       Int      @default(1)
  price          Decimal
  selectedOptions String[] 
}

model ServiceDevice {
  id        String        @id @default(cuid())
  name      String
  brand     String
  type      Category
  image     String?
  services  ServiceItem[]
}

model ServiceItem {
  id        String        @id @default(cuid())
  title     String
  price     Decimal
  duration  String
  partCost  Decimal       @default(0)
  deviceId  String
  device    ServiceDevice @relation(fields: [deviceId], references: [id], onDelete: Cascade)
}

model ServiceAddon {
  id          String   @id @default(cuid())
  label       String
  price       Decimal
  description String?
  category    Category
  isPopular   Boolean  @default(false)
}

model RepairOrder {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  status        String   @default("NEW")
  deviceName    String
  serviceName   String
  addons        Json?
  price         Decimal
  cost          Decimal  @default(0)
  customerName  String
  phone         String
  userId        String?
  images        String[]
  internalNotes String?  @db.Text
}

model TradeInRequest {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  model     String
  storage   String
  condition String
  images    String[]
  name      String
  phone     String
  userId    String?
  status    String   @default("NEW")
}

model ProductRequest {
  id             String   @id @default(cuid())
  createdAt      DateTime @default(now())
  targetProduct  String
  budget         String
  desiredStorage String?
  desiredColor   String?
  desiredGrade   String?
  
  // Tech Specs
  desiredCpu     String?
  desiredRam     String?
  desiredGpu     String?
  desiredScreen  String?

  customerName   String
  phone          String
  userId         String?
  status         String   @default("NEW")
  offeredProductId String?
  offeredProduct   Product? @relation(fields: [offeredProductId], references: [id])
}

model PromoBanner {
  id        String   @id @default(cuid())
  title     String
  subtitle  String?
  image     String
  link      String
  size      String   @default("STANDARD")
  order     Int      @default(0)
}

model CategoryMetadata {
  id          String @id
  imageUrl    String
  description String
  color       String
  buttonText  String
}

enum ProductStatus {
  AVAILABLE
  SOLD
  RESERVED
  REPAIR
  PRE_ORDER
  ON_REQUEST
}

enum Category {
  IPHONE
  ANDROID
  TABLET
  LAPTOP
  WATCH
  ACCESSORY
  OTHER
}

enum Grade {
  NEW
  A_PLUS
  A
  B
  C
  D
}`;

const SEED = `const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔥 STARTING DATABASE WIPE...')

  try {
    await prisma.orderItem.deleteMany({})
    await prisma.productRequest.deleteMany({})
    await prisma.tradeInRequest.deleteMany({})
    await prisma.repairOrder.deleteMany({})
    await prisma.order.deleteMany({})
    await prisma.product.deleteMany({})
  } catch (e) {
    console.log('⚠️ Cleanup minor error (ignoring):', e.message)
  }
  
  console.log('✅ DATABASE CLEARED.')
  console.log('🌱 SEEDING NEW PRODUCTS...')

  const categories = [
    {
      type: "IPHONE",
      items: [
        { title: "iPhone 13", model: "A2633", color: "Midnight", storage: "128GB", price: 450, grade: "A", battery: "89", checklist: { "Face ID": "ОК", "True Tone": "ОК", "Акумулятор": "Рідний" } },
        { title: "iPhone 14 Pro", model: "A2890", color: "Deep Purple", storage: "256GB", price: 850, grade: "A_PLUS", battery: "98", checklist: { "Face ID": "ОК", "True Tone": "ОК", "Дисплей": "Ідеал" } },
        { title: "iPhone 11", model: "A2111", color: "White", storage: "64GB", price: 250, grade: "B", battery: "82", checklist: { "Face ID": "ОК", "Корпус": "Потертості", "Акумулятор": "Заміна" } }
      ]
    },
    {
      type: "ANDROID",
      items: [
        { title: "Samsung Galaxy S23 Ultra", model: "S918B", color: "Phantom Black", storage: "256GB", price: 700, grade: "A", ram: "12GB", checklist: { "Дисплей": "ОК", "Стилус": "ОК" } },
        { title: "Google Pixel 7", model: "GVU6C", color: "Lemongrass", storage: "128GB", price: 350, grade: "A", ram: "8GB", checklist: { "Камера": "ОК", "Корпус": "ОК" } },
        { title: "Samsung Galaxy A54", model: "A546", color: "Awesome Violet", storage: "128GB", price: 200, grade: "NEW", ram: "6GB", checklist: { "Стан": "Новий", "Плівка": "Заводська" } }
      ]
    },
    {
      type: "LAPTOP",
      items: [
        { 
           title: "MacBook Air M1", model: "A2337", color: "Space Gray", price: 650, grade: "A", 
           cpu: "Apple M1", ram: "8GB", storage: "SSD 256GB", screenSize: "13.3",
           checklist: { "Матриця": "ОК", "Клавіатура": "ОК", "Батарея": "92%" } 
        },
        { 
           title: "MacBook Pro 14", model: "A2442", color: "Silver", price: 1400, grade: "A_PLUS", 
           cpu: "M1 Pro", ram: "16GB", storage: "SSD 512GB", screenSize: "14.2",
           checklist: { "Матриця": "Ідеал", "Олеофобка": "ОК", "Цикли": "24" } 
        },
        { 
           title: "Dell XPS 13", model: "9310", color: "Platinum", price: 500, grade: "B", 
           cpu: "Intel Core i7-1165G7", ram: "16GB", storage: "NVMe 512GB", screenSize: "13.4",
           checklist: { "Корпус": "Подряпини внизу", "Екран": "ОК" } 
        }
      ]
    },
    {
      type: "TABLET",
      items: [
        { title: "iPad Air 5", model: "A2588", color: "Blue", storage: "64GB", price: 480, grade: "A", checklist: { "Touch ID": "ОК", "Дисплей": "ОК" } },
        { title: "iPad Pro 11 M2", model: "A2759", color: "Space Gray", storage: "128GB", price: 750, grade: "A_PLUS", checklist: { "Face ID": "ОК", "ProMotion": "ОК" } },
        { title: "Samsung Galaxy Tab S8", model: "X700", color: "Graphite", storage: "128GB", price: 400, grade: "B", checklist: { "Стилус": "Є", "Корпус": "Сліди використання" } }
      ]
    },
    {
      type: "WATCH",
      items: [
        { title: "Apple Watch Series 8", model: "A2771", color: "Midnight", storage: "32GB", price: 280, grade: "A", checklist: { "Скло": "ОК", "Ремінець": "Оригінал" } },
        { title: "Apple Watch Ultra", model: "A2622", color: "Titanium", storage: "32GB", price: 550, grade: "A_PLUS", checklist: { "Корпус": "Ідеал", "Батарея": "100%" } },
        { title: "Samsung Galaxy Watch 5", model: "R910", color: "Sapphire", storage: "16GB", price: 150, grade: "B", checklist: { "Безель": "Потертий", "Екран": "ОК" } }
      ]
    }
  ]

  for (const cat of categories) {
    for (const item of cat.items) {
      const slug = item.title.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 6)
      const purchaseCost = Math.round(item.price * 0.7)
      const repairCost = item.grade === "B" ? 20 : 0

      // FIX: Merge battery into checklist
      const finalChecklist = { ...item.checklist }
      if (item.battery) {
          finalChecklist.batteryHealth = item.battery
      }

      await prisma.product.create({
        data: {
          title: item.title,
          slug: slug,
          brand: item.title.split(" ")[0],
          model: item.model,
          description: "Чудовий вибір! " + item.title + ". Гарантія 3 місяці.",
          price: item.price,
          purchaseCost: purchaseCost,
          repairCost: repairCost,
          category: cat.type,
          status: "AVAILABLE",
          grade: item.grade,
          color: item.color,
          storage: item.storage,
          quantity: 1,
          images: [],
          
          cpu: item.cpu || null,
          ram: item.ram || null,
          gpu: null,
          screenSize: item.screenSize || null,
          
          checklist: finalChecklist
        }
      })
    }
  }
  console.log('✅ SEED COMPLETED!')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })`;

// --- 2. WRITING FILES (Clean UTF-8) ---

fs.writeFileSync(path.join(process.cwd(), 'prisma', 'schema.prisma'), SCHEMA, 'utf8');
console.log("1. schema.prisma FIXED (UTF-8 Clean).");

fs.writeFileSync(path.join(process.cwd(), 'prisma', 'seed.js'), SEED, 'utf8');
console.log("2. seed.js FIXED (Logic Updated).");

// --- 3. EXECUTING COMMANDS ---

try {
    console.log("\n3. Generating Prisma Client...");
    execSync('npx prisma generate', { stdio: 'inherit', shell: true });

    console.log("\n4. Pushing to Database...");
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', shell: true });

    console.log("\n5. Running Seed...");
    execSync('node prisma/seed.js', { stdio: 'inherit', shell: true });

    console.log("\n✨ SUCCESS! The shop is ready.");
} catch (error) {
    console.error("\n❌ ERROR during execution. Check logs above.");
}