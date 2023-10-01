import { hashPassword } from "../utils/hash-util.js";
import { checkIfEmailExists } from "../utils/email-util.js";
import { sql_con } from "../db/db-config.js";
import { getLoggedInUser } from "../utils/user-util.js";
import { getShopKategorieNameByID, getOpeningTimesInJSON } from "../utils/shop-utils.js";

export const profilEinsehen = async (req, res) => {
    var email;
    var rolle;
    try {
        ({email, rolle} = await getLoggedInUser(req, res));
    } catch {
        return;
    }

    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    try {   
        if (rolle == "kunde") {
            const result = await sql_con
            .promise()
            .query(
                "SELECT * FROM Kunde WHERE K_EMail_Adresse = (?)", 
                [email] 
            );     
            console.log(rolle)
            console.log(email)
            output.status = true;
            output.msg = "Informationen geladen.";
            output.details = {
                name: result[0][0].K_Name,
                vorname: result[0][0].K_Vorname,
                email: result[0][0].K_EMail_Adresse,
                passwort: "",
                neuespasswort: ""
            }; 
        }
        else if (rolle == "mitarbeiter") {
            const result = await sql_con
            .promise()
            .query(
                "SELECT * FROM Mitarbeiter WHERE MA_EMail_Adresse = ?", 
                [email] 
            );   

            output.status = true;
            output.msg = "Informationen geladen.";
            output.details = {
                name: result[0][0].MA_Name,
                vorname: result[0][0].MA_Vorname,
                email: result[0][0].MA_EMail_Adresse,
                passwort: "",
                neuespasswort: "",
                ShopZugehörigkeit: result[0][0].gehoertZuShop
            }; 
        }
        else if (rolle == "admin") {
            const result = await sql_con
            .promise()
            .query(
                "SELECT * FROM Administrator WHERE A_EMail_Adresse = ?", 
                [email] 
            );   

            output.status = true;
            output.msg = "Informationen geladen.";
            output.details = {
                name: result[0][0].A_Name,
                vorname: result[0][0].A_Vorname,
                email: result[0][0].A_EMail_Adresse,
                passwort: "",
                neuespasswort: ""
            }; 
        }
        else if (rolle == "haendler") {
            const result = await sql_con
            .promise()
            .query(
                "SELECT * FROM Mitarbeiter WHERE MA_EMail_Adresse = ?", 
                [email] 
            );  

            const resultShop = await sql_con.promise().query(
                "SELECT * FROM Shop WHERE MitarbeiterID = ?", 
                [result[0][0].MitarbeiterID] 
            );               

            var openingTimes = await getOpeningTimesInJSON(resultShop[0][0].ShopID);

            const kategoriename = await getShopKategorieNameByID(resultShop[0][0].S_KategorieID);

            output.status = true;   
            output.msg = "Informationen geladen.";
            output.details = {
                name: result[0][0].MA_Name,
                vorname: result[0][0].MA_Vorname,
                email: result[0][0].MA_EMail_Adresse,
                passwort: "",
                neuespasswort: "",
                shopZugehörigkeit: result[0][0].gehoertZuShop,
                shopname: resultShop[0][0].S_Name,
                straße: resultShop[0][0].Straße,
                postleitzahl: resultShop[0][0].Postleitzahl,
                ortschaft: resultShop[0][0].Ortschaft,
                land: resultShop[0][0].Land,
                telefonnummer: resultShop[0][0].Telefonnummer,
                shopemail: resultShop[0][0].S_EMail_Adresse,
                umsatzsteuerid: resultShop[0][0].Umsatzsteueridentifikationsnummer,
                shopkategorie: kategoriename
            }; 

            output.data = openingTimes;
        }
    } catch(err) {
        console.log(err)
        output.status = false;
        output.msg = "Informationen konnten nicht geladen werden!";
        res.json(output);   
        return;
    }
    console.log(output);
    res.json(output);   
}

