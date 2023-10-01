import { sql_con } from "../../db/db-config.js";
import { checkifShopkategorieexists } from "./admin-utils.js"
import { log_message } from "./log.js"


export const shopkategorieErstellen = async (req, res, email) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 
    
    if (!req.body.name) {
        output.status = false;
        output.msg = "Nicht alle Felder ausgefüllt!";
    } else {
        const exists = await checkifShopkategorieexists(req.body.name);
        if (exists) {
            output.status = false;
            output.msg = "Shopkategorie existiert bereits!";
            res.json(output);
            return;
        }

        try {
            var result = await sql_con.promise().query(
                "INSERT INTO Shopkategorie (S_Kategoriename) VALUES (?);",
            [req.body.name]); 
            output.status = true;
            output.msg = "Shopkategorie hinzugefügt.";

            log_message("Shopkategorie hinzugefügt mit dem Namen: "+req.body.name, email, "Kein Fehler", "shopkategorieErstellen")
        } catch (err) {
            console.log(err);
            output.status = false;
            output.msg = "Shopkategorie konnte nicht hinzugefügt werden!";
        }
    }
    console.log(output);
    res.json(output);
}

export const shopkategorieEntfernen = async (req, res, email) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 
    
    if (!req.body.name) {
        output.status = false;
        output.msg = "Bitte wähle eine Kategorie!";
    } else {
        const exists = await checkifShopkategorieexists(req.body.name);
        if (!exists) {
            output.status = false;
            output.msg = "Shopkategorie existiert nicht!";
            res.json(output);
            return;
        }

        try {
            await sql_con.promise().query(
                "DELETE FROM Shopkategorie WHERE S_Kategoriename =(?);",
            [req.body.name]); 
            output.status = true;
            output.msg = "Shopkategorie gelöscht.";
            log_message("Shopkategorie gelöscht mit dem Namen: "+req.body.name, email, "Kein Fehler", "shopkategorieEntfernen")
        } catch (err) {
            console.log(err);
            output.status = false;
            output.msg = "Shopkategorie konnte nicht gelöscht werden! Eine Shopkategorie kann nur gelöscht werden wenn keine Shops der Kategorie angehören. Ändern sie die Shopkategorie der entsprechenden Shops!";
        }
    }
    console.log(output);
    res.json(output);
}

