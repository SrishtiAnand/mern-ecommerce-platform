require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { Product } = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';

const womenImages = [
  'product_1.png',
  'product_2.png',
  'product_3.png',
  'product_4.png',
  'product_5.png',
  'product_6.png',
  'product_7.png',
  'product_8.png',
  'product_9.png',
  'product_10.png',
  'product_11.png',
  'product_12.png',
];

const menImages = [
  'product_13.png',
  'product_14.png',
  'product_15.png',
  'product_16.png',
  'product_17.png',
  'product_18.png',
  'product_19.png',
  'product_20.png',
  'product_21.png',
  'product_22.png',
  'product_23.png',
  'product_24.png',
];

const kidsImages = [
  'product_25.png',
  'product_26.png',
  'product_27.png',
  'product_28.png',
  'product_29.png',
  'product_30.png',
  'product_31.png',
  'product_32.png',
  'product_33.png',
  'product_34.png',
  'product_35.png',
  'product_36.png',
];

const buildProducts = () => {
  const menProducts = [
    ['Classic Denim Jacket', 'men', 89, 129, 'A timeless classic with a tailored fit and premium denim finish.', true],
    ['Urban Street Hoodie', 'men', 95, 139, 'Soft fleece, modern silhouette, and everyday comfort.', true],
    ['Casual Cotton Shirt', 'men', 72, 99, 'Breathable cotton shirt designed for effortless casual dressing.', false],
    ['Slim Fit Blazer', 'men', 118, 169, 'Sharp lines and a polished finish for work or dinner.', false],
    ['Weekend Knit Sweater', 'men', 84, 119, 'Cozy knit texture with a relaxed, modern shape.', false],
    ['Trail Cargo Pant', 'men', 78, 109, 'Durable and comfortable for weekend errands and travel.', false],
    ['Minimalist Polo', 'men', 64, 89, 'Clean-cut polo ideal for smart casual looks.', true],
    ['Leather Moto Jacket', 'men', 145, 199, 'Bold outerwear with a premium feel and elevated style.', false],
    ['Chino Relaxed Fit', 'men', 69, 94, 'Versatile chinos with a breathable finish and easy movement.', false],
    ['Layered Overshirt', 'men', 91, 129, 'A versatile layering piece perfect for mild weather.', false],
    ['Performance Tee', 'men', 39, 59, 'Comfortable, light, and easy to wear every day.', true],
    ['Classic Bomber Jacket', 'men', 104, 149, 'A street-style staple with a polished finish.', false],
  ];

  const womenProducts = [
    ['Floral Midi Dress', 'women', 88, 129, 'A breezy dress featuring a fresh floral print and soft drape.', true],
    ['Satin Evening Blouse', 'women', 74, 109, 'Elegant shine and a flattering cut for evenings out.', true],
    ['Tailored Linen Set', 'women', 97, 139, 'Relaxed comfort with a polished and elevated look.', false],
    ['Soft Knit Cardigan', 'women', 63, 89, 'A cozy layering favorite in a lightweight knit.', false],
    ['Statement Wide-Leg Pants', 'women', 82, 119, 'Modern silhouette with great comfort and confidence.', false],
    ['Ribbed Body Skirt', 'women', 58, 79, 'Timeless style with a smooth ribbed texture.', false],
    ['Parisian Trench Coat', 'women', 129, 179, 'Classic structure with a refined finish for all seasons.', true],
    ['Boho Printed Top', 'women', 54, 74, 'A playful top with a relaxed, layered feel.', false],
    ['Modern Denim Jacket', 'women', 91, 129, 'An everyday essential with a fresh, fashion-forward cut.', false],
    ['Silk Wrap Dress', 'women', 112, 159, 'Fluid drape and elegant shape for any occasion.', true],
    ['Weekend Tote Bag', 'women', 66, 94, 'A functional everyday bag with a chic profile.', false],
    ['Linen Blend Shirt Dress', 'women', 78, 109, 'Easy, airy, and polished for casual wear.', false],
  ];

  const kidsProducts = [
    ['Adventure Jacket', 'kids', 56, 79, 'Durable outerwear made for active play and easy layering.', true],
    ['Color Pop Hoodie', 'kids', 48, 69, 'Bright colors and a comfy fit for everyday fun.', true],
    ['Playful Set', 'kids', 62, 89, 'A cheerful matching set designed for movement and comfort.', false],
    ['Sunny Raincoat', 'kids', 41, 59, 'Colorful and practical for rainy days and outdoor adventures.', false],
    ['Soft Cotton Joggers', 'kids', 34, 49, 'Stretchy, cozy, and easy to wear all day.', false],
    ['Star Print Tee', 'kids', 24, 35, 'A bright tee that pairs well with any bottom.', false],
    ['Mini Puffer Jacket', 'kids', 59, 84, 'Warm and lightweight for cooler weather.', true],
    ['Animal Print Pajama Set', 'kids', 32, 45, 'Soft cozy pajamas for bedtime and lounging.', false],
    ['Skater Denim Shorts', 'kids', 29, 42, 'A casual favorite for warm days and outdoor play.', false],
    ['Bright Hoodie Dress', 'kids', 44, 64, 'A cheerful one-piece style designed for comfort.', false],
    ['Everyday Knit Sweater', 'kids', 37, 54, 'Soft knit texture with easy layering.', false],
    ['Adventure Backpack', 'kids', 33, 49, 'A fun and practical bag for school or day trips.', false],
  ];

  const grouped = [
    ...menProducts.map((entry, index) => ({ entry, image: menImages[index] })),
    ...womenProducts.map((entry, index) => ({ entry, image: womenImages[index] })),
    ...kidsProducts.map((entry, index) => ({ entry, image: kidsImages[index] })),
  ];

  return grouped.map(({ entry, image }, index) => {
    const [name, category, price, oldPrice, description, featured] = entry;
    const imagePath = `/images/${image}`;

    return {
      id: 1000 + index + 1,
      name,
      image: imagePath,
      category,
      price,
      new_price: price,
      old_price: oldPrice,
      description,
      stock: 40 + (index % 10),
      featured,
      createdAt: new Date(),
    };
  });
};

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    const products = buildProducts();
    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedProducts();
