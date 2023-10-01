import { sql_con } from "../db/db-config.js";
import { hashPassword } from "../utils/hash-util.js";
import jwt from "jsonwebtoken";

import { log_message } from "./Admin/log.js";

// Load JWT Token
import * as dotenv from 'dotenv';
dotenv.config("..");

export const loginHandler = async (req, res) => {

    const {email, passwort} = req.body;

    if (!email || !passwort) {
        res.status(400).json({
            status: false,
            msg: "Invalid Form Content"
        });
        return;
    }

    // Hash Password
    const hashedPassword = await hashPassword(req.body.passwort);

    // DB Anfrage für alle Rollen
    const [result_k] = await sql_con
        .promise()
        .query(
            "SELECT K_EMail_Adresse, K_Vorname FROM Kunde WHERE K_EMail_Adresse = (?) AND K_Passwort = (?) AND istVerifiziert = 1;",
            [req.body.email, hashedPassword]
        );
    const [result_ma] = await sql_con
        .promise()
        .query(
            "SELECT MA_EMail_Adresse, MA_Vorname, istHaendler FROM Mitarbeiter WHERE MA_EMail_Adresse = (?) AND MA_Passwort = (?) AND istVerifiziert = 1;",
            [req.body.email, hashedPassword]
        );
    const [result_a] = await sql_con
        .promise()
        .query(
            "SELECT A_EMail_Adresse, A_Vorname FROM Administrator WHERE A_EMail_Adresse = (?) AND A_Passwort = (?);",
            [req.body.email, hashedPassword]
        );

    // result_x ist "[]" wenn die Email nicht unter der Rolle x angelegt wurde
    // result_x hat einen Eintrag "[{...}]" wenn ein Benutzer angelegt wurde
        
    // Rolle des Benutzers
    let rolle;

    // Wir setzen vorraus, dass jede Email nur einmal verwendet wird
    if (result_a.length) rolle = "admin"
    else if (result_ma.length) rolle = result_ma[0].istHaendler ? "haendler" : "mitarbeiter"
    else if (result_k.length) rolle = "kunde" 

    // Wenn die Email nicht gefunden wurde
    else {
        res.status(200).json({
            status: false,
            msg: "Ungültige Email-Adresse, falsches Passwort oder nicht verifiziert. Bitte versuchen Sie es erneut.",
            table: "none"
        })
        log_message("Ungültiger Einloggversuch auf die Mail: "+email, "Kein Fehler", "loginHandler")

        return;
    }

    // Create Token
    const options = {
        expiresIn: "240h",
    };

    const token = jwt.sign(
        { email: req.body.email, rolle },
        process.env.ACCESS_TOKEN_SECRET,
        options
    );


    res.append("X-New-Session-Token", token);
    res.append("Access-Control-Expose-Headers", "X-New-Session-Token");
    res.append("Access-Control-Expose-Headers", "Set-Cookie");

    // Sende Response
    res.json({
        status: true,
        table: rolle
    });

    return;
};