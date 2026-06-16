'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.addColumn('test_results', 'detected_color_hex_2', {
      type: DataTypes.STRING(7),
      allowNull: true,
      after: 'detected_color_hex',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('test_results', 'detected_color_hex_2');
  },
};