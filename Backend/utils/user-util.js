import jwt from "jsonwebtoken";

export const getLoggedInUser = (req, res) => {
  return new Promise((resolve, reject) => {
    const token = req.headers["x-session-token"];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, verified_token) => {
      if (err) {
        console.log(err);
        return res.status(401).json({ 
          message: "Not authorized"
        });
      }
      const { rolle, email } = verified_token;
      resolve({rolle, email});
    });
  });
}

export const haendlerOnly = async (req, res, next) => { //as middleware 
  const {email, rolle} = await getLoggedInUser(req, res);
  if (rolle == "haendler") {
    next();
  } else {
    console.log("no heandler access");
    res.send("Kein Händler");
  }
}

export const mitarbeiterAndHaendler = async (req, res, next) => { //as middleware 
  const {email, rolle} = await getLoggedInUser(req, res);
  if (rolle == "haendler" || rolle == "mitarbeiter") {
    next();
  } else {
    console.log("Kein Mitarbeiter oder Händler");
    res.send("Kein Mitarbeiter oder Händler");
  }
}

export const kundeOnly = async (req, res, next) => { //as middleware 
  const {email, rolle} = await getLoggedInUser(req, res);
  if (rolle == "kunde") {
    next();
  } else {
    console.log("Kein Kunde");
    res.send("Kein Kunde");
  }
}

export const adminOnly = async (req, res, next) => { //as middleware 
  const {email, rolle} = await getLoggedInUser(req, res);
  if (rolle == "admin") {
    next();
  } else {
    console.log("Kein Admin");
    res.send("Kein Admin");
  }
}