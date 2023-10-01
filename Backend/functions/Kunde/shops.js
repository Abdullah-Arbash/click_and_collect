//Shops einsehen nach Kategorie
import { sql_con } from "../../db/db-config.js";
import { getKiDbyEmail, checkIfProduktInWunschliste } from "./kunde-utils.js";
import { getShopKategorieNameByID, getOpeningTimesInJSON } from "../../utils/shop-utils.js";


export const shopNachKategorie = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: []
    }; 

    if (!req.body.shopkategorieID || req.body.shopkategorieID == "") { 
        output.status = false;
        output.msg = "Keine Kategorie ausgewählt!";
        console.log(output);
        res.json(output);
        return
    } else {
        try {   
            const resultShop = await sql_con.promise().query(
                "SELECT * FROM Shop WHERE S_KategorieID = (?) AND Status = 'Freigegeben';",
                [req.body.shopkategorieID]);   

            const [resultShopKat] = await sql_con.promise().query("SELECT * FROM Shopkategorie WHERE S_KategorieID = (?)", 
                [req.body.shopkategorieID]);

            var shopkategorie = resultShopKat[0].S_Kategoriename
            
            var count = resultShop[0].length;
            for (var i = 0; i < count; i++) {
                output.data[i] = {    
                    shopID: resultShop[0][i].ShopID,
                    shopname: resultShop[0][i].S_Name,
                    straße: resultShop[0][i].Straße,
                    postleitzahl: resultShop[0][i].Postleitzahl,
                    ortschaft: resultShop[0][i].Ortschaft,
                    land: resultShop[0][i].Land,
                    telefonnummer: resultShop[0][i].Telefonnummer,
                    shopemail: resultShop[0][i].S_EMail_Adresse,
                    umsatzsteuerid: resultShop[0][i].Umsatzsteueridentifikationsnummer,
                    shopkategorie: resultShop[0][i].S_KategorieID
                }; 
            }

            output.status = true;
            output.msg = "Shops ausgegeben.";
            output.details = shopkategorie;
        } catch (err) {
            console.log(err);
            output.status = false;
            output.msg = "Keine Shops!";
        }
    }
    console.log(output);
    res.json(output);    
}
// Produkte aus Shop
export const produkteAusShop = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: []
    }; 

    if (!req.body.shopID || req.body.shopID == "") { 
        output.status = false;
        output.msg = "Keinen Shop ausgewählt!";
        console.log(output);
        res.json(output);
        return
    } else {
        try {   
            const [result] = await sql_con
            .promise()
            .query(
                "SELECT * FROM Produkt WHERE ShopID = (?) AND Entfernt = 0;", 
                [req.body.shopID]
            ); 
            
            const kID = await getKiDbyEmail(userEmail)

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
                    Bild: base64,
                    inWunschliste: exists
                }
            }

            output.status = true;
            output.msg = "Produkte des Shops Ausgegeben.";
            output.details = count;
            if (count == 0) {
                output.msg = "Keine Produkte.";
            }
        } catch (err) {
            console.log(err);
            output.status = false;
            output.msg = "Datenbankerbindung fehlgeschlagen!";
        }
    }
    console.log(output);
    res.json(output);    
}

export const shopNachShopID = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    if (!req.body.shopID || req.body.shopID == "") { 
        output.status = false;
        output.msg = "Keinen Shop ausgewählt!";
        console.log(output);
        res.json(output);
        return
    } else {
        try {   
            const resultShop = await sql_con
            .promise()
            .query(
                "SELECT * FROM Shop WHERE ShopID = (?);", 
                [req.body.shopID]
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
    }
    console.log(output);
    res.json(output);    
}

export const produktkategorienNachShop = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: []
    }; 

    if (!req.body.shopID || req.body.shopID == "") { 
        output.status = false;
        output.msg = "Keinen Shop ausgewählt!";
        console.log(output);
        res.json(output);
        return
    }

    try {   
        const [result] = await sql_con
        .promise()
        .query(
            "SELECT * FROM Produktkategorie WHERE ShopID = ? AND Entfernt = 0", 
            [req.body.shopID] 
        );
        
        var count = result.length;
        for (var i = 0; i < count; i++) {
            output.data[i] = {
                P_KategorieID: result[i].P_KategorieID, 
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

export const produkteNachProduktkatogrie = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: []
    }; 

    if (!req.body.ProduktkategorieID || req.body.ProduktkategorieID == "") { 
        output.status = false;
        output.msg = "Bitte ProduktkategorieID eingeben!";
        console.log(output);
        res.json(output);
        return
    }

    const kID = await getKiDbyEmail(userEmail)
    try {   
        try {
            const [result] = await sql_con
            .promise()
            .query(
                "SELECT * FROM Produkt WHERE P_KategorieId = (?) AND Entfernt = 0", 
                [req.body.ProduktkategorieID] 
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
                    Bild: base64,
                    inWunschliste: exists

                }
            }
            output.status = true;
            output.msg = "Produkte zurückgegeben.";
            output.details = count;
            if (count == 0) {
                output.status = false;
                output.msg = "Keine Produkte unter dieser Kategorie!";
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


 // Prüft ob ein Bild im 1:1 Verhältnis steht
 /*
 async function validateImageRatio(imageBuffer, mime) {
    try {
        const image = await jimp.read(imageBuffer, mime);
        console.log(image.width);
        if (image.bitmap.width !== image.bitmap.height) {
            return false // Bild ist nicht im 1:1 Verhältnis
        } else {
            return true
        } 
    } catch (err) {
        console.log(err);
        return false
    }
}*/