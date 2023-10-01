// Alle Funktionen des Händlers werden hier importiert (app.post.(/API, function) HIER!)
import { mitarbeiterErstellen, mitarbeiterBearbeiten, mitarbeiterEinsehen } from "./mitarbeiter.js";
import { produktkategorieanlegen, produktkategorieaendern, produktkategorieloeschen } from "./sortiment.js";
import { getLoggedInUser } from "../../utils/user-util.js";
import { aufgabeBearbeiten, aufgabeErstellen, aufgabeLöschen, aufgabenEinsehen, mitarbeiterDropdown } from "./aufgaben.js";
import { arbeitszeitenEinsehen, arbeitszeitErstellen, arbeitszeitAendern } from "./arbeitszeiten.js";
import { umsatzImQuartal } from "./verkaufsdaten.js";
import { alleAufträgeEinsehen } from "./auftrag.js";





export const haendlerFunctions = async (req, res) => {
    /* Example request
    Input: {
        first: ‘mitarbeiter’,
        second: ’mitarbeiterErstellen’,
    */

    let output = {    
        status: false,
        msg: '',
        details: {},
        data: [{}]
    }
    const {email, rolle} = await getLoggedInUser(req, res);

    console.log(req.body);

    // if-Anfragen, welche section (aufgaben || mitarbeiter || aufträge || ...) aufgerufen werden soll
    if (req.body.first == "mitarbeiter") {
        if (req.body.second == "mitarbeiterErstellen") {
            mitarbeiterErstellen(req, res, email);
            return;
        }
        else if (req.body.second == "mitarbeiterBearbeiten") {
            mitarbeiterBearbeiten(req, res, email);
            return;
        }
        else if (req.body.second == "mitarbeiterEinsehen") {
            mitarbeiterEinsehen(req, res, email);
            return;
        }    
    }
    else if (req.body.first == "sortiment") {
        if (req.body.second == "Produktkategorieanlegen" || req.body.second == "produktkategorieanlegen") {
            produktkategorieanlegen(req, res, email);
            return;
        } 
        else if (req.body.second == "Produktkategorieaendern" || req.body.second == "produktkategorieaendern") {
            produktkategorieaendern(req, res, email);
            return;
        }  
        else if (req.body.second == "Produktkategorieloeschen" || req.body.second == "produktkategorieloeschen") {
            produktkategorieloeschen(req, res, email);
            return;
        } else {
            //unbekanntes second
        }
    }
    else if (req.body.first == "aufgaben") {
        if (req.body.second == "aufgabenEinsehen") {
            aufgabenEinsehen(req, res, email);
            return;
        }
        else if (req.body.second == "mitarbeiterDropdown") {
            mitarbeiterDropdown(req, res, email);
            return;
        }
        else if (req.body.second == "aufgabeErstellen") {
            aufgabeErstellen(req, res);
            return;
        }
        else if (req.body.second == "aufgabeLöschen") {
            aufgabeLöschen(req, res);
            return;
        }
        else {
            aufgabeBearbeiten(req, res);
            return;
        }
    }
    else if (req.body.first == "verkaufsdaten") {
        if (req.body.second == "umsatzImQuartal" || req.body.second == "umsatzimquartal") {
            umsatzImQuartal(req, res, email);
            return;
        }
    }
    else if (req.body.first == "auftrag") {
        if (req.body.second == "alleAuftraegeEinsehen" || req.body.second == "alleauftraegeeinsehen") {
            alleAufträgeEinsehen(req, res, email);
            return;
        }
    }
    

// Händler: Arbeitszeiten-Section

    else if (req.body.first == "arbeitszeiten") {
        if (req.body.second == "arbeitszeitenEinsehen") {
            arbeitszeitenEinsehen(req, res, email);
            return;
        }
        else if (req.body.second == "arbeitszeitErstellen") {
            arbeitszeitErstellen(req, res);
            return;
        }
        else if (req.body.second == "arbeitszeitAendern") {
            arbeitszeitAendern(req, res);
            return;
        }
    }

    // Sonst schmeiß Fehler
    res.status(400).json({
        message: "Bad request",
        task: `${req.body.first} > ${req.body.second}`
    });
}

