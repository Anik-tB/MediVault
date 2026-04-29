-- Run this file in pgAdmin Query Tool after creating the medivault database.

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  student_id VARCHAR(50) UNIQUE,
  phone VARCHAR(30),
  faculty VARCHAR(120),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicines (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  generic_name VARCHAR(150),
  category VARCHAR(80),
  dosage_form VARCHAR(80),
  strength VARCHAR(80),
  active_ingredient VARCHAR(150),
  description TEXT,
  requires_prescription BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_batches (
  id BIGSERIAL PRIMARY KEY,
  medicine_id BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  batch_code VARCHAR(80) NOT NULL,
  stock_quantity INTEGER NOT NULL CHECK (stock_quantity >= 0),
  expiry_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicine_conflicts (
  id BIGSERIAL PRIMARY KEY,
  medicine_id BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  conflicts_with_medicine_id BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT medicine_conflicts_pair_unique UNIQUE (medicine_id, conflicts_with_medicine_id),
  CONSTRAINT medicine_conflicts_self_check CHECK (medicine_id <> conflicts_with_medicine_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  pickup_code VARCHAR(40),
  requires_prescription BOOLEAN NOT NULL DEFAULT FALSE,
  total_items INTEGER NOT NULL DEFAULT 0 CHECK (total_items >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  medicine_id BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  batch_id BIGINT REFERENCES inventory_batches(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_label VARCHAR(40) DEFAULT 'item'
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  notes TEXT,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_medicine_id ON inventory_batches(medicine_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_expiry_date ON inventory_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON prescriptions(user_id);
