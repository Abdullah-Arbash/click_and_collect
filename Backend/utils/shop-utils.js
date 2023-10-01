import { sql_con } from "../db/db-config.js";

export async function getShopKategorieByName(name) {
    try {
      const result = await sql_con
        .promise()
        .query(
          "SELECT * FROM Shopkategorie WHERE S_Kategoriename = (?);",
          [name]
        );
      return result[0][0].S_KategorieID
    } catch (err) {
      console.log(err);
      return false
    }
}

export async function getShopKategorieNameByID(id) {
  try {
    const result = await sql_con
      .promise()
      .query(
        "SELECT * FROM Shopkategorie WHERE S_KategorieID = (?);",
        [id]
      );
    return result[0][0].S_Kategoriename
  } catch (err) {
    console.log(err);
    return false
  }
}

//Gibt die Öffnungszeiten in einem Standardisierten Format zurück
export async function getOpeningTimesInJSON(sID) {
  const weekdays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
  try {
      const resultOpeningTimes = await sql_con.promise().query("SELECT * FROM Oeffnungszeiten WHERE ShopID = (?);",
      [sID]);

      var workingDays = {};
      for (var i = 0; i < resultOpeningTimes[0].length; i++) {
          workingDays[resultOpeningTimes[0][i].O_Tag] = {
          start:resultOpeningTimes[0][i].Von,
          end:resultOpeningTimes[0][i].Bis
          }
      }

      const schedule = []
      weekdays.forEach((day, index)=>{
          if(workingDays[day]){
              schedule[index] = {day: day, startTime: workingDays[day]['start'].slice(0, -3), endTime: workingDays[day]['end'].slice(0, -3)}
          }else{
              schedule[index] = {day: day, startTime: null, endTime: null}
          }
      })

      return schedule;
  } catch (err) {
      console.log(err);
      return false
  }
}
