import { sql_con } from "../../db/db-config.js";
import { hashPassword } from "../../utils/hash-util.js";
import { checkIfEmailExists, checkIfEmailExistsInMitarbeiter } from "../../utils/email-util.js";
import { getMiDbyEmail, getShopIDbyMiD, checkIfMitarbeiterExistsById } from "./haendler-utils.js";
import { log_message } from "../Admin/log.js"


export const mitarbeiterEinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    var mID = await getMiDbyEmail(userEmail);
    console.log(mID);
    if (!mID) {
        output.status = false;
        output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    var sID = await getShopIDbyMiD(mID);
    if (!sID) {
        output.status = false;
        output.msg = "Keine Shops im Besitz!";
        console.log(output);
        res.json(output);
        return
    }

    try {   
        const [result] = await sql_con.promise().query(
            "SELECT * FROM Mitarbeiter WHERE gehoertZuShop = ? AND istHaendler = 0", 
            [sID]); 
        

        var count = result.length;
        for (var i = 0; i < count; i++) {
            output.data[i] = {
                vorname: result[i].MA_Vorname, 
                name: result[i].MA_Name,
                email: result[i].MA_EMail_Adresse,
                ID: result[i].MitarbeiterID
            }
        }

        output.status = true;
        output.msg = "Alle Mitarbeiter zurückgegeben.";
        output.details = count;
        if (count == 0) {
            output.status = false;
            output.msg = "Keine Mitarbeiter!";
            output.details = count;            
        }
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Ein Fehler ist aufgetreten!";
    }
    console.log(output);
    res.json(output);
}

export const mitarbeiterErstellen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    if (!req.body.name || !req.body.email || !req.body.passwort || !req.body.vorname) {
        output.status = false;
        output.msg = "Nicht alle Felder ausgefüllt!";
    } else {
        const { exists } = await checkIfEmailExists(req.body.email); // Email exists
        if (exists) {
            output.status = false;
            output.msg = "Diese Email wird bereits verwendet!";
        } else {
            var mID = await getMiDbyEmail(userEmail);
            console.log(mID);
            if (!mID) {
                output.status = false;
                output.msg = "Mitarbeiter konnte nicht gefunden werden!";
                console.log(output);
                res.json(output);
                return
            }
    
            var sID = await getShopIDbyMiD(mID);
            if (!sID) {
                output.status = false;
                output.msg = "Keine Shops im Besitz!";
                console.log(output);
                res.json(output);
                return
            }

            try {
                const {
                name,
                vorname,
                email
                } = req.body;
                const hashedPassword = await hashPassword(req.body.passwort);
            
                // Erstellte Mitarbeiter sind automatisch verifiziert
                const [result] = await sql_con.promise().query(
                    "INSERT INTO Mitarbeiter (MA_Name, MA_Vorname, MA_Passwort, MA_EMail_Adresse, istHaendler, gehoertZuShop, istVerifiziert) VALUES (?, ?, ?, ?, ?, ?, ?);",
                    [name, vorname, hashedPassword, email, +false, sID, 1] // +true => 1, +false => 0
                ); // 0 = false = kein Händler
            
                output.status = true;
                output.msg = "Mitarbeiter angelegt!";
                log_message("Mitarbeiter angelegt mit der ID: "+result.insertId, userEmail, "Kein Fehler", "mitarbeiterErstellen")
            } catch (err) {
                console.log(err);
                output.status = false;
                output.msg = "Mitarbeiter konnte nicht angelegt werden!";
                log_message("Mitarbeiter konnte nicht angelegt werden. Err: "+err, userEmail, "Systemfehler", "mitarbeiterErstellen")
            }
        }
    }
    console.log(output);
    res.json(output);
}

export const mitarbeiterBearbeiten = async (req, res) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    if (!req.body.id) {
        output.status = false;
        output.msg = "Fehlende id";
    } else {
        if (!req.body.name && !req.body.passwort && !req.body.vorname && !req.body.email) {
            output.status = false;
            output.msg = "Keine Änderung zum vornehmen!";
        } else {
            const userExists = await checkIfMitarbeiterExistsById(req.body.id);
            if (!userExists) {
                output.status = false;
                output.msg = "Mitarbeiter mit der ID existiert nicht";
                console.log(output);
                res.json(output);
                return;
            } else {
                var result = await sql_con
                .promise()
                .query(
                "SELECT * FROM Mitarbeiter WHERE MitarbeiterID = (?);",
                [req.body.id]);
                var vorname;
                var name; 
                var email;
                var passwort;
                
                if (req.body.name == "" || !req.body.name) {
                    //Der Name bleibt
                    name = result[0][0].MA_Name;
                } else { name = req.body.name; }
                if (req.body.vorname == "" || !req.body.vorname) {
                    //vorname blebit
                    vorname = result[0][0].MA_Vorname; 
                } else { vorname = req.body.vorname; }
                if (req.body.email == "" || !req.body.email) {
                    //Email bleibt
                    email = result[0][0].MA_EMail_Adresse;
                } else {
                    // Email wird geändert
                    if (req.body.email != result[0][0].MA_EMail_Adresse) {
                        var { exists } = await checkIfEmailExists(req.body.email); // Email exists
                        if (exists) {
                            output.status = false;
                            output.msg = "Diese Email wird bereits verwendet!";
                            console.log(output);
                            res.json(output);
                            return;
                        }
                    }
                    email = req.body.email;
                }
                if (req.body.passwort == "" || !req.body.passwort) {
                    passwort = result[0][0].MA_Passwort;
                } else {
                    passwort = await hashPassword(req.body.passwort);
                }
                try {
                    result = await sql_con
                    .promise()
                    .query(
                        "UPDATE Mitarbeiter SET MA_Name = ?, MA_Vorname = ?, MA_Passwort = ?, MA_EMail_Adresse = ? WHERE MitarbeiterID = ?;",
                        [name, vorname, passwort, email, req.body.id] 
                    );
                    output.status = true;
                    output.msg = "Mitarbeiter informationen geändert!";
                } catch (err) {
                    console.log(err);
                    output.status = false;
                    output.msg = "Mitarbeiter konnte nicht verändert werden!";
                }
            }
        }
    }
    console.log(output);
    res.json(output);
}