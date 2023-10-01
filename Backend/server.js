// Node
import express from "express";

import cors from "cors";
import bodyParser from "body-parser";

// Imports
import { regHandler } from "./functions/registrieren.js";
import { loginHandler } from "./functions/login.js";
import { logoutHandler } from "./functions/logout.js";
import { haendlerOnly, mitarbeiterAndHaendler, adminOnly, kundeOnly } from "./utils/user-util.js";
import { verifyEmail, passwordReset, requestPasswordReset } from "./utils/email-util.js";

import { haendlerFunctions } from "./functions/Händler/haendler-functions.js";
import { mitarbeiterFunctions } from "./functions/Mitarbeiter/mitarbeiter-functions.js";
import { adminFunctions } from "./functions/Admin/admin-functions.js";
import { kundeFunctions } from "./functions/Kunde/kunde-functions.js";

import { profilBearbeiten, profilEinsehen } from "./functions/profile.js";
import { shopkategorieEinsehen } from "./functions/shopkategorie.js";

// Express einstellungen
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// Login und Registrierung
app.post("/reg", regHandler);
app.post("/login", loginHandler);
app.post("/logout", logoutHandler);


// Email Verifikation
app.get("/email-verifizieren", verifyEmail);

// Passwort vergessen
app.get("/passwort-zuruecksetzen", passwordReset);
app.post("/passwort-vergessen", requestPasswordReset);

// Profil
app.post("/change-profile", profilBearbeiten);
app.post("/view-profile", profilEinsehen);

// Allgemeines
app.post("/shopcategories", shopkategorieEinsehen);

// API-Schnittstelle Händler
app.post("/haendler-functions", haendlerOnly, haendlerFunctions);

// API-Schnittstelle Admin
app.post("/admin-functions", adminOnly, adminFunctions);

// API-Schnittstelle Mitarbeiter
// Jede Mitarbeiter Funktion ist auch für Händler verfügbar
app.post("/mitarbeiter-functions", mitarbeiterAndHaendler, mitarbeiterFunctions);

// API-Schnittstelle Kunde
app.post("/kunde-functions", kundeOnly, kundeFunctions)


// Startet den Server
app.listen(5000, () => {
  console.log("server startet in port 5000");
});

console.log(process.versions.node);