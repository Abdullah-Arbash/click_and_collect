import { getKiDbyEmail, getWarenkorbIDbyKunde, checkIfWarenkorbEmpty, getShopIDFromWarenkorb } from "./kunde-utils.js";
import { getTotalPriceOfOrder } from "../Mitarbeiter/mitarbeiter-utils.js"
import { sql_con } from "../../db/db-config.js";
import { log_message } from "../Admin/log.js";
import { sendEMail } from "../../utils/email-util.js";

//Hier wird der Warenkorb Bestellprozess angestoßen
export const termineEinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: []
    }; 

    if (!req.body.jahr || req.body.jahr == "" 
        || !req.body.monat || req.body.monat == ""
        || !req.body.tag || req.body.tag == "") { 
        output.status = false;
        output.msg = "Datum nicht korrekt angegeben!";
        console.log(output);
        res.json(output);
        return
    }


    var kID = await getKiDbyEmail(userEmail);
    if (!kID) {
        output.status = false;
        output.msg = "Kunde konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    var wID;
    wID = await getWarenkorbIDbyKunde(kID);
    if (!wID) {
        //Warenkorb ist nicht existent, keine Bestellung möglich
        output.status = false;
        output.msg = "Ihr Warenkorb ist leer!";
        console.log(output);
        res.json(output);
        return
    }        

    const empty = await checkIfWarenkorbEmpty(wID); 
    console.log(empty)
    if(empty) {
        output.status = false;
        output.msg = "Ihr Warenkorb ist leer!";
        console.log(output);
        res.json(output);
        return    
    }

    //Get sID from Warenkorb
    var sID = await getShopIDFromWarenkorb(wID);


    // Termin auswählen!
    // Tag auswählen --> Wochentag ermitteln --> Öffnungszeit --> Slots --> Vergeben oder nicht
    // Datum zum Wochentag
    //console.log(getWeekDayFromDate(jahr, monat, tag));
    var [wochentag, termindatum] = getWeekDayFromDate(req.body.tag, req.body.monat, req.body.jahr);
    console.log("Tag "+wochentag);

    // Arbeitszeiten am Wochentag bekommen
    try {
        const result = await sql_con.promise().query("SELECT * FROM Oeffnungszeiten WHERE ShopID = (?) AND O_Tag = (?);",
        [sID, wochentag]);

        // Timeframe in Slots
        var slots = timeframeInSlots(result[0][0].Von, result[0][0].Bis);
        if (slots.length == 0) {
            throw err;
        }
        var slotNum = 0;
        slots.forEach(slot => {
            slot.besetzt = false;
            slot.slot = slotNum;
            slotNum++;
        });
  
        //Check if slot free
        console.log(termindatum)
        try {
            const resultSlots = await sql_con.promise().query("SELECT AuftragID, A_Slot, A_Datum FROM Auftrag WHERE ShopID = (?) AND DATE(A_Datum) = DATE(?);",
            [sID, termindatum]);
            var count = resultSlots[0].length;

            for (var i = 0; i < count; i++) {
                console.log("Slot: "+resultSlots[0][i].A_Slot);
                if (resultSlots[0][i].A_Slot < slots.length) { //Nur gültige Slots eintragen
                    slots[resultSlots[0][i].A_Slot].besetzt = true;
                }
            }
        } catch (err) {
            //Keine Slots belegt
        }

        console.log(slots)
        output.status = true;
        output.msg = "Termine zurückgegeben.";
        output.data = slots;
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "An diesem Tag hat der Shop zu!";
    }
    console.log(output);
    res.json(output);    
}

