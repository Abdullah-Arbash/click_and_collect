import { sql_con } from "../../db/db-config.js";
import { getMiDbyEmail, checkifProduktkategorieexists } from "../Händler/haendler-utils.js";
import { getHomeShopByMid, checkifProduktExists } from "./mitarbeiter-utils.js";
import { log_message } from "../Admin/log.js";
import { getShopKategorieNameByID, getOpeningTimesInJSON } from "../../utils/shop-utils.js";



export const produktAnlegen = async (req, res, email) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 
    var mID;
    var sID;

    if (!req.body.data.P_Name  ||
        !req.body.data.Preis || 
        !req.body.data.Stückzahl || 
        !req.body.data.Beschreibung || 
        !req.body.data.Kategoriename ||
        !req.body.data.Marke || 
        !req.body.data.Umsatzsteuer || 
        !req.body.data.Material) {
        output.status = false;  
        output.msg = "Nicht alle Felder ausgefüllt!";
    } else {
        //Shop ID herausfinden & Berechtigung prüfen
        var mID = await getMiDbyEmail(email);
        if (!mID) { //Dieser Fehler sollte nie auftreten
            output.status = false;
            output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu Einloggen!";
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

        const P_KategorieID = await checkifProduktkategorieexists(req.body.data.Kategoriename, sID);
        if (!P_KategorieID) {
            output.status = false;
            output.msg = "Unbekannte Produktkategorie!";
            res.json(output);
            return
        }

        const exists = await checkifProduktExists(req.body.data.P_Name, sID);
        if (exists) {
            output.status = false;
            output.msg = "Gegebenes Produkt existiert bereits!";
            res.json(output);
            return
        }

        try {
            var note = "";

            var result = await sql_con.promise().query(
                "INSERT INTO Produkt (MitarbeiterID, ShopID, P_Name, P_KategorieID, Preis, Marke, Material, Umsatzsteuer, Stückzahl, Beschreibung, Base64) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
            [mID, sID, req.body.data.P_Name, P_KategorieID, req.body.data.Preis, req.body.data.Marke, req.body.data.Material, req.body.data.Umsatzsteuer, req.body.data.Stückzahl, req.body.data.Beschreibung, req.body.data.Bild]); 

            output.status = true;
            output.msg = "Produkt angelegt. "+note;
            log_message("Produkt angelegt mit der ID: "+result[0].insertId, email, "Kein Fehler", "produktAnlegen")
        } catch (err) {
            console.log(err);
            output.status = false;  
            output.msg = "Produkt konnte nicht hinzufgefügt werden!";
            console.log(output);
            res.json(output);
            log_message("Produkt konnte nicht angelegt werden: "+err, email, "System Fehler", "produktAnlegen")
            return
        }
    }
    console.log(output);
    res.json(output);
}

