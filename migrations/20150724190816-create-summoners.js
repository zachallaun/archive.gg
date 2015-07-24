var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;
var async = require('async');

exports.up = function(db, callback) {
  async.series([
    db.createTable.bind(db, 'summoners', {
      id: { type: type.INTEGER, primaryKey: true, autoIncrement: true },
      summonerId: { type: type.INTEGER, notNull: true, unique: true },
      summonerName: { type: type.STRING, notNull: true },
      region: type.STRING,
      registrationState: type.STRING,
      archiveEmailAddress: type.STRING,
      profileIconUrl: type.STRING,
      division: type.STRING,
    }),
    db.addIndex.bind(db, 'summoners', 'indexSummonersOnSummonerName', [
      'summonerName',
    ]),
  ], callback);
};

exports.down = function(db, callback) {
  async.series([
    db.removeIndex.bind(db, 'summoners', 'indexSummonersOnSummonerName'),
    db.dropTable.bind(db, 'summoners'),
  ], callback);
};