export const warenkorbBestellen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    if (!req.body.jahr || req.body.jahr == "" 
        || !req.body.monat || req.body.monat == ""
        || !req.body.tag || req.body.tag == "") { 
        output.status = false;
        output.msg = "Datum nicht korrekt angegeben!";
        console.log(output);
        res.json(output);
        return
    }

    if (!req.body.slot && req.body.slot != 0) { 
        output.status = false;
        output.msg = "Keinen Slot ausgewählt!";
        console.log(output);
        res.json(output);
        return;
    }

    var kID = await getKiDbyEmail(userEmail);
    if (!kID) {
        output.status = false;
        output.msg = "Kunde konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    var wID;
    wID = await getWarenkorbIDbyKunde(kID);
    if (!wID) {
        //Warenkorb ist nicht existent, keine Bestellung möglich
        output.status = false;
        output.msg = "Ihr Warenkorb ist leer!";
        console.log(output);
        res.json(output);
        return
    }        

    const empty = await checkIfWarenkorbEmpty(wID); 
    if(empty) {
        output.status = false;
        output.msg = "Ihr Warenkorb ist leer!";
        console.log(output);
        res.json(output);
        return    
    }

    var sID = await getShopIDFromWarenkorb(wID);

    var [wochentag, termindatum] = getWeekDayFromDate(req.body.tag, req.body.monat, req.body.jahr);
    var slots = [];
    try {
        const result = await sql_con.promise().query("SELECT * FROM Oeffnungszeiten WHERE ShopID = (?) AND O_Tag = (?);",
        [sID, wochentag]);

        // Timeframe in Slots
        slots = timeframeInSlots(result[0][0].Von, result[0][0].Bis);    
    } catch (err) {
        output.status = false;
        output.msg = "Der Slot den Sie ausgewählt haben ist nicht innerhalb der Öffnungszeit des Shops!";
        console.log(output);
        res.json(output);
        return    
    }
    try {   
        var hours = slots[req.body.slot].start.slice(0, -6)
        var minutes = slots[req.body.slot].start.slice(3, -3)
        termindatum.setHours(hours);
        if (minutes != "00") {
            termindatum.setMinutes(minutes);
        }

        const result = await sql_con.promise().query("INSERT INTO Auftrag (KundenID, MitarbeiterID, ShopID, Zustand, istBezahlt, A_Datum, A_Tag, A_Slot) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
        [kID, null, sID, "Offen", 0, termindatum, wochentag, req.body.slot]);
        const auftragsID = result[0].insertId;

        //Auftragsdetailstabelle muss nun mit den Inhalten von dem Warenkorb befüllt werden
        const resultBulkInsert = await sql_con.promise().query("INSERT INTO Auftragsdetails (AuftragID, ProduktID, Bestellmenge) SELECT ?, ProduktID, Bestellmenge FROM Bestelldetails WHERE WarenkorbID = (?);",
        [auftragsID, wID]);

        warenkorbLeeren(wID); //Dies ist notwendig damit der Kunde jetzt wieder weiter shoppen kann. In dieser Funktion werden nicht die Mengen wieder zurückgesetzt. Dies passiert erst bei dem Auftragsabschluss oder bei der Stornierung

        output.status = true;
        output.msg = "Auftrag angelegt. Bitte beachte dass die Inhalte von deinem Warenkorb jetzt im Auftrag sind.";
        sendEMail(userEmail, "Ihre Bestellung wurde aufgegeben.", "Ihre Bestellung mit der Abholnummer "+req.body.auftragID+" wurde aufgegeben. Sie finden die Abholung nun unter den Abholscheinen. Ihr Termin: "+termindatum);
        log_message("Ein Kunde hat sich etwas bestellt. AuftragID: "+auftragsID, userEmail, "Kein Fehler", "warenkorbBestellen")
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Auftrag konnte nicht angelegt werden! Möglicherweise ist der Slot nicht mehr frei oder er ist außerhalb der Öffnungszeiten!";
    }
    console.log(output);
    res.json(output);    
    return;
}

