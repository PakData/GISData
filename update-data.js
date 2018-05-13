/*
This script downloads shapefules from the Global Administrative Boundaries
Database and converts the .shp files into GeoJSON and TopoJSON format which is
usable by D3.js.

Installation:

Browse to repository's directory, then:

  > npm install .

Usage:

  > node update-data COUNTRY
  > node update-data COUNTRY TOLERANCE

Where COUNTRY is the country code. If no country code provided, assumed to be
Pakistan (PAK). See https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3 for list
of country codes.

Where TOLERANCE is how much to simplify the geometry in degrees. That is, the
resolution of gepgraphical features to ignore.

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

// GIS dependencies
var shapefile = require("shapefile");
var topojson = require("topojson-server");
var simplify = require("simplify-geojson");
// misc dependencies
var child_process = require("child_process");
var http = require('http');
var fs = require('fs');
var process = require("process");
var unzip = require("unzip");
var glob = require("glob");


// download a file
// http://stackoverflow.com/a/22793628/4591810
function download(url, dest, cb, cbArgs) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);
    });
  });
}

// extract .zip files
function extract(fname, dest, cb) {
  fs.createReadStream(fname)
    .pipe(unzip.Extract({ path: dest }))
    .on('close', cb);
}

// convert to geo and topo JSON
function convert(fpath, tol) {
  var f = fpath.slice(shapeDir.length+1, -4);  // get file basename w/o ext
  var lvl = f.slice(-1);
  var jsonName =  country + '_adm' + lvl + '.json';
  var objName = 'adm' + lvl;     // get name of object (adm0, adm1)
  shapefile.read(fpath, fpath.slice(0, -4) + ".dbf")
    .then(features => {
      features = simplify(features, tol);
      fs.writeFileSync(geoJsonDir + '/' + jsonName,
                        JSON.stringify(features));
      fs.writeFileSync(topoJsonDir + '/' + jsonName,
                        JSON.stringify(topojson.topology({[objName]: features})));
    });
}


var preBaseURL = "http://data.biogeo.ucdavis.edu/data/gadm3.6/shp/gadm36_";
var postBaseURL = "_shp.zip"

var country = process.argv.length >= 3 ? process.argv[2].toUpperCase() : 'PAK';
var tolerance = process.argv.length >= 4 ? parseFloat(process.argv[3]) : 0.01;
var fullURL = preBaseURL + country + postBaseURL;

var zipFile = country + '.zip';           //  basename of doenloaded zip
var shapeDir = country + '-SHP';          //  basename of shapefile dir
var geoJsonDir = country + '-GeoJSON';    //  basename of Geo-JSON dir
var topoJsonDir = country + '-TopoJSON';  //  basename of Topo-JSON dir


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
        convert(matches[i], tolerance);
      };
    });
  });
});