export const produktBearbeiten = async (req, res, email) => {   
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 
    var mID;
    var sID;

    if (!req.body.ID) {
        output.status = false;
        output.msg = "Fehlende Produkt ID!";
        res.json(output);
        return
    }

    if (!req.body.name  &&
        !req.body.preis &&
        !req.body.menge &&
        !req.body.beschreibung &&   
        !req.body.kategoriename &&
        !req.body.marke &&
        !req.body.steuer && 
        !req.body.material) {
        output.status = false;
        output.msg = "Keine Änderung zum vornehmen!";
    } else {
        //Shop ID herausfinden & Berechtigung prüfen
        var mID = await getMiDbyEmail(email);
        if (!mID) { //Dieser Fehler sollte nie auftreten
            output.status = false;
            output.msg = "Mitarbeiter konnte nicht gefunden werden!";
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
            var result = await sql_con
            .promise()
            .query(
            "SELECT * FROM Produkt WHERE ProduktID = (?);",
            [req.body.ID]
            );
            var P_Name; 
            var Preis;
            var Marke;
            var Material;
            var Umsatzsteuer; 
            var Stückzahl;
            var Beschreibung;
            var P_KategorieID;


            if (req.body.name == "" || !req.body.name) {
                //Der Name bleibt
                P_Name = result[0][0].P_Name;

            } else { 
                P_Name = req.body.name; 
                if (req.body.name != result[0][0].P_Name) {
                    const exists = await checkifProduktExists(req.body.name, sID);
                    if (exists) {
                        output.status = false;
                        output.msg = "Gegebenes Produkt existiert bereits!";
                        res.json(output);
                        return
                    }
                }
            }
            if (req.body.preis == "" || !req.body.preis) {
                Preis = result[0][0].Preis;
            } else { Preis = req.body.preis; }
            if (req.body.marke == "" || !req.body.marke) {
                Marke = result[0][0].Marke;
            } else { Marke = req.body.marke; }
            if (req.body.material == "" || !req.body.material) {
                Material = result[0][0].Material;
            } else { Material = req.body.material; }
            if (req.body.steuer == "" || !req.body.steuer) {
                Umsatzsteuer = result[0][0].Umsatzsteuer;
            } else { Umsatzsteuer = req.body.steuer; }
            if (req.body.menge == "" || !req.body.menge) {
                Stückzahl = result[0][0].Stückzahl;
            } else { Stückzahl = req.body.menge; }
            if (req.body.beschreibung == "" || !req.body.beschreibung) {
                Beschreibung = result[0][0].Beschreibung;
            } else { Beschreibung = req.body.beschreibung; }
            if (req.body.kategoriename == "" || !req.body.kategoriename) {
                P_KategorieID = result[0][0].P_KategorieID;
            } else { 
                P_KategorieID = await checkifProduktkategorieexists(req.body.kategoriename, sID);
                if (!P_KategorieID) {
                    output.status = false;
                    output.msg = "Unbekannte Produktkategorie!";
                    res.json(output);
                    return
                }
            }
        } catch {
            output.status = false;
            output.msg = "Produkt mit der ID existiert nicht!";
            res.json(output);
            return
        }

        try {
            var result = await sql_con
            .promise()
            .query(
                "UPDATE Produkt SET P_Name = ?, P_KategorieID = ?, Preis = ?, Marke = ?, Material = ?, Umsatzsteuer = ?, Stückzahl = ?, Beschreibung = ? WHERE ProduktID = ?;",
            [P_Name, P_KategorieID, Preis, Marke, Material, Umsatzsteuer, Stückzahl, Beschreibung, req.body.ID]
            );
            output.status = true;
            output.msg = "Produkt verändert.";
        } catch (err) {
            console.log(err);
            output.status = false;
            output.msg = "Produkt konnte nicht verändert werden!";
            console.log(output);
            res.json(output);
            return
        }
    }
    console.log(output);
    res.json(output);
}

export const produktLoeschen = async (req, res, email) => {   
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 
    var mID;
    var sID;

    if (!req.body.ID) {
        output.status = false;
        output.msg = "Fehlende Produkt ID!";
        res.json(output);
        return
    }

    //Shop ID herausfinden & Berechtigung prüfen
    var mID = await getMiDbyEmail(email);
    if (!mID) { //Dieser Fehler sollte nie auftreten
        output.status = false;
        output.msg = "Mitarbeiter konnte nicht gefunden werden!";
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
        var result = await sql_con.promise().query("DELETE FROM Produkt WHERE ProduktID = (?);",
        [req.body.ID]);

        output.status = false;
        output.msg = "Produkt permanent gelöscht.";
    } catch(err) {
        var result = await sql_con.promise().query("UPDATE Produkt SET Entfernt = 1 WHERE ProduktID = (?);",[req.body.ID]);
        console.log(err);
        output.status = true;
        output.msg = "Produkt konnte nicht permanent gelöscht werden, da dieses Produkt bereits bestellt wurde. Es wird allerdings aus dem Sortiment genommen.";
    } finally {
        log_message("Produkt mit der ID: "+req.body.ID+" aus dem Sortiment genommen", email, "Kein Fehler", "produktLoeschen")
    }
    console.log(output);
    res.json(output);
}

export const produktkategorieneinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: []
    }; 

    var mID = await getMiDbyEmail(userEmail);
    console.log(mID);
    if (!mID) {
        output.status = false;
        output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu Einloggen!";
        console.log(output);
        res.json(output);
        return
    }

    var sID = await getHomeShopByMid(mID);
    if (!sID) {
        output.status = false;
        output.msg = "Zu keinem Shop zugehörig!";
        console.log(output);
        res.json(output);
        return
    }

    try {   
        const [result] = await sql_con
        .promise()
        .query(
            "SELECT * FROM Produktkategorie WHERE ShopID = ? AND Entfernt = 0", 
            [sID] 
        );
        
        var count = result.length;
        for (var i = 0; i < count; i++) {
            output.data[i] = {
                P_KategorieID: result[i].P_KategorieID, 
                MitarbeiterID: result[i].MitarbeiterID,
                ShopID: result[i].ShopID,
                P_Kategoriename: result[i].P_Kategoriename
            }
        }

        output.status = true;
        output.msg = "Alle Produktkategorien ausgegeben!";
        output.details = count;
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Keine Produktkategorien!";
    }
    console.log(output);
    res.json(output);
}