export const abholungenEinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: []
    }; 

    var kID = await getKiDbyEmail(userEmail);
    if (!kID) {
        output.status = false;
        output.msg = "Kunde konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }  

    try {   
        const result = await sql_con.promise().query("SELECT * FROM Auftrag WHERE KundenID = (?) AND Zustand = (?);",
        [kID, "Offen"]);

        var count = result[0].length;
        var resultShop;
        var previousShop;
        for (var i = 0; i < count; i++) {
            let date = new Date(result[0][i].A_Datum); //Dies ist notwending um auf die deutsche Zeitzone umzurechnen
            date.setUTCHours(date.getUTCHours() + 1);    

            if (previousShop != result[0][i].ShopID) {
                resultShop = await sql_con.promise().query("SELECT * FROM Shop WHERE ShopID = (?);", [result[0][i].ShopID]);    
            }
            previousShop = result[0][i].ShopID;
            output.data[i] = {
                Abholnummer: result[0][i].AuftragID,
                Datum: date.toString(),
                Zustand: result[0][i].Zustand,
                Shop: resultShop[0][0].S_Name,
                Land: resultShop[0][0].Land,
                ShopID: resultShop[0][0].ShopID
            }
        }
        output.status = true;
        output.msg = "Abholungen ausgegeben.";
        output.details = count;
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Keine Abholungen!";
    }
    console.log(output);
    res.json(output);    
    return;
}

export const abholungEinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    var kID = await getKiDbyEmail(userEmail);
    if (!kID) {
        output.status = false;
        output.msg = "Kunde konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }  

    try {   
        
        const result = await sql_con.promise().query("SELECT * FROM Auftrag WHERE AuftragID = (?);",
        [req.body.auftragID]);
        const totalPrice = await getTotalPriceOfOrder(req.body.auftragID)

        let date = new Date(result[0][0].A_Datum); //Dies ist notwending um auf die deutsche Zeitzone umzurechnen
        date.setUTCHours(date.getUTCHours() + 1);    

        output.details = {
            Abholnummer: result[0][0].AuftragID,
            KundenID: result[0][0].KundenID,
            ShopID: result[0][0].ShopID,
            Tag: result[0][0].A_Tag,
            Slot: result[0][0].A_Slot,
            Datum: date.toString(),
            Zustand: result[0][0].Zustand,
            Gesamtkosten: totalPrice
        }

        //Produkte und Informationen über Produkte
        try {   
            const [result] = await sql_con
            .promise()
            .query(
                "SELECT * FROM Auftragsdetails b JOIN Produkt p ON b.ProduktID = p.ProduktID WHERE AuftragID = ?", 
                [req.body.auftragID] 
            );
    
            var count = result.length;
            for (var i = 0; i < count; i++) {
                var base64 = result[i].Base64;
                output.data[i] = {
                    ProduktID: result[i].ProduktID, 
                    P_KategorieID: result[i].P_KategorieID,
                    ShopID: result[i].ShopID,
                    P_Name: result[i].P_Name,
                    Preis: result[i].Preis,
                    Marke: result[i].Marke,
                    Material: result[i].Material,
                    Umsatzsteuer: result[i].Umsatzsteuer,
                    Beschreibung: result[i].Beschreibung,
                    Bestellmenge: result[i].Bestellmenge,
                    Bild: base64
                }
            }
        } catch(err) {
            console.log(err);
        }
        output.status = true;
        output.msg = "Abholung ausgegeben.";
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Fehler bei der Ansicht von Abholung! Möglicherweise existiert die Abholung nicht!";
    }
    console.log(output);
    res.json(output);    
    return;
}

export const rechnungenEinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: []
    }; 

    var kID = await getKiDbyEmail(userEmail);
    if (!kID) {
        output.status = false;
        output.msg = "Kunde konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }  

    try {   
        const result = await sql_con.promise().query("SELECT * FROM Auftrag WHERE KundenID = (?) AND Zustand = (?);",
        [kID, "Abgeschloßen"]);

        var count = result[0].length;
        var resultShop;
        var previousShop;
        for (var i = 0; i < count; i++) {
            let date = new Date(result[0][i].A_Datum); //Dies ist notwending um auf die deutsche Zeitzone umzurechnen
            date.setUTCHours(date.getUTCHours() + 1);    

            if (previousShop != result[0][i].ShopID) {
                resultShop = await sql_con.promise().query("SELECT * FROM Shop WHERE ShopID = (?);", [result[0][i].ShopID]);    
            }

            previousShop = result[0][i].ShopID;
            output.data[i] = {
                Abholnummer: result[0][i].AuftragID,
                Datum: date.toString(),
                Zustand: result[0][i].Zustand,
                Shop: resultShop[0][0].S_Name,
                Land: resultShop[0][0].Land,
                ShopID: resultShop[0][0].ShopID
            }
        }
        output.status = true;
        output.msg = "Rechnungen ausgegeben.";
        output.details = count;
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Keine Rechnungen!";
    }
    console.log(output);
    res.json(output);    
    return;
}

