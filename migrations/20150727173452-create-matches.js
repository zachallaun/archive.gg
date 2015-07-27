var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;
var async = require('async');

exports.up = function(db, callback) {
  async.series([
    db.createTable.bind(db, 'matches', {
      id:                   { type: type.INTEGER, primaryKey: true, autoIncrement: true },
      summonerId:           { type: type.INTEGER, notNull: true },
      matchId:              { type: type.INTEGER, notNull: true },
      championId:           { type: type.INTEGER, notNull: true },
      matchDuration:        { type: type.INTEGER, notNull: true },
      queueType:            { type: type.STRING, notNull: true },
      kills:                { type: type.INTEGER, notNull: true },
      deaths:               { type: type.INTEGER, notNull: true },
      assists:              { type: type.INTEGER, notNull: true },
      winner:               { type: type.BOOLEAN, notNull: true },
      matchHistoryUrl:      { type: type.STRING, notNull: true },
      replayUrl:            { type: type.STRING, notNull: true },
      replayUnsubscribeUrl: { type: type.STRING, notNull: true },
    }),
    db.addIndex.bind(db, 'matches', 'indexMatchesOnSummonerIdAndMatchId', [
      'summonerId',
      'matchId',
    ]),
  ], callback);
};

exports.down = function(db, callback) {
  async.series([
    db.removeIndex.bind(db, 'matches', 'indexMatchesOnSummonerIdAndMatchId'),
    db.dropTable.bind(db, 'matches'),
  ], callback);
};
