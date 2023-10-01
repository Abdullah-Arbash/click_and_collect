import { sql_con } from "../../db/db-config.js";

// existiert die Shopkategorie bereits? Gibt ebenfalls die ID zurück
export const checkifShopkategorieexists = async (kategorie) => {
    try {
        var result = await sql_con
        .promise()
        .query(
            "SELECT S_KategorieID FROM Shopkategorie WHERE S_Kategoriename = ?;",
        [kategorie]   
        );
        return result[0][0].S_KategorieID;
    } catch (err) {
        console.log(err);
        return false
    }

}