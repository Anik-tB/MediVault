CREATE TABLE IF NOT EXISTS orders (
  id               BIGSERIAL PRIMARY KEY,
  user_id          VARCHAR(128) NOT NULL,
  status           VARCHAR(50) NOT NULL DEFAULT 'pending_pickup',
  prescription_id  BIGINT,                           -- FK added after prescriptions table created
  pickup_time      TIMESTAMP,
  rejection_reason TEXT,
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  total_amount     NUMERIC(10, 2) DEFAULT 0.00,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id            BIGSERIAL PRIMARY KEY,
  order_id      BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  medicine_id   BIGINT REFERENCES medicines(id) ON DELETE SET NULL,
  medicine_name VARCHAR(255),
  quantity      INT NOT NULL,
  unit_price    NUMERIC(10, 2) DEFAULT 0.00,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Side tables (for backward compatibility with older code)
CREATE TABLE IF NOT EXISTS order_details (
  order_id     BIGINT PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  total_amount NUMERIC(10, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS order_item_details (
  order_item_id BIGINT PRIMARY KEY REFERENCES order_items(id) ON DELETE CASCADE,
  unit_price    NUMERIC(10, 2) DEFAULT 0.00
);

-- Safe ALTER for existing databases (idempotent — safe to re-run)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount     NUMERIC(10, 2)  DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_time      TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS prescription_id  BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price  NUMERIC(10, 2)  DEFAULT 0.00;
