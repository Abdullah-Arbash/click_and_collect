import { sql_con } from "../db/db-config.js";

export const shopkategorieEinsehen = async (req, res, email) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 
    
    try {
        var [result] = await sql_con
        .promise()
        .query(
            "SELECT * FROM Shopkategorie;"
        ); 
        var count = result.length;
        for (var i = 0; i < count; i++) {
            output.data[i] = {
                shopkategorieId: result[i].S_KategorieID , 
                shopkategorieName: result[i].S_Kategoriename,
            }
        }
        output.status = true;
        output.msg = "Alle Shopkategorien ausgegeben.";
        output.details = count;
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Keine Shopkategorien angelegt. Bitte wenden Sie sich an den Administrator!";
    }
    console.log(output);
    res.json(output);
}