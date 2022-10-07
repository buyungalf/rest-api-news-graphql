module.exports = (sequelize, Sequelize) => {
  const Comments = sequelize.define("comments", {
    name: {
      type: Sequelize.STRING,
    },
    comment: {
      type: Sequelize.STRING,
    },
  });

  return Comments;
};
