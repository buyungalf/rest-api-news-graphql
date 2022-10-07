module.exports = (sequelize, Sequelize) => {
  const News = sequelize.define(
    "news",
    {
      title: {
        type: Sequelize.STRING,
      },
      content: {
        type: Sequelize.TEXT,
      },
      thumbnail: {
        type: Sequelize.STRING,
      },
      author: {
        type: Sequelize.STRING,
      },
    },
    {
      sequelize,
      paranoid: true,
      deletedAt: "destroyTime",
    }
  );

  return News;
};
