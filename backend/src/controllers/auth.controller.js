const pool = require('../config/db');

const syncProfile = async (req, res) => {
  try {
    const { firebase_uid, email, name } = req.user;

    // Check if user exists, if not, insert
    // We use ON CONFLICT (firebase_uid) DO UPDATE to ensure the profile is always up to date
    const query = `
      INSERT INTO users (firebase_uid, email, full_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (firebase_uid) 
      DO UPDATE SET 
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name)
      RETURNING id, firebase_uid, email, full_name, role, created_at;
    `;

    const values = [firebase_uid, email, name];
    
    const result = await pool.query(query, values);
    
    return res.status(200).json({
      message: 'Profile synced successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error syncing profile:', error);
    
    // Check if it's a unique constraint error on email (e.g. if they sign in with a different provider using the same email)
    if (error.code === '23505' && error.constraint === 'users_email_key') {
       try {
           const updateQuery = `
               UPDATE users 
               SET firebase_uid = $1, full_name = COALESCE(full_name, $2)
               WHERE email = $3
               RETURNING id, firebase_uid, email, full_name, role, created_at;
           `;
           const updateResult = await pool.query(updateQuery, [req.user.firebase_uid, req.user.name, req.user.email]);
           
           if (updateResult.rows.length > 0) {
               return res.status(200).json({
                   message: 'Profile linked and synced successfully',
                   user: updateResult.rows[0],
               });
           }
       } catch (updateError) {
           console.error('Error linking profile:', updateError);
       }
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  syncProfile,
};
