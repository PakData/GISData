/*
This script downloads shapefules from the Global Administrative Boundaries
Database and converts the .shp files into TopoJSON format which is usable
by D3.js.

Installation:

Browse to repository's directory, then:

  > npm install .

Usage:

  > node update-data COUNTRY
  > node update-data

Where COUNTRY is the country code. If no country code provided, assumed to be
Pakistan (PAK).

The resulting directory structure is:

  ./
  COUNTRY-SHP/
  ....  shapefiles
  COUNTRY-GeoJSON/
  ....  json files

The GeoJSON files can be simplified by using simplify-geojson (a node package).
*/


'use strict';

var shapefile = require("shapefile");
var child_process = require("child_process");
var http = require('http');
var fs = require('fs');
var process = require("process");
var unzip = require("unzip");
var glob = require("glob");


// download a file
// http://stackoverflow.com/a/22793628/4591810
var download = function(url, dest, cb, cbArgs) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);
    });
  });
}

// extract .zip files
var extract = function(fname, dest, cb) {
  fs.createReadStream(fname)
    .pipe(unzip.Extract({ path: dest }))
    .on('close', cb);
}


var preBaseURL = "http://biogeo.ucdavis.edu/data/gadm2.8/shp/";
var postBaseURL = "_adm_shp.zip"

var country = process.argv.length >= 3 ? process.argv[3].toUpperCase() : 'PAK';
var fullURL = preBaseURL + country + postBaseURL;
var command = process.platform === 'win32' ? 'shp2json.cmd ' : 'shp2json ';

var zipFile = country + '.zip';
var shapeDir = country + '-SHP';
var jsonDir = country + '-GeoJSON';


// download country specific .zip file
download(fullURL, zipFile, function() {

  // extract to folder containing shape files
  extract(zipFile, shapeDir, function() {

    // delete .zip file
    fs.unlinkSync(zipFile);
    // get list of all .shp files
    glob(shapeDir + '/*.shp', function(err, matches) {

      // make directory for JSON files
      fs.existsSync(jsonDir) || fs.mkdirSync(jsonDir);
      // convert each .shp file to TopoJSON
      for (var i=0; i < matches.length; i++) {
        var f = matches[i].slice(shapeDir.length, -3);
        child_process.exec(command + matches[i] + ' -o ' + jsonDir + '/' + f + 'json');
      };
    });
  });
});