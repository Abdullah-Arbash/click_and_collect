//Mitarbeiter kann offene Auträge sehen
import { sql_con } from "../../db/db-config.js";
import { getMiDbyEmail } from "../Händler/haendler-utils.js";
import { getHomeShopByMid, getTotalPriceOfOrder, getEmailFromAuftragID } from "./mitarbeiter-utils.js";
import { produktBestandAendern } from "../Kunde/kunde-utils.js";
import { sendEMail } from "../../utils/email-util.js"
import { log_message } from "../Admin/log.js"


// Gibt automatisch nur offene Aufträge zurück
export const aufträgeEinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    var mID = await getMiDbyEmail(userEmail);
    if (!mID) {
        output.status = false;
        output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    var sID = await getHomeShopByMid(mID);
    if (!sID) {
        output.status = false;
        output.msg = "Mitarbeiter arbeitet für keinen Shop!";
        console.log(output);
        res.json(output);
        return
    }

    try { 
        var result;
        if (req.body.tagesaktuell == true) { // Nur tagesaktuelle Einträge
            const date = new Date();
            date.setMonth(date.getMonth()+1); //Macht den Index weg
            
            result = await sql_con.promise().query("SELECT * FROM Auftrag WHERE ShopID = (?) AND Zustand = (?) AND DATE(A_Datum) = (?);",
            [sID, "Offen", date]);
        } else { //Alle Einträge
            result = await sql_con.promise().query("SELECT * FROM Auftrag WHERE ShopID = (?) AND Zustand = (?);",
            [sID, "Offen"]);
        }

        var count = result[0].length;

        for (var i = 0; i < count; i++) {
            //Braucht auch den Gesamtpreis damit der den Kauf vor Ort abschließen kann
            const totalPrice = await getTotalPriceOfOrder(result[0][i].AuftragID);

            //Dies ist notwending um auf die deutsche Zeitzone umzurechnen
            let date = new Date(result[0][i].A_Datum); 
            date.setUTCHours(date.getUTCHours() + 1);

            const resultCustomer = await sql_con.promise().query("SELECT * FROM Kunde WHERE KundenID = (?)",
            [result[0][i].KundenID]);

            output.data[i] = {
                AuftragID:  result[0][i].AuftragID,
                KundenID:  result[0][i].KundenID,
                Name: resultCustomer[0][0].K_Name,
                Vorname: resultCustomer[0][0].K_Vorname,
                Email: resultCustomer[0][0].K_EMail_Adresse,
                MitarbeiterID:  result[0][i].MitarbeiterID,
                Zustand:  result[0][i].Zustand,
                istBezahlt:  result[0][i].istBezahlt,
                Datum:  date.toString(),
                Slot:  result[0][i].A_Slot,
                Tag:  result[0][i].A_Tag,
                ShopID:  result[0][i].ShopID,
                Gesamtkosten: totalPrice
            }
        }
        output.status = true;
        output.msg = "Aufträge zurückgegeben.";
        output.details = count;

        if (count == 0) {
            output.status = true;
            output.msg = "Keine offenen Aufträge vorhanden.";
        }
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Fehler!";
        log_message("Aufträge konnten nicht eingesehen werden. Err: "+err, userEmail, "Systemfehler", "aufträgeEinsehen (Kunde)")
    }
    console.log(output);
    res.json(output);    
}

//Hier bleiben die Produkte entfernt. Bei Erfolg wird eine E-Mail versendet
export const auftragAbschließen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    if (!req.body.auftragID || req.body.auftragID == "") {
        output.status = false;
        output.msg = "Bitte AuftragID auswählen!";
        console.log(output);
        res.json(output);
        return
    }

    var mID = await getMiDbyEmail(userEmail);
    if (!mID) {
        output.status = false;
        output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    var sID = await getHomeShopByMid(mID);
    if (!sID) {
        output.status = false;
        output.msg = "Mitarbeiter arbeitet für keinen Shop!";
        console.log(output);
        res.json(output);
        return
    }

    try {
    const result = await sql_con.promise().query("UPDATE Auftrag SET Zustand = 'Abgeschlossen', istBezahlt = 1, MitarbeiterID = ? WHERE AuftragID = (?) AND Zustand = 'Offen' AND ShopID = (?);",
        [mID, req.body.auftragID, sID]);
        
        if (result[0].affectedRows != 0) {     
            // Finden Die Kunden Email heraus
            var kundenMail = await getEmailFromAuftragID(req.body.auftragID);

            // Sendet eine Bestätigungsmail an den Kunden.
            sendEMail(kundenMail, "Ihre Bestellung wurde abgeschloßen.", "Ihre Bestellung mit der Abholnummer "+req.body.auftragID+" wurde abgeschloßen. Sie finden die Bestellung nun unter den Rechnungen.");
            output.msg = "Auftrag als abgeschloßen markiert. Der Kunde hat eine E-Mail erhalten."
            output.status = true;
            log_message("Auftrag abgeschloßen mit der AuftragsID: "+req.body.auftragID, userEmail, "Kein Fehler", "auftragAbschließen")
        } else {
            output.status = false;
            output.msg = "Auftrag ist bereits abgeschlossen, storniert oder die AuftragID ist für den Shop unbekannt!";
        }
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Fehler!";
    }
    console.log(output);
    res.json(output);    
}

