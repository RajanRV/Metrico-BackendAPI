'use strict';

const bcrypt = require('bcryptjs');
const ADMIN_ID = 'a1b2c3d4-0000-0000-0000-000000000003';
const SUPER_ID = 'a1b2c3d4-0000-0000-0000-000000000004';

module.exports = {
  async up(queryInterface) {
    const salt = await bcrypt.genSalt(12);
    const adminHash = await bcrypt.hash('Admin@1234', salt);
    const superHash = await bcrypt.hash('Super@1234', salt);


    await queryInterface.bulkInsert('users', [
      {
        user_id: ADMIN_ID,
        first_name: 'Super',
        last_name: 'Admin',
        email: 'admin@metrico.io',
        password_hash: adminHash,
        role: 'Admin',
        web_access_enabled: true,
        status: 'Active',
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: SUPER_ID,
        first_name: 'John',
        last_name: 'Supervisor',
        email: 'supervisor@metrico.io',
        password_hash: superHash,
        role: 'Supervisor',
        web_access_enabled: true,
        status: 'Active',
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      user_id: [ADMIN_ID, SUPER_ID],
    })
  },
};