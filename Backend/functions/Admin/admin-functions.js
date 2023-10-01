import { getLoggedInUser } from "../../utils/user-util.js";
import { shopkategorieErstellen, shopkategorieEntfernen } from "./shopkategorie.js";
import { haendlerEinsehen, haendlerStatusFestlegen, haendlerShopKategorieFestlegen } from "./haendler.js";
import { benutzerEinsehen } from "./benutzer.js";
import { logEinsehen } from "./log.js";


export const adminFunctions = async (req, res) => {
    const {
        first,
        second
    } = req.body;

    const {email, rolle} = await getLoggedInUser(req, res);

    if(first == "shopkategorie"){
        if (second == "shopkategorieErstellen" || second == "shopkategorieerstellen"){
            shopkategorieErstellen(req, res, email);
            return;
        }
        if (second == "shopkategorieEntfernen" || second == "shopkategorieentfernen"){
            shopkategorieEntfernen(req, res, email);
            return;
        }   
    }
    else if (first == "haendler"){
        if (second == "haendlerEinsehen" || second == "haendlereinsehen"){
            haendlerEinsehen(req, res, email);
            return;
        }
        else if (second == "haendlerStatusFestlegen" || second == "haendlerStatusFestlegen"){
            haendlerStatusFestlegen(req, res, email);
            return;
        }              
        else if (second == "haendlerShopKategorieFestlegen" || second == "haendlershopkategoriefestlegen"){
            haendlerShopKategorieFestlegen(req, res, email);
            return;
        }        

        
    }
    else if (first == "benutzer"){
        if (second == "benutzerEinsehen" || second == "benutzereinsehen"){
            benutzerEinsehen(req, res, email);
            return;
        };        
    }    
    else if (first == "log"){
        if (second == "logEinsehen" || second == "logeinsehen"){
            logEinsehen(req, res, email);
            return;
        };        
    }

    // Sonst schmeiß Fehler
    res.status(400).json({
        message: "Bad request",
        task: `${req.body.first} > ${req.body.second}`
    });
}