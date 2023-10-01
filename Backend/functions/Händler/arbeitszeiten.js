import { sql_con } from "../../db/db-config.js";
import { getMiDbyEmail, getShopIDbyMiD } from "./haendler-utils.js";


export const arbeitszeitenEinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    };

    var kw = req.body.kw;

    if (!kw || kw == "" || kw == 0) {
        kw = getKalendarWeek(); //Bekommt die aktuelle Kalenderwoche
    }

    console.log("kw "+ kw)


 try {

    const mID = await getMiDbyEmail(userEmail);
    if (!mID) {
        output.status = false;
        output.msg = "Händler konnte nicht gefunden werden! Bitte neu einloggen.";
        console.log(output);
        res.json(output);
        return
    }

    const sID = await getShopIDbyMiD(mID);
    if (!sID) {
        output.status = false;
        output.msg = "Keine Shops im Besitz!";
        console.log(output);
        res.json(output);
        return
    }

    const [mitarbeiterArray, mitarbeiterDict] = await getMitarbeiterBySID(sID);
    if (!mitarbeiterArray) {
        output.status = false;
        output.msg = "Der Shop hat keine Mitarbeiter";
        console.log(output);
        res.json(output);   
        return
    }

    const weekdays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
    const mitarbeiterData = []

    for (var i = 0; i < mitarbeiterArray.length; i++) {
        console.log(mitarbeiterArray[i]);
        try {
            const result = await sql_con.promise().query("SELECT * FROM Arbeitszeiten JOIN Mitarbeiter ON Mitarbeiter.MitarbeiterID = Arbeitszeiten.MitarbeiterID WHERE AZ_KW = (?) AND Mitarbeiter.MitarbeiterID = (?);",
            [kw, mitarbeiterArray[i]]);

            var workingDays = {};
            for (var j = 0; j < result[0].length; j++) {
                workingDays[result[0][j].AZ_Tag] = {
                start:result[0][j].Start,
                end:result[0][j].Ende
                }
            }

            const schedule = []
            weekdays.forEach((day, index)=>{
                if(workingDays[day]){
                    schedule[index] = {isWorking: true, startTime: workingDays[day]['start'].slice(0, -3), endTime: workingDays[day]['end'].slice(0, -3)}
                }else{
                    schedule[index] = {isWorking: false, startTime: "", endTime: ""}
                }
            })

            mitarbeiterData.push({
                name: result[0][0].MA_Name, 
                vorname: result[0][0].MA_Vorname,
                Arbeitstage: result[0].length, 
                MitarbeiterID: result[0][0].MitarbeiterID,
                schedule}
            )
        } catch(err) {
            const schedule = []
            for (var c = 0; c < 7;c++) {
                schedule[c] = {isWorking: false, startTime: "", endTime: ""}
            }
            console.log(schedule)
            mitarbeiterData.push({
                name: mitarbeiterDict[mitarbeiterArray[i]].Name, 
                vorname: mitarbeiterDict[mitarbeiterArray[i]].Vorname,
                Arbeitstage: 0, 
                MitarbeiterID: mitarbeiterArray[i],
                schedule
            })
        }
        output.status = true;
        output.details = kw;
        output.msg = "Arbeitszeiten zurückgegeben!";    
        output.data = mitarbeiterData;
    }
    res.json(output);   
    return; 
    } catch (err) {
        console.log(err);
        console.log(output);
        res.status(500).json( {
            status: false,
            msg: "Ein Fehler ist aufgetreten!",
            details: {},
            data: [{}]
        });
    }
}

export const arbeitszeitErstellen = async (req, res, userMail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }

    var kw = req.body.kw;


    if (!req.body.id || !req.body.day || !req.body.start || !req.body.end) {
        output.status = false;
        output.msg = "Nicht alle Felder ausgefüllt!";
    } 
    else {
        try {
        if (!req.body.kw || req.body.kw == 0) {
            kw = getKalendarWeek(); //Bekommt die aktuelle Kalenderwoche
        }
        await sql_con.promise().query("INSERT INTO Arbeitszeiten (MitarbeiterID, AZ_KW, AZ_Tag, Start, Ende) VALUES (?, ?, ?, ?, ?);",
        [req.body.id, kw, req.body.day, req.body.start, req.body.end]);
        output.status = true;
        output.msg =  "Neue Arbeitszeit hinzugefügt.";

        } catch (err) {
            console.log(err);
            output.status = false;
            output.msg =  "Arbeitszeit konnte nicht hinzugefügt werden! Möglicherweise arbeitet der Mitarbeiter schon an diesem Tag oder der Input ist falsch!";
        }
    }
    res.json(output);   
    console.log(output);
    return;
}

