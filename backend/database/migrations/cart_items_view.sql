-- View: cart_items_view
-- Joins cart_items with medicines to display medicine name alongside cart data.
-- Use this view in pgAdmin for easy human-readable cart inspection.

CREATE OR REPLACE VIEW cart_items_view AS
  SELECT 
    c.id,
    c.user_id,
    c.medicine_id,
    m.name AS medicine_name,
    c.quantity,
    c.created_at
  FROM cart_items c
  JOIN medicines m ON c.medicine_id = m.id;
