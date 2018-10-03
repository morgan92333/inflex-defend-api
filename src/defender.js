import crypto from 'crypto';

function checkHeaders (req, key, secretKey, developer){
    let secret  = secretKey,
        apiKey  = key,

        nonce   = req.get("Nonce"),
        created = req.get("Created"),
        hisHash = req.get("Hash");

    let a      = new Buffer(crypto.createHash('md5').update(apiKey).digest("hex") + secret).toString('base64'),
        myHash = new Buffer(crypto.createHash('sha1').update(nonce + created + a).digest("hex")).toString('base64');

    if (hisHash == myHash || developer) {
        if (developer && hisHash != myHash)
            console.log('Invalid hash, but developer mode is active');

        return true;
    } else {
        return false;
    }
};

export default function (key, secret, developer = false, error) {
    return (req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE");
        res.setHeader("Access-Control-Allow-Headers", "Hash, Created, Nonce, Authorization, Content-Type");

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        let validHeaders = checkHeaders(req, key, secret, developer);

        if (validHeaders) {
            next();
        } else {
            if (developer) {
                console.log("Secret", secret);
                console.log("ApiKey", key);
        
                console.log("Header nonce", req.get("nonce"));
                console.log("Header created", req.get("created"));
                console.log("Header hash", req.get("hash"));
            }

            if (error) {
                error(req, res);
            } else {
                return res.status(401).json({ 
                    'error' : true,
                    "code" : '4010501',
                    "type" : '',
                    "title" : 'Invalid hash',
                    "detail" : 'Invalid data in header'
                });
            }
        }
    }
}