import { sql_con } from "../db/db-config.js";
import nodemailer from "nodemailer"
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getKiDbyEmail } from "../functions/Kunde/kunde-utils.js"
import { getMiDbyEmail } from "../functions/Händler/haendler-utils.js"
import { hashPassword } from "./hash-util.js";
import { log_message } from "../functions/Admin/log.js"


export async function checkIfEmailExists(email) {
  let outputExistant = {
    status: true,
    exists: false,
    table: "none",
  };

  outputExistant = await checkIfEmailExistsInMitarbeiter(email);
  
  if (outputExistant.exists == false) {
    outputExistant = await checkIfEmailExistsInKunde(email);
  }

  return outputExistant;
}

export async function checkIfEmailExistsInMitarbeiter(email) {
  let result;
  
  try {
    [[ result ]] = await sql_con
      .promise()
      .query(
        "SELECT COUNT(MA_EMail_Adresse) AS count FROM Mitarbeiter WHERE MA_EMail_Adresse = ?;",
        [email]
      );
  } catch (err) {
      console.log(err);
      return { status: false };
  }

  // Wenn keine Einträge => Email frei
  if (result.count == 0) {
    console.log("Email frei (MA)");
    return { exists: false };
  }

  // Sonst => Email vergeben (Mitarbeiter)
  console.log("Email vergeben (MA)");
  return { exists: true, table: "Mitarbeiter" };
}

export async function checkIfEmailExistsInKunde(email) {
  let result;

  try {
    [[result]] = await sql_con
      .promise()
      .query("SELECT COUNT(K_EMail_Adresse) AS count FROM Kunde WHERE K_EMail_Adresse = ?;", [
        email,
      ]);
  } catch (error) {
    console.log(err);
    return { status: false };
  }

  // Wenn keine Einträge => Email frei
  if (result.count == 0) {
    console.log("Email frei (Kunde)");
    return { exists: false };
  }

  // Sonst => Email vergeben (Kunde)
  console.log("Email vergeben (Kunde)");
  return { exists: true, table: "Kunde" };
}

export async function sendVerificationMail(toEmail, rolle, id) {
  //SMTP Server von der Uni gegeben
  try {
    let transporter = nodemailer.createTransport({
      host: "132.231.36.210",
      port:1105,
      auth: {
        user: "mailhog_grup5", 
        pass: "Stud28VM41up", 
      },
    });

    // Token erstellen. Aus diesem Token werden später die Informationen ausgelesen womit der Nutzer registriert werden kann
    const token = jwt.sign(
      { id: id, rolle: rolle },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '24h' }
    );
    
    //Senden die Mail an die E-Mail und mit dem Verifizierungslink
    await transporter.sendMail({
        from: "'Gruppe 5' <clickncollect@noreply.de>", // Sender Adresse
        to: toEmail, // Ziel Adresse
        subject: "Registrierung abschließen", 
        text: "Hallo. Bitte Klicke auf diesen Link um die Registrierung abzuschließen:\n"+"http://localhost:5000/email-verifizieren/?token="+token+
        "\nDer Link ist 24 Stunden lang gültig."
    });
  } catch (err) {
    console.log(err);
    return false;
  } 
  return true;
}

