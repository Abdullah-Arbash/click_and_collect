import { sql_con } from "../../db/db-config.js";
import { getMiDbyEmail } from "./haendler-utils.js";
import { getHomeShopByMid, getTotalPriceOfOrder } from "../Mitarbeiter/mitarbeiter-utils.js";
import { log_message } from "../Admin/log.js"


//Händler kann alles sehen + paar sortierfunktionen
export const alleAufträgeEinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: []
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
            
            result = await sql_con.promise().query("SELECT * FROM Auftrag WHERE ShopID = (?) AND DATE(A_Datum) = (?);",
            [sID, date]);
        } else { //Alle Einträge
            result = await sql_con.promise().query("SELECT * FROM Auftrag WHERE ShopID = (?);",
            [sID]);
        }

        var count = result[0].length;

        for (var i = 0; i < count; i++) {
            const totalPrice = await getTotalPriceOfOrder(result[0][i].AuftragID);

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
                Datum:  date.toString(), //Vielleicht ändern
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
            output.msg = "Keine Aufträge vorhanden.";
        }
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Fehler!";
        log_message("Aufträge konnten nicht eingesehen werden. Err: "+err, userEmail, "Systemfehler", "aufträgeEinsehen (Händler)")
    }
    console.log(output);
    res.json(output);    
}