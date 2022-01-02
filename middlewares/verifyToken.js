const jwt = require("jsonwebtoken");

function verifyAccessToken(req, res, next) {
  const token = req.header("x-access-token");

  if (!token)
    return res.status(401).send("Access denied, You are not Authenticated");
  const accessToken = token.split(" ")[1];

  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, decoded) {
      if (err) {
        return res.status(403).send("Access denied, Invalid Token");
      } else {
        req.user = decoded;
        next();
      }
    }
  );
}

module.exports = verifyAccessToken;
