module.exports = (sequelize, Sequelize) => {
  const Users = sequelize.define("users", {
    nama: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    username: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
  });

  return Users;
};
