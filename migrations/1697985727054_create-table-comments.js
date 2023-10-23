/* eslint-disable camelcase */

exports.up = pgm => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"threads"',
      onDelete: 'cascade',
    },
    is_delete: {
      type: 'BOOL',
      notNull: true,
      default: false
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: false,
    },
    deleted_at: {
      type: 'TIMESTAMP',
      notNull: false,
    },
  });
};

exports.down = pgm => {
  pgm.dropTable('comments');
};
