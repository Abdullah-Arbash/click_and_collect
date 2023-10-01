import { produktInWunschliste, wunschlisteEinsehen, produktAusWunschliste, suchfeld, produktEinsehen} from "./produkte.js";
import { produktInWarenkorb, warenkorbEinsehen, produktAusWarenkorb, warenkorbMengeSetzen} from "./warenkorb.js";
import { shopNachKategorie, produkteAusShop, shopNachShopID, produktkategorienNachShop, produkteNachProduktkatogrie} from "./shops.js";
import { warenkorbBestellen, termineEinsehen, abholungenEinsehen, abholungEinsehen, rechnungenEinsehen, rechnungEinsehen} from "./auftrag.js";
import { getLoggedInUser } from "../../utils/user-util.js";



export const kundeFunctions = async (req, res) => {
    console.log(req.body);
    const {email, rolle} = await getLoggedInUser(req, res);

    if (req.body.first == "produkt") {
        if (req.body.second == "produktInWunschliste" || req.body.second == "produktinwunschliste") {
            produktInWunschliste(req, res, email);
        }
        else if (req.body.second == "wunschlisteEinsehen" || req.body.second == "wunschlisteeinsehen") {
            wunschlisteEinsehen(req, res, email);
        }
        else if (req.body.second == "produktAusWunschliste" || req.body.second == "produktauswunschliste") {
            produktAusWunschliste(req, res, email);
        }
        else if (req.body.second == "suchfeld" || req.body.second == "Suchfeld") {
            suchfeld(req, res, email);
        }           
        else if (req.body.second == "produktEinsehen" || req.body.second == "produkteinsehen") {
            produktEinsehen(req, res, email);
        }           
    }
    else if (req.body.first == "shops") {
        if (req.body.second == "shopNachKategorie" || req.body.second == "shopnachkategorie") {
            shopNachKategorie(req, res, email);
        }   
        else if (req.body.second == "produkteAusShop" || req.body.second == "produkteausshop") {
            produkteAusShop(req, res, email);
        }        
        else if (req.body.second == "shopNachShopID" || req.body.second == "shopnachshopid") {
            shopNachShopID(req, res, email);
        }
        else if (req.body.second == "produktkategorienNachShop" || req.body.second == "produktkategoriennachshop") {
            produktkategorienNachShop(req, res, email);
        }       
        else if (req.body.second == "produkteNachProduktkatogrie" || req.body.second == "produktenachproduktkatogrie") {
            produkteNachProduktkatogrie(req, res, email);
        }

        
        
    }
    else if (req.body.first == "bestellung") {
        if (req.body.second == "warenkorbEinsehen" || req.body.second == "warenkorbeinsehen") {
            warenkorbEinsehen(req, res, email);
        }   
        else if (req.body.second == "produktInWarenkorb" || req.body.second == "produktinwarenkorb") {
            produktInWarenkorb(req, res, email);
        }  
        else if (req.body.second == "produktAusWarenkorb" || req.body.second == "produktauswarenkorb") {
            produktAusWarenkorb(req, res, email);
        }   
        else if (req.body.second == "warenkorbMengeSetzen" || req.body.second == "warenkorbnengesetzen") {
            warenkorbMengeSetzen(req, res, email);
        }           
    }
    else if (req.body.first == "auftrag") {
        if (req.body.second == "warenkorbBestellen" || req.body.second == "warenkorbbestellen") {
            warenkorbBestellen(req, res, email);
        }   
        else if (req.body.second == "termineEinsehen" || req.body.second == "termineeinsehen") {
            termineEinsehen(req, res, email);
        }           
        else if (req.body.second == "abholungenEinsehen" || req.body.second == "abholungeneinsehen") {
            abholungenEinsehen(req, res, email);
        }            
        else if (req.body.second == "abholungEinsehen" || req.body.second == "abholungeinsehen") {
            abholungEinsehen(req, res, email);
        }                
        else if (req.body.second == "rechnungenEinsehen" || req.body.second == "rechnungeneinsehen") {
            rechnungenEinsehen(req, res, email);
        }         
        else if (req.body.second == "rechnungEinsehen" || req.body.second == "rechnungeinsehen") {
            rechnungEinsehen(req, res, email);
        }                
    }
    
    /*
    res.status(400).json({
        message: "Bad request",
        task: `${req.body.first} > ${req.body.second}`
    });*/
}
