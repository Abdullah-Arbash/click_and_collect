import { sql_con } from "../../db/db-config.js";
import { log_message } from "./log.js"


// Gibt alle Nutzer zurück
export const benutzerEinsehen = async (req, res, email) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    try {
        var result;

        var [result] = await sql_con.promise().query("SELECT * FROM Mitarbeiter;"); 
        var count = result.length;

        for (var i = 0; i < count; i++) {    
            var [resultShop] = await sql_con.promise().query("SELECT * FROM Shop WHERE ShopID = (?);",
            [result[i].gehoertZuShop]); 

            var shopkategorie = ""
            try {
                const [resultShopKat] = await sql_con.promise().query("SELECT * FROM Shopkategorie WHERE S_KategorieID = (?)", 
                [resultShop[0].S_KategorieID]);
                shopkategorie = resultShopKat[0].S_Kategoriename
            }
            catch {
                // Keine Aktion erforderlich
            }

            var email = result[i].MA_EMail_Adresse

            output.data[i] = {
                BenutzerID: result[i].MitarbeiterID, 
                Rolle: "Mitarbeiter",
                Name: result[i].MA_Name,
                Vorname: result[i].MA_Vorname,
                EmailAdresse: email,
                istHaendler: result[i].istHaendler,
                ShopName: resultShop[0].S_Name,
                Kategorie: shopkategorie,
                Status: resultShop[0].Status,
                istVerifiziert: result[i].istVerifiziert
            }
        }

        // Aus irrgendeinem Grund ist die Zeile "resultCustomers[i].K_Email_Adresse", undefined, obwohl der Spaltenname passt. Deshalb wird die Spalte hier umbenannt mit "K_EMail_Adresse as EMail"
        var [resultCustomers] = await sql_con.promise().query("SELECT KundenID, K_Name, K_Vorname, K_EMail_Adresse as EMail, istVerifiziert FROM Kunde;"); 
        var countCustomers = resultCustomers.length;

        for (var i = 0; i < countCustomers; i++) {  
            output.data[i+count] = {
                BenutzerID: resultCustomers[i].KundenID, 
                Rolle: "Kunde",
                Name: resultCustomers[i].K_Name,
                Vorname: resultCustomers[i].K_Vorname,
                Email: resultCustomers[i].EMail,
                istHaendler: "0",
                ShopName: "",
                Kategorie: "",
                Status: "",
                istVerifiziert: resultCustomers[i].istVerifiziert[0]
            }
        }


        output.details = count;
        output.status = true;
        output.msg = "Benutzer ausgegeben.";
        if(count == 0) {
            output.msg = "Keine Benutzer.";
        }
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Benutzer konnten nicht ausgegeben werden!";
    }

    console.log(output);
    res.json(output);
}

async function deleteNotVerfiedUsers() {
    try {
        // Nur Händler weil Mitarbeiter automatisch verifiziert sind
        var result = await sql_con.promise().query("DELETE FROM Mitarbeiter WHERE istVerifiziert = 0 AND istHaendler = 1;"); 
        var count = result[0].affectedRows;

        result = await sql_con.promise().query("DELETE FROM Kunde WHERE istVerifiziert = 0;"); 
        count = count + result[0].affectedRows;

        console.log(count);
        log_message("Die regelmäßige Löschung von unverifzierten Nutzern fand statt und es wurden so viele Accounts gelöscht: "+count, "SYSTEM", "Kein Fehler", "deleteNotVerfiedUsers");
    } catch (err) {
        console.log(err);
        log_message("Es konnte keine regelmäßige Löschung von unverifzierten Nutzern vorgenommen werden (err): "+err, "SYSTEM", "System Fehler", "deleteNotVerfiedUsers")
    }
}
setInterval(deleteNotVerfiedUsers, process.env.deleteNotVerfiedUsersInterval)
