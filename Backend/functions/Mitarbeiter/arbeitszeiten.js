import { sql_con } from "../../db/db-config.js";
import { getMiDbyEmail } from "../Händler/haendler-utils.js";


export const arbeitszeitenEinsehen = async (req, res, userEmail) => {
    let output = {
        status: false,
        msg: "",
        details: {},
        data: []
    };

    var kw = req.body.kw;

    if (!kw || kw == "" || kw == 0) {
        kw = getKalendarWeek(); //Bekommt die aktuelle Kalenderwoche
    }

    try {
        const mID = await getMiDbyEmail(userEmail);
        if (!mID) {
            output.status = false;
            output.msg = "Mitarbeiter konnte nicht gefunden werden! Bitte neu einloggen.";
            console.log(output);
            res.json(output);
            return
        }
        console.log(mID)

        const weekdays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
        var result;
        try {
            result = await sql_con.promise().query("SELECT * FROM Arbeitszeiten JOIN Mitarbeiter ON Mitarbeiter.MitarbeiterID = Arbeitszeiten.MitarbeiterID WHERE AZ_KW = (?) AND Mitarbeiter.MitarbeiterID = (?);",
            [kw, mID]);

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
                    schedule[index] = {isWorking: false, startTime: null, endTime: null}
                }
            });

            output.data = schedule 
            output.status = true;
            output.details = kw;
            output.msg = "Arbeitszeiten zurückgegeben!";    
        } catch(err) {
            console.log(err)
            // Fehler beim lesen fetchen der KW --> Mitarbeiter arbeitet garnicht
            const schedule = []
            for (var c = 0; c < 7;c++) {
                schedule[c] = {isWorking: false, startTime: null, endTime: null}
            }
            console.log(schedule)
            output.data = schedule;
            output.status = true;
            output.details = kw;
            output.msg = "Keine Arbeitszeit in der Woche.";    
        }
    } catch (err) {
        console.log(err);
        console.log(output);
        output.status = false,
        output.msg = "Ein Fehler ist aufgetreten!"
    }
    res.json(output);   
}

export const getKalendarWeek = () => {
    let date = new Date();
    let d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() - d.getUTCDay() + 1);
    let kw = Math.ceil((((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / 8.64e7) + 1) / 7);
    return kw;
}