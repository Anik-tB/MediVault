const db = require('../config/db');
const { ensureUserRecord } = require('../utils/account.utils');

const SEED_NOTIFICATIONS = [
  {
    type: 'order',
    title: 'Order Ready for Pickup',
    message: 'Your order ORD-0038 (Ibuprofen) is now ready to be picked up at the counter.',
    timeOffset: "INTERVAL '10 minutes'",
  },
  {
    type: 'prescription',
    title: 'Prescription Validated',
    message: 'Your recent prescription upload has been reviewed and approved by our pharmacist.',
    timeOffset: "INTERVAL '2 hours'",
  },
  {
    type: 'system',
    title: 'Welcome to MediVault!',
    message: 'We are glad to have you. Explore our catalog of medications and easily manage your prescriptions.',
    timeOffset: "INTERVAL '1 day'",
  },
  {
    type: 'alert',
    title: 'Profile Incomplete',
    message: 'Please complete your medical summary in the profile section for better medication recommendations.',
    timeOffset: "INTERVAL '2 days'",
  },
];

exports.getNotifications = async (req, res) => {
  try {
    await ensureUserRecord(req.user);

    // Fetch existing notifications
    let result = await db.query(
      `SELECT id, type, title, message, is_read, created_at 
       FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.firebase_uid]
    );

    // Auto-seed if 0 notifications exist (for demo purposes)
    if (result.rows.length === 0) {
      for (const noti of SEED_NOTIFICATIONS) {
        await db.query(
          `INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
           VALUES ($1, $2, $3, $4, false, NOW() - ${noti.timeOffset})`,
          [req.user.firebase_uid, noti.type, noti.title, noti.message]
        );
      }

      // Re-fetch after seeding
      result = await db.query(
        `SELECT id, type, title, message, is_read, created_at 
         FROM notifications 
         WHERE user_id = $1 
         ORDER BY created_at DESC`,
        [req.user.firebase_uid]
      );
    }

    const notifications = result.rows.map(row => ({
      id: String(row.id),
      type: row.type,
      title: row.title,
      message: row.message,
      is_read: row.is_read,
      created_at: row.created_at,
    }));

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await ensureUserRecord(req.user);

    await db.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1 AND is_read = false`,
      [req.user.firebase_uid]
    );

    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
