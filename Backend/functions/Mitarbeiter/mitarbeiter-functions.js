import { produktAnlegen, produktkategorieneinsehen, produkteeinsehen, produktBearbeiten, produktsuche, produktLoeschen, shopInfos } from "./produkte.js";
import { aufträgeEinsehen, auftragAbschließen, auftragStornieren, auftragNachID } from "./auftrag.js";
import { getLoggedInUser } from "../../utils/user-util.js";
import { arbeitszeitenEinsehen } from "./arbeitszeiten.js";
import { aufgabenEinsehen, aufgabeAendern } from "./aufgaben.js";




export const mitarbeiterFunctions = async (req, res) => {
    console.log(req.body);
    const {email, rolle} = await getLoggedInUser(req, res);

    if (req.body.first == "mitarbeiter") {
        if (req.body.second == "produktAnlegen" || req.body.second == "produktanlegen") {
            produktAnlegen(req, res, email);
        }
        else if (req.body.second == "produktbearbeiten" || req.body.second == "Produktbearbeiten") {
            produktBearbeiten(req, res, email);
        }
        else if (req.body.second == "produktkategorieneinsehen" || req.body.second == "Produktkategorieneinsehen") {
            produktkategorieneinsehen(req, res, email);
        }
        else if (req.body.second == "produkteeinsehen" || req.body.second == "Produkteeinsehen") {
            produkteeinsehen(req, res, email);
        }
        else if (req.body.second == "produktsuche" || req.body.second == "Produktsuche") {
            produktsuche(req, res, email);
        }        
        else if (req.body.second == "produktLoeschen" || req.body.second == "produktloeschen") {
            produktLoeschen(req, res, email);
        }
        else if (req.body.second == "shopinfos" || req.body.second == "shopInfos") {
            shopInfos(req, res, email);
        }   
    }
    else if (req.body.first == "auftrag") {
        if (req.body.second == "auftraegeEinsehen" || req.body.second == "auftraegeeinsehen") {
            aufträgeEinsehen(req, res, email);
        }
        else if (req.body.second == "auftragAbschließen" || req.body.second == "auftragabschließen") {
            auftragAbschließen(req, res, email);
        }
        else if (req.body.second == "auftragStornieren" || req.body.second == "auftragStornieren") {
            auftragStornieren(req, res, email);
        }        
        else if (req.body.second == "auftragNachID" || req.body.second == "auftragnachID") {
            auftragNachID(req, res, email);
        }
    }
    else if (req.body.first == "arbeitszeiten") {
        if (req.body.second == "arbeitszeitenEinsehen" || req.body.second == "arbeitszeiteneinsehen") {
            arbeitszeitenEinsehen(req, res, email);
        }
    }
    else if (req.body.first == "aufgaben") {
        if (req.body.second == "aufgabenEinsehen" || req.body.second == "aufgabeneinsehen") {
            aufgabenEinsehen(req, res, email);
        }        
        if (req.body.second == "aufgabeAendern" || req.body.second == "aufgabeaendern") {
            aufgabeAendern(req, res, email);
        }
    }
}
