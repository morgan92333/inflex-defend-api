import crypto from 'crypto';

const cantOldHash = 'VuMgRVOwgViXHo1QwiEGMSZOjtEgcMbYGJOHkkIdLJbXIoKIWdBaclgVDam7nVbWHYIKKWgp53vp79lFVOOOHnyUVMpiB4C4hYDUAg9otdXt6ZocGHP0j4QxKXYd30cf6HGemEqCarx4u1Cc9YrrV8Uj45NvktsQXr64EwsLbIZECmBOCUbhQkXZkf6yrn3IWEGZkeLSsGlftCn6IW3kY0Du504aEugPHVhrBKkzVzL1ePhOF2rdK2RhF6YfpHUdr3b3Z3hBZ9yHBBXRCiwbvMZTVJ3E7eVGaiAOPP2q1aAfZxUfTWCOqmg6dhqekB8nRJ3sOttK6UnJFtE8uBsLjOCw8GvAL8j4DTmI';

function checkHeaders (req, key, secretKey, developer, canFromHoro){
    let secret  = key,
        apiKey  = secretKey,

        timestamp = Math.round(new Date() / 1000),

        nonce   = req.get('Nonce'),
        created = req.get('Created'),
        hisHash = req.get('Hash'),

        horoHash = process.env.APIDEFENDER_OLDHASH || cantOldHash,
        cantOld  = req.get('From-Horo');

    let a      = Buffer.from(crypto.createHash('md5').update(apiKey).digest('hex') + secret).toString('base64'),
        myHash = Buffer.from(crypto.createHash('sha1').update(nonce + created + a).digest('hex')).toString('base64');

    if (hisHash == myHash) {
        if (true || timestamp - 30 < parseInt(created)) {
            return true;
        } else {
            if (canFromHoro && cantOld && cantOld == horoHash) {
                console.log('This is old, but sent from Horo');

                return true;
            } else {
                if (developer)
                    console.error('This token is old');

                return false;
            }
        }
    } else {
        return false;
    }
};

export default function (key, secret, developer = false, canFromHoro = false, excepts = [], error = null) {
    return (req, res, next) => {
        if (developer) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Hash, Created, Nonce, Authorization, Content-Type');

            res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }

        let validHeaders = checkHeaders(req, key, secret, developer, canFromHoro),
        
            path,
            isExcept = false;

        if (req.path)
            path = req.path;
        else if (req.originalUrl)   
            path = req.originalUrl;
        else
            path = '/';

        for (let except of excepts) {
            let patt = new RegExp(except);

            if (patt.test(path)) {
                isExcept = true;
            }
        }

        let canContinue = isExcept || validHeaders;

        if (developer || canContinue) {
            if (developer && !canContinue)
                console.log('Invalid hash, but developer mode is active');

            next();
        } else {
            if (developer) {
                console.log('Secret', secret);
                console.log('ApiKey', key);
        
                console.log('Header nonce', req.get('nonce'));
                console.log('Header created', req.get('created'));
                console.log('Header hash', req.get('hash'));
            }

            if (error) {
                error(req, res);
            } else {
                return res.status(401).json({ 
                    'success' : false,
                    'error' : {
                        'code' : '4010501',
                        'type' : '',
                        'title' : 'Invalid hash',
                        'detail' : 'Invalid data in header'
                    }
                });
            }
        }
    }
}