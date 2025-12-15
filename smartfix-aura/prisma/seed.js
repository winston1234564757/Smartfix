const { PrismaClient } = require('@prisma/client')
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
    console.log('⚠️ Cleanup error:', e.message)
  }
  
  console.log('✅ DATABASE CLEARED.')
  console.log('🌱 SEEDING MIXED PRODUCTS...')

  const categories = [
    { type: "IPHONE", items: ["iPhone 13", "iPhone 14 Pro", "iPhone 11", "iPhone 15", "iPhone XR"] },
    { type: "ANDROID", items: ["Samsung S23", "Pixel 7", "Samsung A54", "Xiaomi 13", "Pixel 6a"] },
    { type: "LAPTOP", items: ["MacBook Air M1", "MacBook Pro 14", "Dell XPS 13", "ThinkPad X1", "Asus ZenBook"] },
    { type: "TABLET", items: ["iPad Air 5", "iPad Pro 11", "Samsung Tab S8", "iPad 10", "Lenovo Tab"] },
    { type: "WATCH", items: ["Apple Watch 8", "Apple Watch Ultra", "Galaxy Watch 5", "Garmin Fenix", "Apple Watch SE"] }
  ]

  // Statuses to cycle through
  const statuses = ["AVAILABLE", "SOLD", "RESERVED", "ON_REQUEST", "AVAILABLE"] 

  for (const cat of categories) {
    for (let i = 0; i < cat.items.length; i++) {
      const title = cat.items[i]
      // Cycle statuses: 0=Avail, 1=Sold, 2=Reserved, 3=OnReq, 4=Avail...
      const status = statuses[i % statuses.length]
      
      const slug = title.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 6)
      const price = 200 + (i * 150)
      
      // Laptop specifics
      const isLaptop = cat.type === "LAPTOP"
      const storage = isLaptop ? "SSD 512GB" : "128GB"
      
      await prisma.product.create({
        data: {
          title: title,
          slug: slug,
          brand: "Brand",
          model: "Gen-" + i,
          description: `Тестовий товар (${status}). Стан ідеал.`,
          price: price,
          purchaseCost: price * 0.7,
          repairCost: 0,
          category: cat.type,
          status: status, // SETTING MIXED STATUS
          grade: "A",
          color: "Black",
          storage: storage,
          quantity: 1,
          images: [],
          
          cpu: isLaptop ? "M1 Pro" : null,
          ram: isLaptop ? "16GB" : null,
          gpu: null,
          screenSize: isLaptop ? "13.3" : null,
          
          checklist: { "Face ID": "OK", "Battery": "90%" }
        }
      })
    }
  }
  console.log('✅ SEED COMPLETED! Created products with MIXED statuses.')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })