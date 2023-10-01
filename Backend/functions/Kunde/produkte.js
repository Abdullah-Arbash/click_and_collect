import { sql_con } from "../../db/db-config.js";
import { getKiDbyEmail, checkIfProduktInWunschliste } from "./kunde-utils.js";

export const produktInWunschliste = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    var kID = await getKiDbyEmail(userEmail);
    if (!kID) {
        output.status = false;
        output.msg = "Kunde konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    if (!req.body.produktID || req.body.produktID == "") { 
        output.status = false;
        output.msg = "Kein Produkt ausgewählt!";
        console.log(output);
        res.json(output);
        return
    } else {
        //Eine Abfrage ob das Produkt existert gibt es nicht da es mit dem Fehler gecatcht wird
        try {   
            const [result] = await sql_con
            .promise()
            .query(
                "INSERT INTO Wunschliste (KundenID, ProduktID) VALUES (?, ?)",
                [kID, req.body.produktID] 
            );

            output.status = true;
            output.msg = "Hinzugefügt.";
        } catch (err) {
            console.log(err);
            output.status = false;
            output.msg = "Produkt konnte nicht hinzugefügt werden. Möglicherweise ist es bereits in der Wunschliste!";
        }
    }
    console.log(output);
    res.json(output);    
}

export const produktEinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: []
    }; 

    if (!req.body.produktID || req.body.produktID == "") { 
        output.status = false;
        output.msg = "Kein Produkt ausgewählt!";
        console.log(output);
        res.json(output);
        return
    }

    var kID = await getKiDbyEmail(userEmail);
    if (!kID) {
        output.status = false;
        output.msg = "Kunde konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    try {   
        const [result] = await sql_con
        .promise()
        .query(
            "SELECT * FROM Shop s JOIN Produkt p ON s.ShopID = p.ShopID WHERE ProduktID = (?) AND p.Entfernt = 0", 
            [req.body.produktID]);

        console.log()
        
        const exists = await checkIfProduktInWunschliste(kID, result[0].ProduktID);
        var base64 = result[0].Base64;

        output.data = {
            ProduktID: result[0].ProduktID, 
            P_KategorieID: result[0].P_KategorieID,
            ShopID: result[0].ShopID,
            ShopName: result[0].S_Name,
            ShopEmail: result[0].S_EMail_Adresse,
            P_Name: result[0].P_Name,
            Preis: result[0].Preis,
            Marke: result[0].Marke,
            Material: result[0].Material,
            Umsatzsteuer: result[0].Umsatzsteuer,
            Stückzahl: result[0].Stückzahl,
            Beschreibung: result[0].Beschreibung,
            Bild: base64,
            inWunschliste: exists
        }

        output.status = true;
        output.msg = "Produkt zurückgegeben.";
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Produkt unbekannt!";
    }
    console.log(output);
    res.json(output);    
}

export const produktAusWunschliste = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    var kID = await getKiDbyEmail(userEmail);
    if (!kID) {
        output.status = false;
        output.msg = "Kunde konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    if (!req.body.produktID || req.body.produktID == "") { 
        output.status = false;
        output.msg = "Kein Produkt ausgewählt!";
        console.log(output);
        res.json(output);
        return
    } else {
        //Eine Abfrage ob das Produkt existert gibt es nicht da es mit dem Fehler gecatcht wird
        try {   
            const [result] = await sql_con
            .promise()
            .query(
                "DELETE FROM Wunschliste WHERE KundenID = ? AND ProduktID = ?;",
                [kID, req.body.produktID] 
            );

            output.status = true;
            output.msg = "Produkt aus der Wunschliste gelöscht.";
        } catch (err) {
            console.log(err);
            output.status = false;
            output.msg = "Produkt konnte nicht entfernt werden. Möglicherweise ist es bereits entfernt!";
        }
    }
    console.log(output);
    res.json(output);    
}