//Hinweis: Nach der Änderung ist der Token nicht mehr gültig wenn die Email verändert wurde
export const profilBearbeiten = async (req, res) => { 
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 
    var email;
    var rolle;
    var changedEmail = false; // Wenn sich die Email ändert, ist der Token nicht mehr gültig.
    console.log(req.body)

    try {
        ({email, rolle} = await getLoggedInUser(req, res));
    } catch {
        return;
    }
    const useremail = email

    try {
        if (!req.body.name && !req.body.passwort && !req.body.vorname && !req.body.email && rolle != "haendler") {
            output.status = false;
            output.msg = "Keine Änderung zum vornehmen!";
        } else if (rolle == "haendler") {
            if (req.body.data.passwort != req.body.data.neuespasswort) {
                output.status = false;
                output.msg = "Passwörter stimmen nicht überein!";
                console.log(output);
                res.json(output);
                return
            }
        } else {
            if (req.body.passwort != req.body.neuespasswort) {
                output.status = false;
                output.msg = "Passwörter stimmen nicht überein!";
                console.log(output);
                res.json(output);
                return
            }
        }
        if (rolle == "mitarbeiter") {
            var result = await sql_con
            .promise()
            .query(
            "SELECT * FROM Mitarbeiter WHERE MA_EMail_Adresse = (?);",
            [useremail]
            );
            var vorname;
            var name; 
            var email;
            var passwort;
            
            if (req.body.name == "" || !req.body.name) {
                name = result[0][0].MA_Name;
            } else { name = req.body.name; }
            if (req.body.vorname == "" || !req.body.vorname) {
                vorname = result[0][0].MA_Vorname; 
            } else { vorname = req.body.vorname; }
            if (req.body.email == "" || !req.body.email) {
                email = result[0][0].MA_EMail_Adresse;
            } else {
                changedEmail = true;
                if (req.body.email != useremail) {
                    var { exists } = await checkIfEmailExists(req.body.email);
                    if (exists) {
                        output.status = false;
                        output.msg = "Diese Email wird bereits verwendet!";
                        console.log(output);
                        res.json(output);
                        return;
                    }
                } else {
                    changedEmail = false;
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
                    "UPDATE Mitarbeiter SET MA_Name = ?, MA_Vorname = ?, MA_Passwort = ?, MA_EMail_Adresse = ? WHERE MA_EMail_Adresse = ?;",
                    [name, vorname, passwort, email, useremail] 
                );
                output.status = true;
                output.msg = "Informationen geändert.";
                if (output.details == 0) {
                    output.status = true;
                    output.msg = "Es wurden keine Informationen geändert. Möglicherweise stimmen die Daten überein oder Sie haben zuvor Ihre Email geändert. Bitte loggen Sie sich neu ein.";
                }
            } catch (err) {
                console.log(err);
                output.status = false;
                output.msg = "Informationen konnten nicht verändert werden!";
                changedEmail = false;
            }
        }
        else if (rolle == "kunde") {
            var result = await sql_con
            .promise()
            .query(
            "SELECT * FROM Kunde WHERE K_EMail_Adresse = (?);",
            [useremail]
            );
            var vorname;
            var name; 
            var email;
            var passwort;
            
            if (req.body.name == "" || !req.body.name) {
                name = result[0][0].K_Name;
            } else { name = req.body.name; }
            if (req.body.vorname == "" || !req.body.vorname) {
                vorname = result[0][0].K_Vorname; 
            } else { vorname = req.body.vorname; }
            if (req.body.email == "" || !req.body.email) {
                email = result[0][0].K_EMail_Adresse;
            } else {
                changedEmail = true;
                if (req.body.email != useremail) {
                    var { exists } = await checkIfEmailExists(req.body.email);
                    if (exists) {
                        output.status = false;
                        output.msg = "Diese Email wird bereits verwendet!";
                        console.log(output);
                        res.json(output);
                        return;
                    }
                } else {
                    changedEmail = false;
                }
                email = req.body.email;
            }
            if (req.body.passwort == "" || !req.body.passwort) {
                passwort = result[0][0].K_Passwort;
            } else {
                passwort = await hashPassword(req.body.passwort);
            }
            try {
                result = await sql_con
                .promise()
                .query(
                    "UPDATE Kunde SET K_Name = ?, K_Vorname = ?, K_Passwort = ?, K_EMail_Adresse = ? WHERE K_EMail_Adresse = ?;",
                    [name, vorname, passwort, email, useremail] 
                );
                output.details = result[0].affectedRows
                output.status = true;
                output.msg = "Informationen geändert.";
                if (output.details == 0) {
                    output.status = true;
                    output.msg = "Es wurden keine Informationen geändert. Möglicherweise stimmen die Daten überein oder Sie haben zuvor Ihre Email geändert. Bitte loggen Sie sich neu ein.";
                }
            } catch (err) {
                console.log(err);
                output.status = false;
                output.msg = "Informationen können nicht verändert werden!";
                changedEmail = false;
            }
        }
        else if (rolle == "admin") {
            var result = await sql_con
            .promise()
            .query(
            "SELECT * FROM Administrator WHERE A_EMail_Adresse = (?);",
            [useremail]
            );
            var vorname;
            var name; 
            var email;
            var passwort;
            
            if (req.body.name == "" || !req.body.name) {
                name = result[0][0].A_Name;
            } else { name = req.body.name; }
            if (req.body.vorname == "" || !req.body.vorname) {
                vorname = result[0][0].A_Vorname; 
            } else { vorname = req.body.vorname; }
            if (req.body.email == "" || !req.body.email) {
                email = result[0][0].A_EMail_Adresse;
            } else {
                changedEmail = true;
                if (req.body.email != useremail) {
                    var { exists } = await checkIfEmailExists(req.body.email);
                    if (exists) {
                        output.status = false;
                        output.msg = "Diese Email wird bereits verwendet!";
                        console.log(output);
                        res.json(output);
                        return;
                    }
                } else {
                    changedEmail = false;
                }
                email = req.body.email;
            }
            if (req.body.passwort == "" || !req.body.passwort) {
                //PW bleibt
                passwort = result[0][0].A_Passwort;
            } else {
                passwort = await hashPassword(req.body.passwort);
            }
            try {
                result = await sql_con
                .promise()
                .query(
                    "UPDATE Administrator SET A_Name = ?, A_Vorname = ?, A_Passwort = ?, A_EMail_Adresse = ? WHERE A_EMail_Adresse = ?;",
                    [name, vorname, passwort, email, useremail] 
                );
                output.status = true;
                output.msg = "Informationen geändert";
                if (output.details == 0) {
                    output.status = true;
                    output.msg = "Es wurden keine Informationen geändert. Möglicherweise stimmen die Daten überein oder Sie haben zuvor Ihre Email geändert. Bitte loggen Sie sich neu ein.";
                }
            } catch (err) {
                console.log(err);
                output.status = false;
                output.msg = "Informationen konnten nicht verändert werden!";
                changedEmail = false;
            }
        }
        else if (rolle == "haendler") {        
            var result = await sql_con.promise().query(
            "SELECT * FROM Mitarbeiter WHERE MA_EMail_Adresse = (?);",[useremail]
            );
            var vorname;
            var name; 
            var email;
            var passwort;
            
            if (req.body.data.name == "" || !req.body.data.name) {
                name = result[0][0].MA_Name;
            } else { name = req.body.data.name; }
            if (req.body.data.vorname == "" || !req.body.data.vorname) {
                vorname = result[0][0].MA_Vorname; 
            } else { vorname = req.body.data.vorname; }
            if (req.body.data.email == "" || !req.body.data.email) {
                email = result[0][0].MA_EMail_Adresse;
            } else {
                changedEmail = true;
                if (req.body.data.email != useremail) {
                    var { exists } = await checkIfEmailExists(req.body.data.email);
                    if (exists) {
                        output.status = false;
                        output.msg = "Diese Email wird bereits verwendet!";
                        console.log(output);
                        res.json(output);
                        return;
                    }
                } else {
                    changedEmail = false;
                }
                email = req.body.data.email;
            }
            if (req.body.data.passwort == "" || !req.body.data.passwort) {
                passwort = result[0][0].MA_Passwort;
            } else {
                passwort = await hashPassword(req.body.data.passwort);
            }
            try {
                const updateResult = await sql_con.promise().query(
                    "UPDATE Mitarbeiter SET MA_Name = ?, MA_Vorname = ?, MA_Passwort = ?, MA_EMail_Adresse = ? WHERE MA_EMail_Adresse = ?;",
                    [name, vorname, passwort, email, useremail] 
                );

                
                output.status = true;
                output.msg = "Händler und Shop Informationen geändert.";
            } catch (err) {
                console.log(err);
                output.status = false;
                output.msg = "Informationen konnten nicht verändert werden!";
                changedEmail = false;
            }

            const resultShop = await sql_con
            .promise()
            .query(
                "SELECT * FROM Shop WHERE MitarbeiterID = ?", 
                [result[0][0].MitarbeiterID] 
            );   

            var shopname
            var straße
            var postleitzahl
            var ortschaft
            var land
            var telefonnummer
            var shopemail
            var umsatzsteuerid
            var shopkategorie
            var oeffnungszeiten

            if (req.body.data.shopname == "" || !req.body.data.shopname) {
                shopname = resultShop[0][0].S_Name;
            } else { shopname = req.body.data.shopname; }
            if (req.body.data.straße == "" || !req.body.data.straße) {
                straße = resultShop[0][0].Straße;
            } else { straße = req.body.data.straße; }
            if (req.body.data.postleitzahl == "" || !req.body.data.postleitzahl) {
                postleitzahl = resultShop[0][0].Postleitzahl;
            } else { postleitzahl = req.body.data.postleitzahl; }
            if (req.body.data.ortschaft == "" || !req.body.data.ortschaft) {
                ortschaft = resultShop[0][0].Ortschaft;
            } else { ortschaft = req.body.data.ortschaft; }
            if (req.body.data.land == "" || !req.body.data.land) {
                land = resultShop[0][0].Land;
            } else { land = req.body.data.land; }
            if (req.body.data.telefonnummer == "" || !req.body.data.telefonnummer) {
                telefonnummer = resultShop[0][0].Telefonnummer;
            } else { telefonnummer = req.body.data.telefonnummer; }
            if (req.body.data.shopemail == "" || !req.body.data.shopemail) {
                shopemail = resultShop[0][0].S_EMail_Adresse;
            } else { shopemail = req.body.data.shopemail; }
            if (req.body.data.umsatzsteuerid == "" || !req.body.data.umsatzsteuerid) {
                umsatzsteuerid = resultShop[0][0].Umsatzsteueridentifikationsnummer;
            } else { umsatzsteuerid = req.body.data.umsatzsteuerid; }

            try {
                try {
                    for (var i = 0; i < 7; i++) {
                        if (req.body.time[i].endTime && req.body.time[i].endTime) {
                            console.log(req.body.time[i].endTime)
                            const updateTime = await sql_con.promise().query(
                                "UPDATE Oeffnungszeiten SET Von = ?, Bis = ? WHERE ShopID = ? AND O_Tag = ?;",
                                [req.body.time[i].startTime, req.body.time[i].endTime, resultShop[0][0].ShopID, req.body.time[i].day]);
                            if (updateTime[0].affectedRows == 0) {
                                // Findet man den Eintrag nicht, war der Laden zu. In dem Fall muss man inserten
                                await sql_con.promise().query(
                                    "INSERT INTO Oeffnungszeiten (Von, Bis, ShopID, O_Tag) VALUES (?, ?, ?, ?);",
                                    [req.body.time[i].startTime, req.body.time[i].endTime, resultShop[0][0].ShopID, req.body.time[i].day]);    
                            }
                        } else {
                            // Sind die Zeiten leer wird der laden geschloßen
                            const updateTime = await sql_con.promise().query(
                                "DELETE FROM Oeffnungszeiten WHERE ShopID = ? AND O_Tag = ?;",
                                [resultShop[0][0].ShopID, req.body.time[i].day]);
                        }
                    } 
                } catch (err) {
                    //Keine Zeitdaten übergeben
                }

                const result2 = await sql_con.promise().query(
                    "UPDATE Shop SET S_Name = ?, Straße = ?, Postleitzahl = ?, Ortschaft = ?, Land = ?, Telefonnummer = ?, S_EMail_Adresse = ?, Umsatzsteueridentifikationsnummer = ? WHERE ShopID = ?;",
                    [
                        shopname,
                        straße,
                        postleitzahl,
                        ortschaft,
                        land,
                        telefonnummer,
                        shopemail,
                        umsatzsteuerid,
                        resultShop[0][0].ShopID
                    ]
                );
                output.status = true;
                output.msg += "Shop Informationen geändert.";
            } catch(err) {
                console.log(err)
                output.status = false;
                output.msg = "Informationen konnten nicht geändert werden!";
                return;
            }
        }
    } finally {
        if (changedEmail) {
            output.msg += "Da Sie Ihre Email geändert haben, müssen Sie sich neu einloggen.";
        }
    }
    console.log(output);
    res.json(output);
}

