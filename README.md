# GISData
Geographical data files for Pakistan.

This repository contains shapefiles and Topo/Geo-JSON files for Pakistan.


## Heirarchy

Files contain boundaries on 4 levels:

* 0 - National
* 1 - Provincial
* 2 - Division
* 3 - District

Each file is labeled accoring to it's level for e.g. `PAK-GeoJSON/PAK_adm1.json`
contains provincial boundaries.

Topologies in TopoJSON files are stored under the object names: `adm0`, `adm1` ...

## Updating

To update this data set, first install the `update-data.js` script. You will
need to have *Node.js* installed. Additionally the `shapefile` and `topojson-server`
node modules should be globally installed.

```
> npm install .
```

After installation you can run the script

```
> node update-data.js
```

Updates depend on how frequently to original database is changed.

GeoJSON files can be simplified by using `simplify-geojson` (a node package).
TopoJSON files can be simplified by using `topojson-simplify` (a node package).

## Reducing File Size

The detail in the GeoJSON files can be reduced which shrinks files. Use
[simplify-geojson][5] package to simplify the downloaded GeoJSON files.

## More

More information on shape files can be found [here][1].

More information on GeoJSON files can be found [here][2].

These files can be visualezed at [mapshaper][4].


## Acknowledgements

The data files were obtained from the [Global Administrative Boundaries Database][3].

[1]: https://en.wikipedia.org/wiki/Shapefile
[2]: https://en.wikipedia.org/wiki/GeoJSON
[3]: http://gadm.org
[4]: http://mapshaper.org/
[5]: https://www.npmjs.com/package/simplify-geojson