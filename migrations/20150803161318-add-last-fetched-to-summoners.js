var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('summoners', 'lastFetched', {
    type: type.BIG_INTEGER,
  }, callback);
};

exports.down = function(db, callback) {
  db.removeColumn('summoners', 'lastFetched', callback);
};
