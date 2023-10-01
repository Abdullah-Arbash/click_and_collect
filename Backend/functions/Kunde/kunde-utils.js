import { sql_con } from "../../db/db-config.js";

export const getKiDbyEmail = async (email) => {
    try {
        var result = await sql_con
        .promise()
        .query(
            "SELECT KundenID FROM Kunde WHERE K_EMail_Adresse = (?);",
        [email]   
        );
        const kID = result[0][0].KundenID;   
        return kID
    } catch (err) {
        console.log(err);
        return false
    }
}

export const checkIfProduktInWunschliste = async (kundenID, produktID) => {
    try {
        var result = await sql_con
        .promise()
        .query(
            "SELECT * FROM Wunschliste WHERE KundenID = ? AND ProduktID = ?;",
        [kundenID, produktID]   
        );
        const wunschlisteID = result[0][0].WunschlisteID;   
        return true
    } catch (err) {
        return false
    }
}

export const getWarenkorbIDbyKunde = async (kundenID) => {
    try {
        var result = await sql_con
        .promise()
        .query(
            "SELECT * FROM Warenkorb WHERE KundenID = (?);",
        [kundenID]   
        );
        const wID = result[0][0].WarenkorbID;   
        return wID
    } catch (err) {
        console.log(err)
        return false
    }
}

// Überprüft ob der Warenkorb leer ist
export const checkIfWarenkorbEmpty = async (wID) => {
    try {
        const [result] = await sql_con
        .promise()
        .query(
            "SELECT WarenkorbID FROM Bestelldetails WHERE WarenkorbID = ?", 
            [wID] 
        );

        var count = result.length;
        if (count == 0) {
            return true
        }
        else {
            return false
        }
    } catch (err) {
        console.log(err);
        return undefined
    }
}

//Gibt die ShopID von einem Warenkorb zurück
export const getShopIDFromWarenkorb = async (wID) => {
    try {
        var result = await sql_con
        .promise()
        .query(
            "SELECT ShopID FROM Warenkorb WHERE WarenkorbID = (?);",
        [wID]   
        );
        return result[0][0].ShopID
    } catch (err) {
        console.log(err);
        return false
    }
}

export const getProduktBestand = async (pID) => {
    try {
        var result = await sql_con
        .promise()
        .query(
            "SELECT Stückzahl FROM Produkt WHERE ProduktID = (?);",
        [pID]   
        );
        return result[0][0].Stückzahl
    } catch (err) {
        console.log(err);
        return false
    }
}

/*Ändert den Produkt Bestand um den Wert delta.
 Ist delta 5, wird der Bestand um 5 erhöht.
 Ist delta -2, wird der Bestand um 2 vermindert
 Ist ein negatives delta größer als der Bestand, wird die Operation nicht durchgeführt.
 Wenn onlyCheck true ist, wird nicht der Bestand tatsächlich geändert. Standardmäßig false
 success
*/ 
export const produktBestandAendern = async (pID, delta, onlyCheck = false) => {
    const bestand = await getProduktBestand(pID);
    console.log(bestand);
    if (bestand <= 0 && onlyCheck == true) {
        const message = "Das Produkt steht nicht zur Verfügung!";
        return [false, message]
    }

    if (delta < 0) {
        //bestand 3, delta -2 --> ok; Bestand 3, delta -5 --> nicht ok
        if (delta*-1 > bestand) {
            const message = "Es stehen "+bestand+" Stück zur Verfügung!";
            return [false, message]
        }
    } else if (delta == 0) {
        const message = "Keine Reservierung vorgenommen!";
        return [false, message]
    }
    if (!onlyCheck) {    
        const difference = bestand + delta;
        try {
            var result = await sql_con
            .promise()
            .query(
                "UPDATE Produkt SET Stückzahl = ? WHERE ProduktID = ?;",
            [difference, pID]   
            );
            return [true, ""]
        } catch (err) {
            console.log(err);
            return [false, ""]
        }
    }
    return true, "Pass"
}
