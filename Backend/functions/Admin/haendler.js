import { sql_con } from "../../db/db-config.js";
import { checkifShopkategorieexists } from "./admin-utils.js"


// Gibt alle Händleraccounts zurück
export const haendlerEinsehen = async (req, res, email) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    var nurAusstehend = false
    if (req.body.nurAusstehend == true) {
        nurAusstehend = true;
    }
    
    try {
        var result;

        if (nurAusstehend) { // Nur Shops anzeigen die den Status Ausstehend haben
            var [result] = await sql_con.promise().query(
                "SELECT * FROM Mitarbeiter JOIN Shop ON Mitarbeiter.MitarbeiterID = Shop.MitarbeiterID WHERE Mitarbeiter.istHaendler = 1 AND Shop.Status = 'Ausstehend';"); 
        } else {
            var [result] = await sql_con.promise().query(
                "SELECT * FROM Mitarbeiter WHERE istHaendler = 1;"); 
        }

        console.log(nurAusstehend)
        const count = result.length;

        for (var i = 0; i < count; i++) {  
            var [resultShop] = await sql_con.promise().query("SELECT * FROM Shop WHERE MitarbeiterID = (?);",
            [result[i].MitarbeiterID]); 

            const [resultShopKat] = await sql_con.promise().query("SELECT * FROM Shopkategorie WHERE S_KategorieID = (?)", 
            [resultShop[0].S_KategorieID]);
                        
            output.data[i] = {
                MitarbeiterID: result[i].MitarbeiterID, 
                Name: result[i].MA_Name,
                Vorname: result[i].MA_Vorname,
                ShopName: resultShop[0].S_Name,
                Kategorie: resultShopKat[0].S_Kategoriename,
                Status: resultShop[0].Status
            }
        }

        output.details = count;
        output.status = true;
        output.msg = "Händler ausgegeben.";
        if(count == 0) {
            output.msg = "Keine Händler.";
        }
    } catch (err) {
        console.log(err);
        output.status = true;
        output.msg = "Händler konnten nicht ausgegeben werden!";
    }

    console.log(output);
    res.json(output);
}

export const haendlerShopKategorieFestlegen = async (req, res, email) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    // Wenn der Status keiner der drei Ausprägungen entspricht
    if (!req.body.Kategoriename || req.body.Kategoriename == "") {
        output.status = false;
        output.msg = "Bitte Kategorie auswählen!";
        console.log(output);
        res.json(output);
        return
    }
     
    if (!req.body.MitarbeiterID || req.body.MitarbeiterID == "") {
        output.status = false;
        output.msg = "Keinen Shop ausgewählt!";
        console.log(output);
        res.json(output);
        return
    }

    const kID = await checkifShopkategorieexists(req.body.Kategoriename);
    console.log(kID);
    if (!kID) {
        output.status = false;
        output.msg = "Shopkategorie existiert nicht!";
        res.json(output);
        return;
    }

    try {
        var result = await sql_con.promise().query("UPDATE Shop SET S_KategorieID = (?) WHERE MitarbeiterID = ?;",
                [kID, req.body.MitarbeiterID]);

        output.status = true;
        output.msg = "Shopkategorie geändert.";
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Shopkategorie konnte nicht geändert werden!";
    }

    console.log(output);
    res.json(output);
}

export const haendlerStatusFestlegen = async (req, res, email) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    // Wenn der Status keiner der drei Ausprägungen entspricht
    if (req.body.Status !== "Ausstehend" && req.body.Status !== "Freigegeben" && req.body.Status !== "Gesperrt") {
        output.status = false;
        output.msg = "Der Status kann nur 'Ausstehend', 'Freigegeben' oder 'Gesperrt' sein!";
        console.log(output);
        res.json(output);
        return
    }
     
    if (!req.body.MitarbeiterID || req.body.MitarbeiterID == "") {
        output.status = false;
        output.msg = "Keinen Shop ausgewählt!";
        console.log(output);
        res.json(output);
        return
    }


    try {
        var [result] = await sql_con
        .promise()
        .query(
            "SELECT * FROM Mitarbeiter WHERE istHaendler = 1;",
        [req.body.name]
        ); 

        const count = result.length;

        for (var i = 0; i < count; i++) {
            result = await sql_con
            .promise()
            .query(
                "UPDATE Shop SET Status = ? WHERE MitarbeiterID = ?;",
                [req.body.Status, req.body.MitarbeiterID] 
            );
        }

        output.status = true;
        output.msg = "Status geändert.";
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Status konnte nicht geändert werden!";
    }

    console.log(output);
    res.json(output);
}