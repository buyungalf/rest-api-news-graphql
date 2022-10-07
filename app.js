const { ApolloServer, gql } = require("apollo-server");

var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("./config");

const db = require("./models");
db.sequelize
  .sync()
  .then(() => {
    console.log("sync db");
  })
  .catch((err) => {
    console.log(err.message);
  });

const News = db.news;
const Comments = db.comments;
const Users = db.users;

const resolvers = {
  Query: {
    news: () => {
      return News.findAll()
        .then((data) => {
          return data;
        })
        .catch((err) => {
          return [];
        });
    },
    comments: (parent, args, context) => {
      return Comments.findAll()
        .then((data) => {
          return data;
        })
        .catch((err) => {
          return [];
        });
    },
  },

  Mutation: {
    createNews: (parent, { title, content, thumbnail, author }) => {
      var news = {
        title: title,
        content: content,
        thumbnail: thumbnail,
        author: author,
      };
      return News.create(news)
        .then((data) => {
          return data;
        })
        .catch((err) => {
          return {};
        });
    },
    getNews: (parent, { id }) => {
      return News.findByPk(id)
        .then((data) => {
          return data;
        })
        .catch((err) => {
          return {};
        });
    },
    updateNews: (parent, { id, title, content, thumbnail, author }) => {
      var news = {
        title: title,
        content: content,
        thumbnail: thumbnail,
        author: author,
      };
      return News.update(news, {
        where: { id: id },
      })
        .then((num) => {
          return news;
        })
        .catch((err) => {
          return {};
        });
    },
    deleteNews: (parent, { id }) => {
      return News.findByPk(id)
        .then((detailNews) => {
          if (detailNews) {
            return News.destroy({
              where: { id: id },
            })
              .then((num) => {
                return detailNews;
              })
              .catch((err) => {
                return {};
              });
          } else {
            return {};
          }
        })
        .catch((err) => {
          return {};
        });
    },
    getComments: (parent, { newsId }) => {
      return Comments.findAll({ where: { newsId: newsId } })
        .then((data) => {
          return data;
        })
        .catch((err) => {
          return {};
        });
    },
    createComments: (parent, { name, comment, newsId }) => {
      var comment = {
        name: name,
        comment: comment,
        newsId: newsId,
      };
      return Comments.create(comment)
        .then((data) => {
          return data;
        })
        .catch((err) => {
          return err;
        });
    },
    register: (parent, { nama, username, email, password }) => {
      var password_hash = bcrypt.hashSync(password, 8);
      var user = {
        nama: nama,
        username: username,
        email: email,
        password: password_hash,
      };
      return Users.create(user)
        .then((data) => {
          return data;
        })
        .catch((err) => {
          return {};
        });
    },
    login: (parent, { username, password }) => {
      return Users.findOne({
        where: { username: username },
      })
        .then((data) => {
          if (data) {
            var valid = bcrypt.compareSync(password, data.password);
            if (valid) {
              var payload = {
                id: data.id,
                username: username,
              };

              let token = jwt.sign(payload, config.secret, {
                expiresIn: "3h",
              });
              let dt = new Date();
              dt.setHours(dt.getHours() + 3);
              return {
                success: true,
                token: token,
                expired:
                  dt.toLocaleDateString() + " " + dt.toLocaleTimeString(),
              };
            } else {
              return {
                info: "Login Error",
                message: err.message,
              };
            }
          } else {
            return {
              info: "Login Error",
              message: err.message,
            };
          }
        })
        .catch((err) => {
          return {
            info: "Login Error",
            message: err.message,
          };
        });
    },
  },
};

const {
  ApolloServerPluginLandingPageLocalDefault,
} = require("apollo-server-core");

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.

const fs = require("fs");
const path = require("path");
const typeDefs = fs.readFileSync("./schema.graphql", "utf-8").toString();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: "bounded",
  /**
   * What's up with this embed: true option?
   * These are our recommended settings for using AS;
   * they aren't the defaults in AS3 for backwards-compatibility reasons but
   * will be the defaults in AS4. For Newsion environments, use
   * ApolloServerPluginLandingPageNewsionDefault instead.
   **/

  context: ({ req }) => {
    const token = req.headers.authorization || "";

    if (token) {
      // jwt.decode()
      var payload = jwt.verify(token, config.pubkey);
      Users.findByPk(payload.id)
        .then((data) => {
          if (data) {
            return data;
          } else {
            return {};
          }
        })
        .catch((err) => {
          return { err };
        });
    } else {
      return {};
    }
  },
  plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
