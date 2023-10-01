import { sql_con } from "../../db/db-config.js";
import { getMiDbyEmail } from "../Händler/haendler-utils.js";

export const aufgabenEinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    // Händler ID rausgeben
    var mID = await getMiDbyEmail(userEmail);
    console.log(mID);
    if (!mID) {
        output.status = false;
        output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return;
    }

    try {
    // Mitarbeiter des Shops rausgeben
        const [result] = await sql_con.promise().query("SELECT * FROM Aufgaben WHERE MitarbeiterID = (?);",
        [mID]);  

        var count = result.length;
        for (var i = 0; i < count; i++) {
            output.data[i] = {
                id: result[i].AufgabenID,
                task: result[i].Aufgabe,
                completed: result[i].Abgeschlossen === 1 ? true : false
            }
        }
        output.status = true;
        output.msg = "Einsicht erfolgreich.";
        output.details = count;

        console.log(output);
        res.json(output);

    } catch(err) {
        console.log(err)
        res.status(500).json ({
            status: false,
            msg: "Ein Fehler ist aufgetreten!",
            details: {},
            data: [{}]
        })
    }
} 

export const aufgabeAendern = async (req, res) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 
        
    const {
        task
    } = req.body;

    console.log(mID);
    if (!mID) {
        output.status = false;
        output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    try {
        //Prüfe, ob Daten eingegeben wurden
        if (!id ) {
            res.json({
                status: false,
                msg: "Nicht alle Felder ausgefüllt!",
                data: [{}]
            });
            return;
        }

        var [result] = await sql_con.promise().query("SELECT * FROM Aufgaben WHERE AufgabenID = (?) AND MitarbeiterID", [task, mID]);
        console.log(result[0].Abgeschlossen);
        var tinyint = result[0].Abgeschlossen
        if (tinyint == 0) {
            tinyint = 1;
        } else {
            tinyint = 0;
        }
        await sql_con.promise().query("UPDATE Aufgaben SET Abgeschlosse = ? WHERE AufgabenID = (?)",
        [tinyint, id]);



    // Sende response
        res.status(201).json({
            status: true,
            msg: "Status geändert hinzugefügt.",
            details: {},
            data: [{}]
        });
        return;

    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: false,
            msg: "Aufgabe konnte nicht geändert werden!",
            details: {},
            data: [{}]
        })
    }
} 