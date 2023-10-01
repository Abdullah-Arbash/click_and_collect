import { sql_con } from "../../db/db-config.js";
import { getLoggedInUser } from "../../utils/user-util.js";
import { getMiDbyEmail, getShopIDbyMiD } from "./haendler-utils.js";

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
    return
}

// Shop ID rausgeben
var sID = await getShopIDbyMiD(mID);
if (!sID) {
    output.status = false;
    output.msg = "Keine Shops im Besitz!";
    console.log(output);
    res.json(output);
    return
}
    try {
    // Mitarbeiter des Shops rausgeben
        const [resultMitarbeiter] = await sql_con.promise().query("SELECT Mitarbeiter.MitarbeiterID, Mitarbeiter.MA_Name AS Name, Aufgaben.Aufgabe AS Aufgabe FROM Mitarbeiter JOIN Aufgaben ON Aufgaben.MitarbeiterID = Mitarbeiter.MitarbeiterID WHERE gehoertZuShop = (?);",
        [sID]);  
    // Aufgaben und zuständige Mitarbeiter anzeigen    
    /*const [result2] = await sql_con.promise().query("SELECT Aufgaben.Aufgabe AS Aufgabe, Mitarbeiter.MA_Name AS Name FROM Aufgaben JOIN Mitarbeiter ON Aufgaben.MitarbeiterID = Mitarbeiter.MitarbeiterID;") */

    /*
        const [[result2]] = await sql_con.promise().query("SELECT * FROM Aufgaben WHERE MitarbeiterID = (?);",
        [resultMitarbeiter]);

    // Mitarbeiter Namen und Vornamen rausfinden
        const [[employeeName]] = await sql_con.promise().query("SELECT Mitarbeiter.MA_Name, Mitarbeiter.MA_Vorname FROM Mitarbeiter JOIN Aufgaben ON Aufgaben.MitarbeiterID = Mitarbeiter.MitarbeiterID WHERE Mitarbeiter.MitarbeiterID = (?);",
        [resultMitarbeiter]);

        let [employee] = [employeeName];
    */
    // Sende response

        output.data = resultMitarbeiter.map(e => ({
            task: e.Aufgabe,
            employee: e.Name,
            id: e.MitarbeiterID
        }));
        output.status = true;
        output.msg = "Einsicht erfolgreich.";
        output.details = resultMitarbeiter.length;

        console.log(output);
        res.json(output);

    } catch {
        res.status(500).json ({
            status: false,
            msg: "Ein Fehler ist aufgetreten!",
            details: {},
            data: [{}]
        })
    }
} 

export const aufgabeErstellen = async (req, res) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 
        
    const {
        task,
        id
    } = req.body;


 try {
//Prüfe, ob Daten eingegeben wurden
    if (!task || !id ) {
        res.json({
            status: false,
            msg: "Nicht alle Felder ausgefüllt!",
            data: [{}]
        });
        return;
    }

// Daten in DB einfügen
    await sql_con.promise().query("INSERT INTO Aufgaben (MitarbeiterID, Aufgabe) VALUES (?,?);",
    [id, task]);

// Sende response
    res.status(201).json({
        status: true,
        msg: "Aufgabe hinzugefügt.",
        details: {},
        data: [{}]
    });
    return;

} catch (err) {
    console.log(err);
    res.status(500).json({
        status: false,
        msg: "Aufgabe konnte nicht hinzugefügt werden!",
        details: {},
        data: [{}]
    })
}

} 

export const aufgabeLöschen = async (req, res) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    const {
        task,
        id
    } = req.body;

    if (!req.body.id || req.body.id == "") {
        res.status(400).json ({
            status: false,
            msg: "Id fehlt!",
            details: {},
            data: [{}]
        })
        return
    }

    try {
        // DELETE Aufgabe
        await sql_con.promise().query("DELETE FROM Aufgaben WHERE MitarbeiterID = (?) AND Aufgabe = (?) LIMIT 1;", 
        [id, task]
        );
    } catch (error) {
        // Wenn ein Fehler auftritt
        res.status(500).json ({
            status: false,
            msg: "Aufgabe konnte nicht entfernt werden!",
            details: {},
            data: [{}]
        })
        return; 
    }

    // Sende response
    res.status(200).json ({
        status: true,
        msg: "Aufgabe entfernt.",
        details: {},
        data: [{}]
    });
}

export const aufgabeBearbeiten = async (req, res) => {

    const {
        task,
        newtask,
        id,
    } = req.body;

    try {
        // UPDATE Aufgabe
        const result = await sql_con.promise().query("UPDATE Aufgaben SET Aufgabe = (?) WHERE MitarbeiterID = (?) AND Aufgabe = (?) LIMIT 1;", 
            [newtask, id, task]
        );
    } catch (err) {
        // Wenn ein Fehler auftritt
        res.json ({
            status: false,
            msg: "Aufgabe konnte nicht geändert werden!",
            details: {},
            data: [{}]
        })
    }
        
    // Sende response
    res.json ({
        status: true,
        msg: "Aufgabe geändert.",
        details: {},
        data: [{}]
    });

    return;
} 

export const mitarbeiterDropdown = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: []
    }; 

    const {
        employee
    } = req.body; 
    
// Händler ID rausgeben
var mID = await getMiDbyEmail(userEmail);
console.log(mID);
if (!mID) {
    output.status = false;
    output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu einloggen.";
    console.log(output);
    res.json(output);
    return
}

    // Shop ID rausgeben
    var sID = await getShopIDbyMiD(mID);
    if (!sID) {
        output.status = false;
        output.msg = "Keine Shops im Besitz!";
        console.log(output);
        res.json(output);
        return
    } try {
    // Mitarbeiter des Shops rausgeben
        const [resultMitarbeiter] = await sql_con.promise().query("SELECT * FROM Mitarbeiter WHERE gehoertZuShop = (?) AND istHaendler = 0;",
        [sID]); 

        var count = resultMitarbeiter.length;
        for (var i = 0; i < count; i++) {
            output.data[i] = {
                name: resultMitarbeiter[i].MA_Name,
                ID: resultMitarbeiter[i].MitarbeiterID
            }
        }

        // Sende response
        output.status = true;
        output.msg = "Erfolgreich ausgegeben.";
        output.details = resultMitarbeiter.length;
    } catch(err) {
        console.log(err)
        res.json ({
            status: false,
            msg: "Ein Fehler ist aufgetreten!",
            details: {},
            data: []
        })
        return;
    }
    console.log(output);
    res.json(output);
}