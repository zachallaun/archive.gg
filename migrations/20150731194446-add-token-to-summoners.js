var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;
var async = require('async');
var pg = require('pg');

var DATABASE_URL = process.env.DATABASE_URL;

function genToken(id) {
  return 'archivegg-' + id;
}

exports.up = function(db, callback) {
  async.series([
    db.changeColumn.bind(db, 'summoners', 'archiveEmailAddress', {
      type: type.STRING,
      unique: true,
    }),
    db.addColumn.bind(db, 'summoners', 'token', {
      type: type.STRING,
      unique: true,
    }),
    db.addColumn.bind(db, 'summoners', 'replayUnsubscribeUrl', {
      type: type.STRING,
    }),
  ], function () {
    callback();

    pg.connect(DATABASE_URL, function (err, client, done) {
      if (err) throw err;

      client.query('SELECT * FROM summoners', function (err, resp) {
        if (err) throw err;

        var q = 'UPDATE summoners SET token = $1 WHERE summoners.id = $2';

        async.series(resp.rows.map(function (summoner) {
          return function (callback) {
            var values = [genToken(summoner.id), summoner.id];

            console.log(q, values);

            client.query(q, values, function (err, resp) {
              if (err) return callback(err);
              callback();
            });
          }
        }), function () {
          done();
          process.exit();
        });
      });
    });
  });
};

exports.down = function(db, callback) {
  async.series([
    db.removeColumn.bind(db, 'summoners', 'replayUnsubscribeUrl'),
    db.removeColumn.bind(db, 'summoners', 'token'),
    db.changeColumn.bind(db, 'summoners', 'archiveEmailAddress', {
      type: type.STRING,
      unique: false,
    }),
  ], callback);
};