export async function requestPasswordReset(req, res) {    
  let output = {
      status: false,
      msg: "",
      details: {},
      data: [{}]
  }; 

  if (!req.body.email || req.body.email == "") {
          // Email existiert nicht
          output.status = false;
          output.msg = "Keine Email angegeben!";
          console.log(output);
          res.json(output);
          return;
  } else {
    try {
        var emailcheck = await checkIfEmailExists(req.body.email);
        var id;
        console.log(emailcheck);
        if (emailcheck.exists == false) {
            // Email existiert nicht
            output.status = false;
            output.msg = "Email unbekannt!";
            console.log(output);
            res.json(output);
            return;
        } else {
            // Get Info from the mail
            if (emailcheck.table == "Kunde") {
                id = await getKiDbyEmail(req.body.email)
            } else {
                id = await getMiDbyEmail(req.body.email)
            }
        }
        console.log(id);
        var newPassword = crypto.randomBytes(5).toString('hex');
        console.log(newPassword);

        const token = jwt.sign(
          { id: id, rolle: emailcheck.table, passwort: newPassword },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '24h' }
        );

        let transporter = nodemailer.createTransport({
          host: "132.231.36.210",
          port:1105,
          auth: {
            user: "mailhog_grup5", 
            pass: "Stud28VM41up", 
          },
        });

        await transporter.sendMail({
            from: "'Gruppe 5' <clickncollect@noreply.de>", 
            to: req.body.email, 
            subject: "Passwort zurücksetzen", 
            text: "Ihr neues Passwort wird auf '"+newPassword+"' gesetzt, wenn Sie auf diesen Link klicken: "+"http://localhost:5000/passwort-zuruecksetzen/?token="+token+
            "\nÄndern Sie anschließend bei Bedarf das Passwort. Der Link ist 24 Stunden lang gültig."
        }); 

        output.status = true;
        output.msg = "Email verschickt.";
      } catch (err) {
        output.status = false;
        output.msg = "Email konnte nicht verschickt werden! Möglicherweise ist die Email korrupt!";
        console.log(err);
        res.json(output);
        return;
      } 
    }
    console.log(output);
    res.json(output);
}

export async function passwordReset(req, res) {    
  const token = req.query.token;

  if (!token) {
    res.send("Ungültiger Link oder der Link ist bereits abgelaufen!");
    return;
  }

  try {
      const verified_token = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const { id, rolle, passwort } = verified_token;
      console.log({id, rolle, passwort})
      const hashedPassword = await hashPassword(passwort);
      if (rolle == "Kunde") {
          sql_con.promise().query("UPDATE "+rolle+" SET istVerifiziert = 1, K_Passwort = ? WHERE KundenID = (?);",
          [hashedPassword, id]); 
      } else {
          sql_con.promise().query("UPDATE "+rolle+" SET istVerifiziert = 1, MA_Passwort = ?  WHERE "+rolle+"ID = (?);",
          [hashedPassword, id]); 
      }
    
      res.send("Passwort erfolgreich geändert. Sie können sich nun einloggen.");
  } catch (err) {
    console.log(err);
      if (err instanceof jwt.TokenExpiredError) {
          res.send("Link ist bereits abgelaufen! Bitte erneut nachfragen!");
          return;
      } else if (err instanceof jwt.JsonWebTokenError) {
          res.send("Ungültiger Verifizierungslink!");
          return;
      }
  }
}

export async function sendEMail(toEmail, subject, text) {
  //SMTP Server von der Uni gegeben
  try {
    let transporter = nodemailer.createTransport({
      host: "132.231.36.210",
      port:1105,
      auth: {
        user: "mailhog_grup5",
        pass: "Stud28VM41up", 
      },
    });

    
    // Email Senden
    await transporter.sendMail({
        from: "'Gruppe 5' <clickncollect@noreply.de>", // Sender Adresse
        to: toEmail, // Ziel Adresse
        subject: subject, 
        text: text
    });
  } catch (err) {
    console.log(err);
    log_message("Email senden fehlgeschlagen. Error: "+err, toEmail, "Systemfehler", "sendEMail")
    return false;
  } 
  return true;
}

export async function verifyEmail(req, res) {
  const token = req.query.token;

  if (!token) {
    res.send("Ungültiger Verifizierungslink oder der Link ist bereits abgelaufen!");
    return;
  }

  try {
      const verified_token = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const { id, rolle } = verified_token;

      if (rolle == "Kunde") {
          sql_con.promise().query("UPDATE "+rolle+" SET istVerifiziert = 1 WHERE KundenID = (?);",
          [id]); 
      } else {
          sql_con.promise().query("UPDATE "+rolle+" SET istVerifiziert = 1 WHERE "+rolle+"ID = (?);",
          [id]); 
      }
    
      res.send("Erfolgreich Verifiziert. Sie können sich nun einloggen.");
  } catch (err) {
    console.log(err);
      if (err instanceof jwt.TokenExpiredError) {
          res.send("Verifizierungslink ist bereits abgelaufen! Bitte erneut registrieren!");
          return;
      } else if (err instanceof jwt.JsonWebTokenError) {
          res.send("Ungültiger Verifizierungslink!");
          return;
      }
  }
}

