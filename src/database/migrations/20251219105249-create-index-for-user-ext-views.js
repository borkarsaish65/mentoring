'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        `
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = 'm_user_extensions'
          ) THEN

            CREATE INDEX IF NOT EXISTS idx_user_ext_org_name_partial
            ON m_user_extensions (organization_id, LOWER(name))
            WHERE is_mentor = true;

          END IF;
        END $$;
        `,
        { transaction }
      )
    })
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        `
        DROP INDEX IF EXISTS idx_user_ext_org_name_partial;
        `,
        { transaction }
      )
    })
  },
}