export const rechnungEinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }; 

    var kID = await getKiDbyEmail(userEmail);
    if (!kID) {
        output.status = false;
        output.msg = "Kunde konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }  

    try {   
        const result = await sql_con.promise().query("SELECT * FROM Auftrag WHERE AuftragID = (?) AND Zustand = (?);;",
        [req.body.auftragID, "Abgeschlossen"]);
        const totalPrice = await getTotalPriceOfOrder(req.body.auftragID)

        let date = new Date(result[0][0].A_Datum); //Dies ist notwending um auf die deutsche Zeitzone umzurechnen
        date.setUTCHours(date.getUTCHours() + 1);  

        const resultEmployee = await sql_con.promise().query("SELECT MA_Name, MA_Vorname FROM Mitarbeiter WHERE MitarbeiterID = (?);",
        [result[0][0].MitarbeiterID]);
 
        output.details = {
            Abholnummer: result[0][0].AuftragID,
            KundenID: result[0][0].KundenID,
            ShopID: result[0][0].ShopID,
            Tag: result[0][0].A_Tag,
            Slot: result[0][0].A_Slot,
            Datum: date.toString(),
            Zustand: result[0][0].Zustand,
            Gesamtkosten: totalPrice,
            MitarbeiterName: resultEmployee[0][0].MA_Name,
            MitarbeiterVorName: resultEmployee[0][0].MA_Vorname
        }

        //Produkte und Informationen über Produkte
        try {   
            const [result] = await sql_con
            .promise()
            .query(
                "SELECT * FROM Auftragsdetails b JOIN Produkt p ON b.ProduktID = p.ProduktID WHERE AuftragID = ?", 
                [req.body.auftragID] 
            );
    
            var count = result.length;
            for (var i = 0; i < count; i++) {
                var base64 = result[i].Base64;
                output.data[i] = {
                    ProduktID: result[i].ProduktID, 
                    P_KategorieID: result[i].P_KategorieID,
                    ShopID: result[i].ShopID,
                    P_Name: result[i].P_Name,
                    Preis: result[i].Preis,
                    Marke: result[i].Marke,
                    Material: result[i].Material,
                    Umsatzsteuer: result[i].Umsatzsteuer,
                    Beschreibung: result[i].Beschreibung,
                    Bestellmenge: result[i].Bestellmenge,
                    Bild: base64
                }
            }
        } catch(err) {
            console.log(err);
        }
        output.status = true;
        output.msg = "Abholung ausgegeben.";
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg = "Fehler bei der Ansicht von Abholung! Möglicherweise existiert die Abholung nicht!";
    }
    console.log(output);
    res.json(output);    
    return;
}

const warenkorbLeeren = async (wID) => {
    try {   
        await sql_con.promise().query(
            "DELETE FROM Bestelldetails WHERE WarenkorbID = ?",
            [wID] 
        );
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

const getWeekDayFromDate = (day, month, year) => {
    const date = new Date(year, month-1, day);
    date.setHours(12);
    console.log(date)
    const weekdays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
    var dayNum = date.getUTCDay()-1
    if(dayNum < 0) { dayNum = 6; } //Setzt zurück von Montag auf Sonntag, da -1 nicht zulässig ist
    return [weekdays[dayNum], date];
}

const timeframeInSlots = (von, bis, slotSize = 30) => {
    const start = new Date(`01/01/1970 ${von}`);
    const end = new Date(`01/01/1970 ${bis}`);
    const slots = [];
    let current = start;
    while (current <= end) {
        const slot = {
            start: current.toTimeString().substring(0, 8),
            end: new Date(current.getTime() + slotSize * 60000).toTimeString().substring(0, 8),
        };
        slots.push(slot);
        current = new Date(current.getTime() + slotSize * 60000);
    }
    slots.pop(); //Löscht den letzten Eintrag raus, da er Fehlerhaft ist
    return slots
}

// Auftrag storniert = zustand wird zu storniert = Mengen zurücksetzten