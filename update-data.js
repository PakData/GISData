/*
This script downloads shapefules from the Global Administrative Boundaries
Database and converts the .shp files into GeoJSON and TopoJSON format which is
usable by D3.js.

Installation:

Browse to repository's directory, then:

  > npm install .

Usage:

  > node update-data COUNTRY
  > node update-data

Where COUNTRY is the country code. If no country code provided, assumed to be
Pakistan (PAK). See https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3 for list
of country codes.

The resulting directory structure is:

  ./
  COUNTRY-SHP/
  ....  shapefiles
  COUNTRY-GeoJSON/
  ....  json files
  COUNTRY-TopoJSON/
  ....  json files

The GeoJSON files can be simplified by using simplify-geojson (a node package).
The TopoJSON files can be simplified by using topojson-simplify (a node package).
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
var shp2json = process.platform === 'win32' ? 'shp2json.cmd ' : 'shp2json ';
var geo2topo = process.platform === 'win32' ? 'geo2topo.cmd ' : 'geo2topo ';

var zipFile = country + '.zip';
var shapeDir = country + '-SHP';
var geoJsonDir = country + '-GeoJSON';
var topoJsonDir = country + '-TopoJSON';


// download country specific .zip file
download(fullURL, zipFile, function() {

  // extract to folder containing shape files
  extract(zipFile, shapeDir, function() {

    // delete .zip file
    fs.unlinkSync(zipFile);
    // get list of all .shp files
    glob(shapeDir + '/*.shp', function(err, matches) {

      // make directory for JSON files
      fs.existsSync(geoJsonDir) || fs.mkdirSync(geoJsonDir);
      fs.existsSync(topoJsonDir) || fs.mkdirSync(topoJsonDir);
      // convert each .shp file to Geo/TopoJSON
      for (var i=0; i < matches.length; i++) {
        var f = matches[i].slice(shapeDir.length+1, -4);
        child_process.execSync(shp2json + matches[i] + ' -o ' + geoJsonDir + '/' + f + '.json');
        var objName = f.slice(country.length+1);
        child_process.execSync(geo2topo + objName + '=' + geoJsonDir + '/' + f + '.json' + ' > ' + topoJsonDir + '/' + f + '.json');
      };
    });
  });
});