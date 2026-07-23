require('dotenv').config();
const port = process.env.PORT || 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { Product } = require('./models/Product');

const uploadDir = path.join(__dirname, 'upload/images');
const frontendAssetsDir = path.join(__dirname, '../frontend/src/Components/Assets');

const normalizeCategoryValue = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return 'general';
  if (['men', 'mens', 'male', 'man'].includes(normalized)) return 'men';
  if (['women', 'womens', 'female', 'woman'].includes(normalized)) return 'women';
  if (['kids', 'kid', 'children', 'child', 'boys', 'girls'].includes(normalized)) return 'kids';
  return normalized;
};

const buildImageUrl = (value) => {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
  if (value.startsWith('/')) return `${process.env.API_BASE_URL || ''}${value}`;
  return `/images/${value}`;
};

const normalizeProductPayload = (product) => {
  const payload = {
    ...product,
    id: Number(product.id ?? 0) || product._id || 0,
    name: product.name || 'Unnamed Product',
    image: buildImageUrl(product.image || product.image_url || ''),
    category: normalizeCategoryValue(product.category),
    price: Number(product.price ?? product.new_price ?? 0),
    new_price: Number(product.new_price ?? product.price ?? 0),
    old_price: Number(product.old_price ?? product.new_price ?? product.price ?? 0),
    description: product.description || '',
    stock: Number(product.stock ?? 50),
    featured: Boolean(product.featured),
    createdAt: product.createdAt || product.created_at || product.date || new Date().toISOString(),
  };

  if (typeof payload.id === 'number' && !payload.id) {
    payload.id = product._id ? String(product._id) : 0;
  }

  return payload;
};

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const copyFrontendAssets = () => {
  if (!fs.existsSync(frontendAssetsDir)) {
    return;
  }

  const files = fs.readdirSync(frontendAssetsDir).filter((file) => /\.(png|jpg|jpeg|webp|gif)$/i.test(file));
  files.forEach((file) => {
    const source = path.join(frontendAssetsDir, file);
    const destination = path.join(uploadDir, file);
    if (!fs.existsSync(destination)) {
      fs.copyFileSync(source, destination);
    }
  });
};

copyFrontendAssets();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use('/images', express.static(uploadDir));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';

if (!process.env.MONGO_URI) {
  console.log('⚠️  No MONGO_URI environment variable found. Falling back to local MongoDB.');
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(port, () => {
      console.log('🚀 Server Running on Port ' + port);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error);
  });

app.get('/', (req, res) => {
  res.send('Express App is Running');
});

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({ storage });

app.post('/upload', upload.single('product'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const imageUrl = `${process.env.API_BASE_URL || `http://localhost:${port}`}/images/${req.file.filename}`;
  res.json({ success: true, image_url: imageUrl });
});

app.post('/addproduct', async (req, res) => {
  try {
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const id = lastProduct ? lastProduct.id + 1 : 1;

    const product = new Product({
      id,
      name: req.body.name,
      image: req.body.image || '',
      category: normalizeCategoryValue(req.body.category),
      price: Number(req.body.price ?? req.body.new_price ?? 0),
      new_price: Number(req.body.new_price ?? req.body.price ?? 0),
      old_price: Number(req.body.old_price ?? req.body.new_price ?? req.body.price ?? 0),
      description: req.body.description || '',
      stock: Number(req.body.stock ?? 50),
      featured: Boolean(req.body.featured),
      createdAt: new Date(),
    });

    await product.save();
    res.json({ success: true, name: product.name });
  } catch (error) {
    console.error('Failed to add product:', error);
    res.status(500).json({ success: false, message: 'Failed to add product' });
  }
});

app.post('/removeproduct', async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({ success: true, name: req.body.name });
  } catch (error) {
    console.error('Failed to remove product:', error);
    res.status(500).json({ success: false, message: 'Failed to remove product' });
  }
});

const fallbackProducts = [
  { id: 1, name: 'Floral Midi Dress', image: 'product_1.png', category: 'women', new_price: 88, old_price: 129 },
  { id: 2, name: 'Satin Evening Blouse', image: 'product_2.png', category: 'women', new_price: 74, old_price: 109 },
  { id: 3, name: 'Tailored Linen Set', image: 'product_3.png', category: 'women', new_price: 97, old_price: 139 },
  { id: 4, name: 'Soft Knit Cardigan', image: 'product_4.png', category: 'women', new_price: 63, old_price: 89 },
  { id: 5, name: 'Classic Denim Jacket', image: 'product_13.png', category: 'men', new_price: 89, old_price: 129 },
  { id: 6, name: 'Urban Street Hoodie', image: 'product_14.png', category: 'men', new_price: 95, old_price: 139 },
  { id: 7, name: 'Casual Cotton Shirt', image: 'product_15.png', category: 'men', new_price: 72, old_price: 99 },
  { id: 8, name: 'Adventure Jacket', image: 'product_25.png', category: 'kids', new_price: 56, old_price: 79 },
  { id: 9, name: 'Color Pop Hoodie', image: 'product_26.png', category: 'kids', new_price: 48, old_price: 69 },
  { id: 10, name: 'Playful Set', image: 'product_27.png', category: 'kids', new_price: 62, old_price: 89 },
];

const normalizeExistingProducts = async () => {
  const products = await Product.find({});
  for (const product of products) {
    const normalizedCategory = normalizeCategoryValue(product.category);
    if (normalizedCategory !== product.category) {
      await Product.updateOne({ _id: product._id }, { $set: { category: normalizedCategory } });
    }
  }
};

app.get('/allproducts', async (req, res) => {
  try {
    let products = await Product.find({}).sort({ id: 1 });
    if (!products.length) {
      products = fallbackProducts;
    } else {
      products = products.map(normalizeProductPayload);
    }

    res.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

app.get('/products', async (req, res) => {
  res.redirect(307, '/allproducts');
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: Number(req.params.id) });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json(normalizeProductPayload(product));
  } catch (error) {
    console.error('Failed to fetch product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

app.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).sort({ createdAt: -1 });
    res.json(products.map(normalizeProductPayload));
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch featured products' });
  }
});

normalizeExistingProducts().catch((error) => console.error('Product category normalization failed:', error));

const Users = mongoose.model('Users', {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

app.post('/signup', async (req, res) => {
  const check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: false, errors: 'existing user found with same email address' });
  }

  const cart = {};
  for (let i = 0; i < 300; i += 1) {
    cart[i] = 0;
  }

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, 'secret_ecom');
  res.json({ success: true, token });
});

app.post('/login', async (req, res) => {
  const user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, 'secret_ecom');
      res.json({ success: true, token });
    } else {
      res.json({ success: false, errors: 'Wrong Password' });
    }
  } else {
    res.json({ success: false, errors: 'Wrong Email Id' });
  }
});


