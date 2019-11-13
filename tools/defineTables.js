"use strict";
const Sequelize = require('sequelize');
/**
 * 資料庫定義
 */
const defineTables={
    player: {
        table: {
            aid: { type: Sequelize.INTEGER, primaryKey: true },
            name: { type: Sequelize.STRING(50), unique: true, allowNull: false },
            level: { type: Sequelize.STRING(50), defaultValue: 1 },
            exp: { type: Sequelize.SMALLINT, defaultValue: 0 },
            photo: { type: Sequelize.STRING(50)},
            lastLogin: { type: Sequelize.DATE },
        },
        option: {
            timestamps: true,
            updatedAt:false,
            freezeTableName: true
        },
    },
}

module.exports.defineTables = defineTables;