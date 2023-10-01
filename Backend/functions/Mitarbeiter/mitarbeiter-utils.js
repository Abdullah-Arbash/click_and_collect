import { sql_con } from "../../db/db-config.js";

//Findet heraus wo der Mitarbeiter arbeitet (gehoertZuShop)
export const getHomeShopByMid = async (mID) => {
    try {
        var result = await sql_con
        .promise()
        .query(
            "SELECT gehoertZuShop FROM Mitarbeiter WHERE MitarbeiterID = (?);",
        [mID]
        ); 
        const sID = result[0][0].gehoertZuShop; 
        return sID 
    } catch (err) {
        return false
    }
}

export const checkifProduktExists = async (name, sID) => {
    try {
        var result = await sql_con
        .promise()
        .query(
            "SELECT ProduktID FROM Produkt WHERE ShopID = ? AND P_Name = ? AND Entfernt = 0;",
        [sID, name]
        ); 
        result[0][0].ProduktID; 
        return true 
    } catch (err) {
        return false
    }
}

export const getTotalPriceOfOrder = async (aID) => {
    try {
        var totalPrice = await sql_con
        .promise()
        .query(
            "SELECT SUM(Produkt.Preis * Auftragsdetails.Bestellmenge) as TotalPrice FROM Produkt JOIN Auftragsdetails ON Produkt.ProduktID = Auftragsdetails.ProduktID WHERE Auftragsdetails.AuftragID = (?);",
            [aID]
        ); 
        return totalPrice[0][0].TotalPrice;
    } catch (err) {
        console.log(err)
        return false
    }
}

// Gibt die Kundenmail vom Auftrag zurück.
export const getEmailFromAuftragID = async (aID) => {
    try {
        var result = await sql_con
        .promise()
        .query(
            "SELECT K_Email_Adresse FROM Auftrag JOIN Kunde ON Auftrag.KundenID = Kunde.KundenID WHERE Auftrag.AuftragID = (?);",
            [aID]
        ); 
        return result[0][0].K_Email_Adresse;
    } catch (err) {
        console.log(err)
        return false
    }
}
