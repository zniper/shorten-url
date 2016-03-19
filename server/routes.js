/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

var crypto = require('crypto');
var Dwarf = require('./models/dwarf');

var KEY_PREFIX = 'tinyurl2016-';

            
export default function(app) {
  app.route('/make')
    .post(function(req, res) {
        function getBack(keyURL) {
            var data = {'success': false};
            if (keyURL && typeof(keyURL) != 'undefined') {
                data = {
                    'success': true,
                    'miniKey': keyURL,
                    'miniURL': 'http://' + req.headers.host + '/go/' + keyURL
                };
            }
            res.end(JSON.stringify(data));
        }

        // Check for existence first
        var orgURL = req.body.url; 
        var keyURL = (req.body.hasOwnProperty('key'))?req.body.key:null;
        // Find the URL first
        Dwarf.findOne({url: orgURL}).exec()
        .then(function(doc){
            if (!doc) {
                // Browse the URL address
                var url_mod = require('url');
                var pURL = url_mod.parse(req.body.url);
                var http_mod = require('http'),
                options = {
                    method: 'HEAD',
                    host: pURL.hostname,
                    path: pURL.path,
                    port: pURL.port
                },
                reqProbe = http_mod.request(options, function(r) {
                    if ([200, 301, 302].indexOf(r.statusCode >= 0)) {
                        if (!keyURL) {
                            var shasum = crypto.createHash('sha1');
                            shasum.update(KEY_PREFIX+orgURL);
                            keyURL = shasum.digest('hex').substr(0, 6);
                        }
                        var dwarf = Dwarf.create({
                            key: keyURL,
                            url: orgURL
                        });
                        getBack(keyURL);
                    }
                    getBack();
                });
                reqProbe.end();
            } else {
                getBack(doc.key);
            }
        }, function(stuff){
            getBack();
        });
    });

  app.route('/go/*')
    .get((req, res) => {
        var miniKey = req.url.split('/').pop();
        Dwarf.findOne({key: miniKey})
        .then(function(doc){
            res.redirect(doc.url);
        });
    });

  app.route('/check')
    .get((req, res) => {
        if (req.query.hasOwnProperty('key')) {
            var miniKey = req.query.key;
            Dwarf.findOne({key: miniKey}).exec(function(err, doc){
                var data = (doc != null)?{exist: true}:{exist: false};
                res.end(JSON.stringify(data));
            });
        }
    });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
}
