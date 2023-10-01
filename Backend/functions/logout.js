import jwt from "jsonwebtoken";

//Funktioniert noch nicht
export const logoutHandler = async (req, res) => { 
    const token = req.headers["x-session-token"];
    jwt.sign(token, "", { expiresIn: 1 }, (logout, err) => {
    if (logout) {
            res.send({msg : 'You have been Logged Out'});
        } else {
            res.send({msg: 'Error'});
        }
    });
}