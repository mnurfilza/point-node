const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes, projectCode) => {
  class UserActivities extends Model {
    static associate({ [projectCode]: models }) {
      this.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    }
  }
  UserActivities.init(
    {
      tableType: {
        type: DataTypes.STRING,
      },
      tableId: {
        type: DataTypes.NUMBER,
      },
      number: {
        type: DataTypes.STRING,
      },
      date: {
        type: DataTypes.DATE,
      },
      userId: {
        type: DataTypes.NUMBER,
      },
      activity: {
        type: DataTypes.STRING,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'UserActivities',
      tableName: 'user_activities',
      underscored: true,
    }
  );
  return UserActivities;
};