//Hier werden die Produkte wieder hinzugefügt. Bei Erfolg wird eine E-Mail versendet
export const auftragStornieren = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    if (!req.body.auftragID || req.body.auftragID == "") {
        output.status = false;
        output.msg = "Bitte AuftragID auswählen!";
        console.log(output);
        res.json(output);
        return
    }

    var mID = await getMiDbyEmail(userEmail);
    if (!mID) {
        output.status = false;
        output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    var sID = await getHomeShopByMid(mID);
    if (!sID) {
        output.status = false;
        output.msg = "Mitarbeiter arbeitet für keinen Shop!";
        console.log(output);
        res.json(output);
        return
    }

    try {
        const result = await sql_con.promise().query("UPDATE Auftrag SET Zustand = 'Storniert', istBezahlt = 0, MitarbeiterID = (?) WHERE AuftragID = (?) AND Zustand = 'Offen' AND ShopID = (?);",
        [mID, req.body.auftragID, sID]);    

        if (result[0].affectedRows != 0) {
            //Inhalte zurücksetzten
            var resultDetails = await sql_con.promise().query(
                "SELECT Auftragsdetails.Bestellmenge, Auftragsdetails.ProduktID FROM Auftragsdetails WHERE AuftragID = (?);",
                [req.body.auftragID]); 
            var count = resultDetails[0].length;

            for (var i = 0; i < count; i++) {
                await produktBestandAendern(resultDetails[0][i].ProduktID, resultDetails[0][i].Bestellmenge)
            }

            // Finden Die Kunden Email heraus
            var kundenMail = await getEmailFromAuftragID(req.body.auftragID);

            // Sendet eine Bestätigungsmail an den Kunden.
            sendEMail(kundenMail, "Ihre Bestellung wurde storniert.", "Ihre Bestellung mit der Abholnummer "+req.body.auftragID+" wurde storniert.");
            output.msg = "Auftrag als storniert markiert. Die Mengen wurden wieder zurückgesetzt. Der Kunde hat eine E-Mail erhalten."
            output.status = true;
            log_message("Auftrag storniert mit der AuftragsID: "+req.body.auftragID, userEmail, "Kein Fehler", "auftragStornieren")

        } else {
            output.status = false;
            output.msg = "Auftrag ist bereits abgeschlossen, storniert oder die AuftragID ist für den Shop unbekannt!";
        }
        //Die Inhalte werden aus den Bestelldetails nicht gelöscht! Dies ist dafür das dass man nachvollziehen kann was man bestellen wollte
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Fehler!";
    }
    console.log(output);
    res.json(output);    
}