export const wunschlisteEinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: []
    }; 

    var kID = await getKiDbyEmail(userEmail);
    if (!kID) {
        output.status = false;
        output.msg = "Kunde konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    try {   
        const [result] = await sql_con
        .promise()
        .query(
            "SELECT * FROM Wunschliste w JOIN Produkt p ON w.ProduktID = p.ProduktID WHERE KundenID = ? AND p.Entfernt = 0", 
            [kID] 
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
        output.msg = "Alle Produkte ausgegeben.";
        output.details = count;
        if (count == 0) {
            output.msg = "Keine Produkte.";
        }
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Fehler beim ausgeben!";
    }
    console.log(output);
    res.json(output);    
}

export const suchfeld = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "Unbekannte Suchkategorie!",
        details: {},
        data: []
    }; 

    if (!req.body.suchfeld || req.body.suchfeld == "" || !req.body.suchkategorie) { 
        output.status = false;
        output.msg = "Bitte etwas eingeben und Suchkategorie auswählen!";
        console.log(output);
        res.json(output);
        return
    }

    var kID = await getKiDbyEmail(userEmail);
    if (!kID) {
        output.status = false;
        output.msg = "Kunde konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    try {   
        if (req.body.suchkategorie == "produkte" || req.body.suchkategorie == "Produkte") {
            try {
                // Gibt Produkte zurücke mit einer Levenshtein Distanz kleiner als 2. D.h. Produkte die sich im Namen relative ähnlich sind
                const [result] = await sql_con.promise().query(
                    "SELECT * FROM Produkt JOIN Shop ON Produkt.ShopID = Shop.ShopID WHERE sys.levenshtein(P_Name, ?) <= 2 AND Shop.Status = 'Freigegeben' AND Produkt.Entfernt = 0", 
                    [req.body.suchfeld]);
        
                var count = result.length;
                for (var i = 0; i < count; i++) {
                    const exists = await checkIfProduktInWunschliste(kID, result[i].ProduktID);
                    var base64 = result[i].Base64;
                    output.data[i] = {
                        ProduktID: result[i].ProduktID, 
                        P_KategorieID: result[i].P_KategorieID,
                        ShopID: result[i].ShopID,
                        ShopName: result[i].S_Name,
                        P_Name: result[i].P_Name,
                        Preis: result[i].Preis,
                        Marke: result[i].Marke,
                        Material: result[i].Material,
                        Umsatzsteuer: result[i].Umsatzsteuer,
                        Beschreibung: result[i].Beschreibung,
                        Bild: base64,
                        inWunschliste: exists
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
                output.msg = "Fehler!";
                console.log(output);
                res.json(output);
                return 
            }   
        }
        if (req.body.suchkategorie == "shops" || req.body.suchkategorie == "Shops") {
            try {
                const [resultShop] = await sql_con
                .promise()
                .query(
                    "SELECT * FROM Shop WHERE sys.levenshtein(S_Name, ?) <= 2 AND Status = 'Freigegeben'", 
                    [req.body.suchfeld] 
                );
            
                var count = resultShop.length;
                for (var i = 0; i < count; i++) {
                    console.log(i)
                    output.data[i] = {   
                        shopid: resultShop[i].ShopID,
                        shopname: resultShop[i].S_Name,
                        straße: resultShop[i].Straße,
                        postleitzahl: resultShop[i].Postleitzahl,
                        ortschaft: resultShop[i].Ortschaft,
                        land: resultShop[i].Land,
                        telefonnummer: resultShop[i].Telefonnummer,
                        shopemail: resultShop[i].S_EMail_Adresse,
                        umsatzsteuerid: resultShop[i].Umsatzsteueridentifikationsnummer,
                        shopkategorie: resultShop[i].S_KategorieID,
                        oeffnungszeiten: "Noch nicht definiert" //!!!!!!!!!!!!!!!!!!!!!!!
                    }; 
                }

                output.status = true;
                output.msg = "Suchergebnisse für '"+req.body.suchfeld+"'. "+count+" Ergebniss(e).";
                output.details = count;
                if (count == 0) {
                    output.status = false;
                    output.msg = "Die Shopsuche '"+req.body.suchfeld+"' ergab leider keine Treffer!";
                } 
            } catch (err) {
                console.log(err);
                output.status = false;
                output.msg = "Es ist ein Fehler aufgetreten!";
                console.log(output);
                res.json(output);
                return 
            }
        }
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Fehler beim ausgeben!";
    }
    console.log(output);
    res.json(output);    
}
