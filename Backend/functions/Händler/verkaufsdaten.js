import { sql_con } from "../../db/db-config.js";
import { getMiDbyEmail, getShopIDbyMiD } from "./haendler-utils.js";
import { getTotalPriceOfOrder } from "../Mitarbeiter/mitarbeiter-utils.js"

export const umsatzImQuartal = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 
    var quartal;
    if (!req.body.quartal || req.body.quartal == "") {
        quartal = "Jan-Mär";
    } else {
        quartal = req.body.quartal;
    }

    var mID = await getMiDbyEmail(userEmail);
    if (!mID) {
        output.status = false;
        output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    var sID = await getShopIDbyMiD(mID);
    if (!sID) {
        output.status = false;
        output.msg = "Keine Shops im Besitz!";
        console.log(output);
        res.json(output);
        return
    }

    const monthsName = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    var months;
    if (req.body.quartal == "Alle") {
        months = [1,2,3,4,5,6,7,8,9,10,11,12]
    } else if (quartal == "Jan-Mär") {
        months = [1,2,3]
    } else if (quartal == "Apr-Jun") {
        months = [4,5,6]
    } else if (quartal == "Jul-Sep") {
        months = [7,8,9]
    } else if (quartal == "Okt-Dez"){
        months = [10,11,12]
    } else {
        output.status = false;
        output.msg = "Unbekannter Zeitraum!";
        console.log(output);
        res.json(output);
        return
    }
    try { 
        var result;
        const date = new Date();
        var forindex = 0;
        for (const month of months) {  
            console.log(month)      
            result = await sql_con.promise().query("SELECT (AuftragID) FROM Auftrag WHERE ShopID = (?) AND Zustand = (?) AND YEAR(A_Datum) = (?) AND MONTH(A_Datum) = (?);",
            [sID, "Abgeschlossen", date.getFullYear(), month]);

            var totalSalesThisMonth = 0;
            var count = result[0].length;
            for (var i = 0; i < count; i++) {
                //Umsätze der Aufträge summiert
                totalSalesThisMonth += await getTotalPriceOfOrder(result[0][i].AuftragID);
            }
            output.data[forindex] = {
                month: monthsName[month-1],
                revenue: totalSalesThisMonth
            }
            forindex++;
        }
        output.status = true;
        output.msg = "Verkaufsdaten zurückgegeben.";
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Fehler!";
    }
    console.log(output);
    res.json(output);    
}