import { sql_con } from "../../db/db-config.js";
import { getKiDbyEmail, checkIfProduktInWunschliste, getWarenkorbIDbyKunde, checkIfWarenkorbEmpty, getShopIDFromWarenkorb } from "./kunde-utils.js";
import { produktBestandAendern } from "./kunde-utils.js"
 
export const warenkorbEinsehen = async (req, res, userEmail) => {
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

    var wID;
    wID = await getWarenkorbIDbyKunde(kID);
    if (!wID) {
        //Warenkorb ist nicht existent, erstmal einen Anlegen
        wID = await warenkorbErstellen(kID);
    }        
    console.log(wID)
    try {   
        const [result] = await sql_con
        .promise()
        .query(
            "SELECT * FROM Bestelldetails b JOIN Produkt p ON b.ProduktID = p.ProduktID WHERE WarenkorbID = ?", 
            [wID] 
        );

        var count = result.length;
        for (var i = 0; i < count; i++) {
            const exists = await checkIfProduktInWunschliste(kID, result[i].ProduktID);
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
                Bild: base64,
                inWunschliste: exists
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

export const produktInWarenkorb = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    var setShopID = false; //Wenn das true ist dann wird die ShopID im Warenkorb gesetzt
    var bestellmenge = 1;

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
    }
    
    if(req.body.produktID >= 2000) {
        output.status = false;
        output.msg = "Zum Bestätigen nochmal klicken.";
        console.log(output);
        res.json(output);
        return
    }

    if (req.body.bestellmenge) { 
        bestellmenge = req.body.bestellmenge
    }
    if (bestellmenge !== 1) {
        bestellmenge = parseInt(bestellmenge);
        if (isNaN(bestellmenge)) {      
            output.status = false;
            output.msg = "Kein numerischer Wert!";
            console.log(output);
            res.json(output);
            return    
        }       
    }

    var wID;
    wID = await getWarenkorbIDbyKunde(kID);
    console.log("1. WID: "+wID)
    if (!wID) { 
        //Warenkorb ist nicht existent, erstmal einen Anlegen
        wID = await warenkorbErstellen(kID);
        console.log("2. WID: "+wID)
    } else {
        const empty = await checkIfWarenkorbEmpty(wID); //Wenn der Warenkorb leer ist, muss die ShopID geleert werden!
        console.log(empty)
        console.log("empty: "+empty)

        if(empty) {
            // Setzt den Shop auf 0
            await setShopIDatWarenkorb(null, wID);
        }
    }
    
    const sID = await getShopByProductID(req.body.produktID);
    console.log("sid:"+sID);

    const sIDCheck = await getShopIDFromWarenkorb(wID);
    if (sIDCheck) {
        //Wenn es bereits ein Produkt im Warenkorb gibt, überprüfen ob die Shops Übereinstimmen. (Es gibt ein Abgrenzungskriterium: In einem Warenkorb dürfen nur Produkte vom gleichen Shop stammen!)
        if (sID != sIDCheck) {
            output.status = false;
            output.msg = "In einem Warenkorb dürfen nur Produkte vom gleichen Shop stammen!";
            console.log(output);
            res.json(output);
            return    
        }
    } else {
        setShopID = true;
    }
    
    const [success, message] = await produktBestandAendern(req.body.produktID, -bestellmenge, true);
    if (!success) {
        output.status = false;
        output.msg = "Es können nicht so viele Produkte reserviert werden! "+message;
        console.log(output);
        res.json(output);
        return 
    }

    try {   
        const [result] = await sql_con.promise().query(
            "INSERT INTO Bestelldetails (ProduktID, WarenkorbID, Bestellmenge) VALUES (?, ?, ?)",
            [req.body.produktID, wID, bestellmenge]);

        await produktBestandAendern(req.body.produktID, -bestellmenge); //Hier wird der Betrag tatsächlich geändert

        if (setShopID) {
            await setShopIDatWarenkorb(sID, wID);
        }

        output.status = true;
        output.msg = "Hinzugefügt.";
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Produkt konnte nicht hinzugefügt werden. Möglicherweise ist es bereits in dem Warenkorb!";
    }
    console.log(output);
    res.json(output);    
}

export const produktAusWarenkorb = async (req, res, userEmail) => {
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
        var wID;
        wID = await getWarenkorbIDbyKunde(kID);
        if (!wID) {
            output.status = false;
            output.msg = "Warenkorb ist leer!";
            console.log(output);
            res.json(output);
            return
        } 
        
        try {  
            // Findet die Bestellmenge heraus
            const [result] = await sql_con.promise().query(
                "SELECT Bestellmenge FROM Bestelldetails WHERE WarenkorbID = ? AND ProduktID = ?;",
                [wID, req.body.produktID]);

            await sql_con.promise().query(
                "DELETE FROM Bestelldetails WHERE WarenkorbID = ? AND ProduktID = ?;",
                [wID, req.body.produktID]);
            
            await produktBestandAendern(req.body.produktID, result[0].Bestellmenge);
            
            output.status = true;
            output.msg = "Produkt aus dem Warenkorb gelöscht.";
        } catch (err) {
            console.log(err);
            output.status = false;
            output.msg = "Produkt konnte nicht entfernt werden. Möglicherweise existiert es nicht oder es ist nicht in dem Warenkorb!";
        }
    }
    console.log(output);
    res.json(output);   
}

