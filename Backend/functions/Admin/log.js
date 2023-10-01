// Loggt alle wichitigen Events definiert im Pflichtenheft
import { sql_con } from "../../db/db-config.js";

export async function log_message(message, email, schwere,  operation) {  
    if (!message || !operation) return false;  
    try {  
        let date = new Date(); // Aktuelles Datum und aktuelle Uhrzeit

        sql_con.promise().query("INSERT INTO Log (Log_Zeit, User_Email, Schwere, Operation, Log_Beschreibung) VALUES (?, ?, ?, ?, ?);",
            [date, email, schwere, operation, message]);

    } catch (err) {
        console.log(err)
        console.log("Fehler beim hinzufügen in die Adminlog");
        return false;
    }
    return true;
}

export const logEinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    try {
        var [result] = await sql_con.promise().query("SELECT * FROM Log;"); 
        output.data = result
        output.status = true;
        output.msg = "Log ausgegeben.";
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Log konnten nicht ausgegeben werden!";
    }
    console.log(output);
    res.json(output);
}
// Gibt die gesamte Tabelle zurück

  