export const produkteeinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: []
    }; 

    var mID = await getMiDbyEmail(userEmail);
    console.log(mID);
    if (!mID) {
        output.status = false;
        output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu Einloggen!";
        console.log(output);
        res.json(output);
        return
    }

    var sID = await getHomeShopByMid(mID);
    if (!sID) {
        output.status = false;
        output.msg = "Zu keinem Shop zugehörig!";
        console.log(output);
        res.json(output);
        return
    }

    try {   
        var result;
        if (!req.body.p_KategorieID) {
            [result] = await sql_con
            .promise()
            .query(
                "SELECT * FROM Produkt WHERE ShopID = ? AND Entfernt = 0", 
                [sID] 
            );
        } else {
            [result] = await sql_con
            .promise()
            .query(
                "SELECT * FROM Produkt WHERE ShopID = ? AND P_KategorieID = ? AND Entfernt = 0", 
                [sID, req.body.p_KategorieID] 
            ); 
        }
        
        var count = result.length;
        for (var i = 0; i < count; i++) {
            // Nimmt das Bild und wandelt es in ein base64 String um.
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
                Stückzahl: result[i].Stückzahl,
                Beschreibung: result[i].Beschreibung,
                Bild: base64
            }
        }

        output.status = true;
        output.msg = "Alle Produkte ausgegeben.";
        output.details = count;
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Fehler!";
    }
    //console.log(output);
    res.json(output);    
}

export const produktsuche = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: []
    }; 

    var mID = await getMiDbyEmail(userEmail);
    console.log(mID);
    if (!mID) {
        output.status = false;
        output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu Einloggen!";
        console.log(output);
        res.json(output);
        return
    }

    var sID = await getHomeShopByMid(mID);
    if (!sID) {
        output.status = false;
        output.msg = "Zu keinem Shop zugehörig!";
        console.log(output);
        res.json(output);
        return
    }


    if (!req.body.suchfeld || req.body.suchfeld == "") { 
        output.status = false;
        output.msg = "Bitte etwas eingeben!";
        console.log(output);
        res.json(output);
        return
    }

    try {   
        try {
            const [result] = await sql_con
            .promise()
            .query(
                "SELECT * FROM Produkt WHERE ShopID = ? AND sys.levenshtein(P_Name, ?) <= 2 AND Entfernt = 0", 
                [sID, req.body.suchfeld] 
            );
        
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
                    Stückzahl: result[i].Stückzahl,
                    Beschreibung: result[i].Beschreibung,
                    Bild: base64
                }    
            }

            output.status = true;
            output.msg = "Suchergebnisse für '"+req.body.suchfeld+"'. "+count+" Ergebniss(e).";
            output.details = count;
            if (count == 0) {
                output.status = false;
                output.msg = "Die Produktsuche '"+req.body.suchfeld+"' ergab leider keine Treffer!";
            }
        } catch (err) {
            console.log(err);
            output.status = false;
            output.msg = "Es ist ein Fehler aufgetreten!";
            console.log(output);
            res.json(output);
            return 
        }   
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Fehler!";
    }
    console.log(output);
    res.json(output);    
}

export const shopInfos = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    var mID = await getMiDbyEmail(userEmail);
    if (!mID) { //Dieser Fehler sollte nie auftreten
        output.status = false;
        output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu Einloggen!";
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
        const resultShop = await sql_con
        .promise()
        .query(
            "SELECT * FROM Shop WHERE ShopID = (?);", 
            [sID]
        ); 
        
        var openingTimes = await getOpeningTimesInJSON(resultShop[0][0].ShopID);
        const kategoriename = await getShopKategorieNameByID(resultShop[0][0].S_KategorieID);

        output.details = {
            ShopID: resultShop[0][0].ShopID,
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

        output.status = true;
        output.msg = "Shop ausgegeben.";
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Ungültige ShopID!";
    }
    console.log(output);
    res.json(output);    
}