/*
export const arbeitszeitAendern = async (req, res) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }

    if (!req.body.id || !req.body.day || !req.body.start || !req.body.end) {
        output.status = false;
        output.msg = "Nicht alle Felder ausgefüllt!";
    } 

    try {
        if (!req.body.kw || req.body.kw == 0) {
            kw = getKalendarWeek(); //Bekommt die aktuelle Kalenderwoche
        }

        const [result] = await sql_con.promise().query("UPDATE Arbeitszeiten SET Start = (?), Ende = (?) WHERE AZ_KW = (?) AND MitarbeiterID = (?) AND AZ_Tag = (?);",
        [req.body.start, req.body.end, kw, id, start, end]);

        output.status = true;
        output.msg =  "Arbeitszeit geändert.";
        if (result.affectedRows == 0) {
           //nothing 
        }
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg =  "Arbeitszeit konnte nicht geändert werden! Möglicherweise arbeitet der Mitarbeiter nicht an dem Tag oder der Input ist falsch!";
    }
    res.json(output);   
    console.log(output);
}*/

export const arbeitszeitAendern = async (req, res) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: [{}]
    }

    var kw;
    if (!req.body.data) {
        output.status = false;
        output.msg = "Nicht alle Felder ausgefüllt!";
        console.log(output);
        res.json(output);   
        return
    } 

    try {
        if (!req.body.kw || req.body.kw == 0) {
            kw = getKalendarWeek(); //Bekommt die aktuelle Kalenderwoche
        } else {
            kw = req.body.kw;
        }
        const weekdays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

        try {
            for (var i = 0; i < req.body.data.length; i++) {             // Setzt die Arbeitszeiten pro Mitarbeiter
                var id = req.body.data[i].MitarbeiterID //Mitarbeiter id
                for (var c = 0;c < req.body.data[i].schedule.length; c++) {              // Setzt die Arbeitszeiten pro Tag
                    if (req.body.data[i].schedule[c].startTime != "" && req.body.data[i].schedule[c].endTime != "") {   //Zeiten entfernen
                        try {
                            var result = await sql_con.promise().query("INSERT INTO Arbeitszeiten (MitarbeiterID, AZ_KW, AZ_Tag, Start, Ende) VALUES (?, ?, ?, ?, ?);",
                            [id, kw, weekdays[c], req.body.data[i].schedule[c].startTime, req.body.data[i].schedule[c].endTime]);
                        } catch(err) {
                            // Wenn das insert nicht fuhnktioniert, gibt es schon einen Datensatz. In dem Fall UPDATE:
                            const [result] = await sql_con.promise().query("UPDATE Arbeitszeiten SET Start = (?), Ende = (?) WHERE AZ_KW = (?) AND MitarbeiterID = (?) AND AZ_Tag = (?);",
                            [req.body.data[i].schedule[c].startTime, req.body.data[i].schedule[c].endTime, kw, id, weekdays[c]]);
                        }
                    } else {    
                        // Löschen
                        if (req.body.data[i].schedule[c].startTime || req.body.data[i].schedule[c].endTime) {
                            output.msg = "Bei mindestens einem Eintrag ist nur die Startzeit oder die Endzeit gegeben. Es müssen beide Zeiten gegeben sein. Diese Einträge werden ignoriert.";
                        }
                    }
                }
            }
            output.status = true;
            output.msg +=  "Arbeitszeiten geändert.";
        } catch (err) {
            console.log(err);
            output.status = false;
            output.msg =  "Arbeitszeiten konnten nicht geändert werden.";
        }
    } catch (err) {
        console.log(err);
        output.status = false;
        output.msg =  "Arbeitszeiten konnten nicht geändert werden.";
    }
    res.json(output);   
    console.log(output);
}

export const getMitarbeiterBySID = async (sID) => {
    var mitarbeiterArray = [];
    var mitarbeiterDict = {}
 try {
    const result = await sql_con.promise().query("SELECT MitarbeiterID, MA_Name, MA_Vorname FROM Mitarbeiter WHERE gehoertZuShop = (?) AND istHaendler = (0);",
    [sID]);
    var count = result[0].length;
    for (var i = 0; i < count; i++) {
        mitarbeiterArray.push(result[0][i].MitarbeiterID);
        mitarbeiterDict[result[0][i].MitarbeiterID] = {
            "Name": result[0][i].MA_Name,
            "Vorname": result[0][i].MA_Vorname
        }
    }
    if (count == 0) {
        output.msg = "Keine Mitarbeiter in Ihrem Shop.";
        return [false, false];
    }
    return [mitarbeiterArray, mitarbeiterDict];
    } catch (err) {
        console.log(err);
        return [false, false];
    }
}

export const getKalendarWeek = () => {
    let date = new Date();
    let d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() - d.getUTCDay() + 1);
    let kw = Math.ceil((((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / 8.64e7) + 1) / 7);
    return kw;
}