import crypto from 'crypto';

function generateNonce() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 10; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

export default function (secret, key) { 
    let nonce   = generateNonce(),
        created = Math.round(new Date() / 1000),

        a      = Buffer.from(crypto.createHash('md5').update(key).digest("hex") + secret).toString('base64'),
        myHash = Buffer.from(crypto.createHash('sha1').update(nonce + created + a).digest("hex")).toString('base64');

    return {
        'Nonce' : nonce,
        'Created' : created,

        'Hash' : myHash
    }
}
