'use strict';

const dir = ["true", "1", 1, true].indexOf(process.env.DEVELOPER) != -1 ? 'src' : 'lib'; 

const defender = require('./' + dir + '/defender');
const generator = require('./' + dir + '/generator');

module.exports = function (key, secret) {
    return {
        'defend' : function (developer) {
            return defender.default(key, secret, developer);
        },

        'generate' : function () {
            return generator.default(key, secret);
        }
    };
}