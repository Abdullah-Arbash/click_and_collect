import { sql_con } from "../../db/db-config.js";


export const getMiDbyEmail = async (email) => {
    try {
        var result = await sql_con
        .promise()
        .query(
            "SELECT MitarbeiterID FROM Mitarbeiter WHERE MA_EMail_Adresse = (?);",
        [email]   
        );
        const mID = result[0][0].MitarbeiterID; //If this crashes, there the authetification failed   
        return mID
    } catch (err) {
        console.log(err);
        return false
    }
}

export const getShopIDbyMiD = async (mID) => {
    try {
        var result = await sql_con
        .promise()
        .query(
            "SELECT ShopID FROM Shop WHERE MitarbeiterID = (?);",
        [mID]
        ); 
        const sID = result[0][0].ShopID; //If this crashes, there the authetification failed  
        return sID 
    } catch (err) {
        return false
    }
}

export const checkIfMitarbeiterExistsById = async (mID) => {
    try {
        var result = await sql_con
        .promise()
        .query(
        "SELECT * FROM Mitarbeiter WHERE MitarbeiterID = (?);",
        [mID]
        );
        var name = result[0][0].MA_Name;
        return true
    } catch (err) {
        return false
    }
}

export const checkifProduktkategorieexists = async (kategorie, shopID) => {
    try {
        var result = await sql_con.promise().query(
            "SELECT P_KategorieID FROM Produktkategorie WHERE P_Kategoriename = ? AND ShopID = ?;",
        [kategorie, shopID]);
        var id = result[0][0].P_KategorieID;  
        return id
    } catch (err) {
        return false
    }
}