export const warenkorbMengeSetzen = async (req, res, userEmail) => {
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
    }

    if (!req.body.bestellmenge || req.body.bestellmenge <= 0) { 
        output.status = false;
        output.msg = "Keine Menge definiert!";
        console.log(output);
        res.json(output);
        return    
    } else {
        var bestellmenge = parseInt(req.body.bestellmenge);
        if (isNaN(bestellmenge)) {      
            output.status = false;
            output.msg = "Kein numerischer Wert!";
            console.log(output);
            res.json(output);
            return    
        }

        var wID;
        wID = await getWarenkorbIDbyKunde(kID);
        if (!wID) {
            output.status = false;
            output.msg = "Warenkorb ist leer!";
            console.log(output);
            res.json(output);
            return
        }       

        try {   
            // Findet die Bestellmenge heraus
            const [result] = await sql_con.promise().query(
                "SELECT Bestellmenge FROM Bestelldetails WHERE WarenkorbID = ? AND ProduktID = ?;",
                [wID, req.body.produktID]);


            var aktuellerBestand = result[0].Bestellmenge;
            // req.body.bestellmenge ist der neue gewünschte Bestand. Allerdings muss man erst abfragen ob dieser Bestand auch erst verfügbar ist.
            // Um das herauszufinden, muss man den aktuellen Bestand konsiderieren. 
            var bestandDifferenz = req.body.bestellmenge - aktuellerBestand;
            console.log(bestandDifferenz);
            if (bestandDifferenz < 0) {
                // Der Bestand wird verringert. Dies ist nie ein Problem
                const [result] = await sql_con.promise().query(
                    "UPDATE Bestelldetails SET Bestellmenge = ? WHERE WarenkorbID = ? AND ProduktID = ?;",
                    [req.body.bestellmenge, wID, req.body.produktID] 
                );
                // Hier wird die Differenz wieder der Stückzahl gutgeschrieben. Die Bestandsdifferenz ist allerdings negativ. Negativ bedeutet der Bestand wird subtrahiert.
                // Deshalb muss man mit dem Minus davor das Minus zeichen loswerden.
                await produktBestandAendern(req.body.produktID, -bestandDifferenz);

                output.status = true;
                output.msg = "Bestellmenge aktualisiert.";
            } else if (bestandDifferenz == 0) {
                output.status = true;
                output.msg = "Dieser Bestand ist bereits im Warenkorb.";
                console.log(output);
                res.json(output);
                return 
            } else {
                // Der Bestand wird erhöht. Hier muss abgefragt werden, ob das Produkt in der Menge zur Verügung steht. Der Bestand wird noch nicht geändert
                const [success, message] = await produktBestandAendern(req.body.produktID, -bestandDifferenz, true);
                if (!success) {
                    output.status = false;
                    output.msg = "Es können nicht so viele Produkte reserviert werden! "+message;
                    console.log(output);
                    res.json(output);
                    return 
                }
                // Die Menge ist verfügbar
                // 1. Menge Updaten im Warenkorb
                const [result] = await sql_con.promise().query(
                    "UPDATE Bestelldetails SET Bestellmenge = ? WHERE WarenkorbID = ? AND ProduktID = ?;",
                    [req.body.bestellmenge, wID, req.body.produktID]);

                // 2. Verfügbarkeit ändern
                await produktBestandAendern(req.body.produktID, -bestandDifferenz); //Hier wird der Betrag tatsächlich geändert

                output.status = true;
                output.msg = "Bestellmenge aktualisiert.";
            }
        } catch (err) {
            console.log(err);
            output.status = false;
            output.msg = "Das Produkt befindet sich nicht in dem Warenkorb!";
        }
    }
    console.log(output);
    res.json(output);    
}

// Erstellt den Warenkorb
export const warenkorbErstellen = async (kundenID) => {
    try {
        var result = await sql_con
        .promise()
        .query(
            "INSERT INTO Warenkorb (KundenID) VALUES (?);",
        [kundenID]   
        );
        const wID = getWarenkorbIDbyKunde(kundenID);  
        return wID
    } catch (err) {
        console.log(err);
        return false
    }
}

// Legt die ShopID bei dem Warenkorb fest
export const setShopIDatWarenkorb = async (sID, wID) => {
    try {
        var result = await sql_con.promise().query(
            "UPDATE Warenkorb SET ShopID = ? WHERE WarenkorbID = ?;",
            [sID, wID]);
        return true
    } catch (err) {
        console.log(err);
        return false
    }
}

export const getShopByProductID = async (pID) => {
    console.log("pid"+pID);
    try {
        var result = await sql_con.promise().query(
            "SELECT ShopID FROM Produkt WHERE ProduktID = (?);",
        [pID]);
        return result[0][0].ShopID
    } catch (err) {
        console.log(err);
        return false
    }
}