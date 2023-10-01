import { sql_con } from "../../db/db-config.js";
import { getMiDbyEmail, getShopIDbyMiD, checkifProduktkategorieexists } from "./haendler-utils.js";

export const produktkategorieanlegen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]  
    }; 
    var mID;
    var sID;

    if (!req.body.name) {
        output.status = false;
        output.msg = "Keinen Namen definiert!";
    } else {
        //Shop ID herausfinden & Berechtigung prüfen
        mID = await getMiDbyEmail(userEmail);
        console.log(mID); 
        if (!mID) {
            output.status = false;
            output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu einloggen!";
            console.log(output);
            res.json(output);
            return
        }

        sID = await getShopIDbyMiD(mID);
        if (!sID) {
            output.status = false;
            output.msg = "Keine Shops im Besitz!";
            console.log(output);
            res.json(output);
            return
        }

        const exists = await checkifProduktkategorieexists(req.body.name, sID);
        if (exists) {
            output.status = false;
            output.msg = "Gegebene Produktkategorie existert bereits! Gegenenfalls wurde sie schon gelöscht.";
            res.json(output);
            return
        }

        try {
            var result = await sql_con
            .promise()
            .query(
                "INSERT INTO Produktkategorie (MitarbeiterID, ShopID, P_Kategoriename) VALUES (?, ?, ?);",
            [mID, sID, req.body.name]
            ); //Annahme 1 Händler = 1 Shop & es können meherer Kategorien von Händlern angelegt werden mit gleichen Namen
            output.status = true;
            output.msg = "Produktkategorie angelegt.";
        } catch (err) {
            console.log(err);
            output.status = false;
            output.msg = "Produktkategorie konnte nicht hinzufgefügt werden!";
            console.log(output);
            res.json(output);
            return
        }
    }
    console.log(output);
    res.json(output);
}

export const produktkategorieaendern = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 
    var mID;
    var sID;

    if (!req.body.name || !req.body.nameoriginal) {
        output.status = false;
        output.msg = "Keinen Namen definiert!";
    } else {
        if (req.body.name == req.body.nameoriginal) {
            output.status = false;
            output.msg = "Der alte Name darf nicht gleich der neue Name sein!";
            console.log(output);
            res.json(output);
            return
        }
        //Shop ID herausfinden & Berechtigung prüfen
        mID = await getMiDbyEmail(userEmail);
        console.log(mID);
        if (!mID) {
            output.status = false;
            output.msg = "Mitarbeiter konnte nicht gefunden werden!";
            console.log(output);
            res.json(output);
            return
        }

        sID = await getShopIDbyMiD(mID);
        if (!sID) {
            output.status = false;
            output.msg = "Keine Shops im Besitz!";
            console.log(output);
            res.json(output);
            return
        }

        const oldExists = await checkifProduktkategorieexists(req.body.nameoriginal, sID);
        if (!oldExists) {
            output.status = false;
            output.msg = "Gegebene Produktkategorie existert nicht!";
            res.json(output);
            return
        }

        const newExists = await checkifProduktkategorieexists(req.body.name, sID);
        if (newExists) {
            output.status = false;
            output.msg = "Produktkategorie existert bereits!";
            res.json(output);
            return
        }

        try {
            var result = await sql_con
            .promise()
            .query(
                "UPDATE Produktkategorie SET P_Kategoriename = ? WHERE P_Kategoriename = ? AND ShopID = ?;",
            [req.body.name, req.body.nameoriginal, sID]
            ); //Annahme 1 Händler = 1 Shop & es können meherer Kategorien von Händlern angelegt werden mit gleichen Namen
            output.status = true;
            output.msg = "Produktkategorie geändert!";
        } catch (err) {
            console.log(err);
            output.status = false;
            output.msg = "Produktkategorie konnte nicht hinzufgefügt werden!";
            console.log(output);
            res.json(output);
            return
        }
    }
    console.log(output);
    res.json(output);
}

export const produktkategorieloeschen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 
    var mID;
    var sID;

    if (!req.body.name) {
        output.status = false;
        output.msg = "Keinen Namen definiert1!";
    } else {
        mID = await getMiDbyEmail(userEmail);
        console.log(mID);
        if (!mID) {
            output.status = false;
            output.msg = "Mitarbeiter konnte nicht gefunden werden!";
            console.log(output);
            res.json(output);
            return
        }

        sID = await getShopIDbyMiD(mID);
        if (!sID) {
            output.status = false;
            output.msg = "Keine Shops im Besitz!";
            console.log(output);
            res.json(output);
            return
        }

        const exists = await checkifProduktkategorieexists(req.body.name, sID);
        if (!exists) {
            output.status = false;
            output.msg = "Gegebene Produktkategorie existert nicht!";
            res.json(output);
            return
        }
        try {
            var result = await sql_con.promise().query("DELETE FROM Produktkategorie WHERE P_Kategoriename = ? AND ShopID = ?;",
            [req.body.name, sID]); 
            console.log("HERE+"+result);
            output.status = true;
            output.msg = "Produktkategorie gelöscht! Alle Produkte wurde aus dieser Kategorie wurden entfernt.";
        } catch (err) {
            console.log(err);
            output.msg = "Produktkategorie konnte nicht gelöscht werden!"; //System Fehler

            if (err.errno) { //FK CONSTRAINT Error
                var result = await sql_con.promise().query(
                    "SELECT P_KategorieID FROM Produktkategorie WHERE P_Kategoriename = ? AND ShopID = ?;",
                [req.body.name, sID]);
                var Pid = result[0][0].P_KategorieID;
        
                output.status = true;
                var result = await sql_con.promise().query("UPDATE Produktkategorie SET Entfernt = 1 WHERE P_KategorieID = ?;", [Pid]);
                var result = await sql_con.promise().query("UPDATE Produkt SET Entfernt = 1 WHERE P_KategorieID = (?);",[Pid]);
                output.msg = "Produktkategorie konnte nicht permantent gelöscht werden, aber sie wurde aus dem Sortiment genommen. Es gibt mindestens ein Produkt welches nicht permanent gelöscht werden kann, da dieses Produkt bereits bestellt wurde. Es wird allerdings ebenfalls aus dem Sortiment genommen.";
            }
            console.log(output);
            res.json(output);
            return
        }
    }
    console.log(output);
    res.json(output);
}
