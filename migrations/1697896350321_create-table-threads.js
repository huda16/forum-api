/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.createTable('threads', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
      unique: true,
    },
    body: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: false,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = pgm => {
  pgm.dropTable('threads');
};