export const auftragNachID = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    if (!req.body.auftragID || req.body.auftragID == "") {
        output.status = false;
        output.msg = "Bitte AuftragID auswählen!";
        console.log(output);
        res.json(output);
        return
    }

    var mID = await getMiDbyEmail(userEmail);
    if (!mID) {
        output.status = false;
        output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    var sID = await getHomeShopByMid(mID);
    if (!sID) {
        output.status = false;
        output.msg = "Mitarbeiter arbeitet für keinen Shop!";
        console.log(output);
        res.json(output);
        return
    }

    try {

        const result = await sql_con.promise().query("SELECT * FROM Auftrag WHERE AuftragID = (?);",
        [req.body.auftragID]);        

        const totalPrice = await getTotalPriceOfOrder(result[0][0].AuftragID);

        //Dies ist notwending um auf die deutsche Zeitzone umzurechnen
        let date = new Date(result[0][0].A_Datum); 
        date.setUTCHours(date.getUTCHours() + 1);

        const resultCustomer = await sql_con.promise().query("SELECT * FROM Kunde WHERE KundenID = (?)",
        [result[0][0].KundenID]);

        output.details = {
            AuftragID:  result[0][0].AuftragID,
            KundenID:  result[0][0].KundenID,
            Name: resultCustomer[0][0].K_Name,
            Vorname: resultCustomer[0][0].K_Vorname,
            Email: resultCustomer[0][0].K_EMail_Adresse,
            MitarbeiterID:  result[0][0].MitarbeiterID,
            Zustand:  result[0][0].Zustand,
            istBezahlt:  result[0][0].istBezahlt,
            Datum:  date.toString(),
            Slot:  result[0][0].A_Slot,
            Tag:  result[0][0].A_Tag,
            ShopID:  result[0][0].ShopID,
            Gesamtkosten: totalPrice
        }

        //Produkte und Informationen über Produkte
        try {   
            const [result] = await sql_con
            .promise()
            .query(
                "SELECT * FROM Auftragsdetails b JOIN Produkt p ON b.ProduktID = p.ProduktID WHERE AuftragID = ?", 
                [req.body.auftragID]);
    
            var count = result.length;
            for (var i = 0; i < count; i++) {
                var base64 = result[i].Base64;
                output.data[i] = {
                    ProduktID: result[i].ProduktID, 
                    P_KategorieID: result[i].P_KategorieID,
                    ShopID: result[i].ShopID,
                    P_Name: result[i].P_Name,
                    Preis: result[i].Preis,
                    Marke: result[i].Marke,
                    Material: result[i].Material,
                    Umsatzsteuer: result[i].Umsatzsteuer,
                    Beschreibung: result[i].Beschreibung,
                    Bestellmenge: result[i].Bestellmenge,
                    Bild: base64
                }
            }
        } catch (err) {
            console.log(err);
            log_message("Auftrag mit der ID: "+req.body.auftragID+" kann nicht eingesehen werden uns ist korrupt, da er wahrscheinlich leer ist: "+err, userEmail, "System Fehler", "auftragNachID")
        }
        

        output.msg = "Auftrag zurückgegeben!"
        output.status = true;
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Auftrag nicht gefunden!";
    }
    console.log(output);
    res.json(output);    
}

export const aufträgeSortieren = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    if (!req.body.sortierKriterium || req.body.sortierKriterium != "Abholnummer" || req.body.sortierKriterium != "") { 

    }


    var mID = await getMiDbyEmail(userEmail);
    if (!mID) {
        output.status = false;
        output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    var sID = await getHomeShopByMid(mID);
    if (!sID) {
        output.status = false;
        output.msg = "Mitarbeiter arbeitet für keinen Shop!";
        console.log(output);
        res.json(output);
        return
    }

    try { 
        var result;
        if (req.body.tagesaktuell == true) { // Nur tagesaktuelle Einträge
            const date = new Date();
            date.setMonth(date.getMonth()+1); //Macht den Index weg
            
            result = await sql_con.promise().query("SELECT * FROM Auftrag WHERE ShopID = (?) AND Zustand = (?) AND DATE(A_Datum) = (?);",
            [sID, "Offen", date]);
        } else { //Alle Einträge
            result = await sql_con.promise().query("SELECT * FROM Auftrag WHERE ShopID = (?) AND Zustand = (?);",
            [sID, "Offen"]);
        }

        var count = result[0].length;

        for (var i = 0; i < count; i++) {
            //Braucht auch den Gesamtpreis damit der den Kauf vor Ort abschließen kann
            const totalPrice = await getTotalPriceOfOrder(result[0][i].AuftragID);

            //Dies ist notwending um auf die deutsche Zeitzone umzurechnen
            let date = new Date(result[0][i].A_Datum); 
            date.setUTCHours(date.getUTCHours() + 1);

            const resultCustomer = await sql_con.promise().query("SELECT * FROM Kunde WHERE KundenID = (?)",
            [result[0][i].KundenID]);

            output.data[i] = {
                AuftragID:  result[0][i].AuftragID,
                KundenID:  result[0][i].KundenID,
                Name: resultCustomer[0][0].K_Name,
                Vorname: resultCustomer[0][0].K_Vorname,
                Email: resultCustomer[0][0].K_EMail_Adresse,
                MitarbeiterID:  result[0][i].MitarbeiterID,
                Zustand:  result[0][i].Zustand,
                istBezahlt:  result[0][i].istBezahlt,
                Datum:  date.toString(),
                Slot:  result[0][i].A_Slot,
                Tag:  result[0][i].A_Tag,
                ShopID:  result[0][i].ShopID,
                Gesamtkosten: totalPrice
            }
        }
        output.status = true;
        output.msg = "Aufträge zurückgegeben.";
        output.details = count;

        if (count == 0) {
            output.status = true;
            output.msg = "Keine offenen Aufträge vorhanden.";
        }
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Fehler!";
    }
    console.log(output);
    res.json(output);    
}