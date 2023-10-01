import { sql_con } from "../db/db-config.js";
import { checkIfEmailExists, sendVerificationMail } from "../utils/email-util.js";
import { hashPassword } from "../utils/hash-util.js";
import { getShopKategorieByName } from "../utils/shop-utils.js";


export const regHandler = async (req, res) => {
  let output = {
    status: false,
    msg: "Basic",
  };

  if (!req.body.email || !req.body.passwort || !req.body.rolle) {
    output.msg = "Bitte füllen Sie alle Felder aus!";
    return res.json(output);
  } 

  // Prüfe ob Email bereits verwendet
  const { exists } = await checkIfEmailExists(req.body.email); // Email exists
  if (exists) {
    output.msg = "Diese Email wird bereits verwendet!";
    return res.json(output);
  }

  // Registriere Benutzer / Händler
  if (req.body.rolle == "haendler") {
    output = await händlerRegistrierung(req);
  } else {
    output = await kundeRegistrierung(req);
  }
  res.json(output);
}

export async function händlerRegistrierung(req) {
  const hashedPassword = await hashPassword(req.body.passwort);
  try {
    const {
      name,
      vorname,
      email,
      geschaeftsname,
      stasseNr,
      postleitzahl,
      ortschaft,
      land,
      tel,
      impEmail,
      umsatzsteuerID,
      katalog
    } = req.body;

    await sql_con.promise().beginTransaction();

    const shopKID = await getShopKategorieByName(katalog);

    const [result] = await sql_con
      .promise()
      .query(
        "INSERT INTO Mitarbeiter (MA_Name, MA_Vorname, MA_Passwort, MA_EMail_Adresse, istHaendler, gehoertZuShop) VALUES (?, ?, ?, ?, ?, ?);",
        [name, vorname, hashedPassword, email, +true, null] // +true => 1, +false => 0
      ); 

    const [result2] = await sql_con
      .promise()
      .query(
        "INSERT INTO Shop (MitarbeiterID, S_KategorieID, Status, S_Name, Straße, Postleitzahl, Ortschaft, Land, Telefonnummer, S_EMail_Adresse, Umsatzsteueridentifikationsnummer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
        [
          result.insertId,
          shopKID,
          "Ausstehend",
          geschaeftsname,
          stasseNr,
          postleitzahl,
          ortschaft,
          land,
          tel,
          impEmail,
          umsatzsteuerID,
        ]
      );

      await sql_con
      .promise()
      .query(
        "UPDATE Mitarbeiter SET gehoertZuShop = (?) WHERE MitarbeiterID = (?);",
        [result2.insertId, result.insertId]
      ); 


      //Die ausgewählte Rolle ist Mitarbeiter, da aufgrund des Datenschemas der Händler eigentlich ein Mitarbeiter mit der Ausprägung 'istHaendler' ist
      //Die Shop Mail wird nicht verifiziert!
      var sendSuccess = await sendVerificationMail(email, "Mitarbeiter", result.insertId)
      if (!sendSuccess) {  
          return {
            status: false,
            msg: "E-Mail ist ungültig!",
          };
      }

    await sql_con.promise().commit();

    return {
      status: true,
      msg: "Händler angelegt. Drücken Sie auf den Verifizierungslink in Ihrer E-Mail.",
    };
  } catch (err) {
    console.log(err);
    await sql_con.promise().rollback();
    return {
      status: false,
      msg: "Händler kann nicht angelegt werden! Möglichweise wird die Händler Email bereits verwendet!",
    };
  }
}

export async function kundeRegistrierung(req, output) {
  const hashedPassword = await hashPassword(req.body.passwort);
  try {
    // name = req.body.name
    const { name, vorname, email } = req.body;

    const result = await sql_con
      .promise()
      .query(
        "INSERT INTO Kunde (K_Name, K_Vorname, K_Passwort, K_EMail_Adresse) VALUES (?, ?, ?, ?);",
        [name, vorname, hashedPassword, email]
      );

    var sendSuccess = await sendVerificationMail(email, "Kunde", result[0].insertId)
    if (!sendSuccess) {
      // Wenn das Senden nicht funktioniert, wird der Account wieder gelöscht
      const result = sql_con.promise().query(
        "DELETE FROM Kunde WHERE KundenID = (?);",
        [result.insertId]);

        return {
          status: false,
          msg: "E-Mail ist ungültig!",
        };
    }

    return {
      status: true,
      msg: "Kunde angelegt. Drücken Sie auf den Verifizierungslink in Ihrer E-Mail.",
    };
  } catch (err) {
    console.log(err);
    return {
      status : false,
      msg : "Kunde kann nicht angelegt werden! Möglicherweise ist die E-Mail bereits vergeben."
    }
  }
}

//Diese Funktion wird nicht von der API aufgerufen.
//adminRegistrierung("admin", "admin", "admin", "admin") //Zum aufrufen einfach Kommentar wegnehmen
async function adminRegistrierung(email, name, vorname, passwort) {
  const hashedPassword = await hashPassword(passwort);
  try {
    const result = await sql_con
      .promise()
      .query(
        "INSERT INTO Administrator (A_Name, A_Vorname, A_Passwort, A_EMail_Adresse) VALUES (?, ?, ?, ?);",
        [name, vorname, hashedPassword, email]
      );
    console.log("Admin angelegt");
  } catch (err) {
    console.log(err);
  }
}