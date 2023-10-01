import mysql from "mysql2";

export var sql_con = mysql.createConnection({
  host: "132.231.36.105",
  user: "remote",
  password: "password",
  database: "Click&Collect"
});

sql_con.connect(function (err) {
  if (err) {
    console.log("remote connection failed, retrying with intern connection");
    sql_con = mysql.createConnection({
      host: "132.231.36.105",
      user: "intern",
      password: "password",
      database: "Click&Collect"
    });
    sql_con.connect(function (err) {
      if (err) console.log("Einloggdaten falsch, offline oder nicht im Uni-Netwerk!");
      else console.log("Connected to db");
    });
  }
  else console.log("Connected to db");
});


function ping() {
  var sql_keep = `SELECT 1 + 1 AS dummy`; 
  sql_con.query(sql_keep, function (err, result) {
      if (err) throw err;
      console.log("Ping DB");
  });
}

setInterval(ping, 400000);