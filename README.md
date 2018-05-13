# GISData

Geographical data files for Pakistan. This repository contains shapefiles and
Topo/Geo-JSON files for Pakistan.

## Heirarchy

Each directory has files containing boundaries on 4 levels:

* adm0 - National
* adm1 - Provincial
* adm2 - Division
* adm3 - District

Each file is labeled accoring to it's level for e.g. `PAK-GeoJSON/PAK_adm1.json`
contains provincial boundaries.

Topologies in TopoJSON files are stored under the object names: `adm0`, `adm1`
...

## JSON structure

The [D3.js][10] library natively uses GeoJSON to plot maps in browsers. However,
Topo-JSON formats can be smaller. The [topojson][11] module can be used to
convert between formats on the client side.

### Geo-JSON

```js
{
    type: FeatureCollection
    // an array of features corresponding to the administrative level
    // for e.g adm0 has a single feature in the array i.e the national boundary
    features: [
        {
            type: Feature,
            // a feature for admX has X+1 features of type NAME_0,...,NAME_X-1
            // corresponding to the geographic division names
            properties: {
                NAME_0: Pakistan,
                NAME_1: Baluchistan,
                NAME_2: Quetta,
                ...
            },
            geometry: {
                type: MultiPolygon,
                coordinates: [...]
            }
        },
        ...
    ]
}
```

### Topo-JSON

```js
{
    type: Topology
    objects: {
        // admX for one of adm0, adm1, adm2, adm3
        admX: {
            type: GeometryCollection,
            // coordinates of bounding box of features
            bbox: [xmin, ymin, xmax, ymax]
            // an array of features corresponding to the administrative level
            // for e.g adm0 has a single feature in the array i.e the national 
            // boundary
            geometries: [
                {
                    type: MultiPolygon,
                    // a feature for admX has X+1 features of type NAME_0,...,
                    // NAME_X-1 corresponding to the geographic division names
                    properties: {
                        NAME_0: Pakistan,
                        NAME_1: Baluchistan,
                        NAME_2: Quetta,
                        ...
                    },
                    arcs: [...]
                },
                ...
            ]
        }
        ...
    },
    // An array of coordinates defining arcs. Each geometry in objects simply
    // references these arcs by index. This ensures that shared boundaries are
    // not repeated twice.
    arcs: [...]
}
```

## Updating

To update this data set, first install the `update-data.js` script. You will
need to have *Node.js* installed.

```
> npm install .
```

After installation you can run the script

```
> node update-data.js [COUNTRY [TOLERANCE]]
```

Where `COUNTRY` is the country code. If no country code provided, assumed to be
Pakistan (PAK). See [wikipedia][9] for a list of country codes.

Where `TOLERANCE` is how much to simplify the geometry in degrees. That is, the
resolution of gepgraphical features to ignore.

## Reducing File Size

GeoJSON files can be simplified by using [`simplify-geojson`][5] (a node
package).

TopoJSON files can be simplified by using [`topojson-simplify`][6] (a node
package).

## More

More information on shape files can be found [here][1].

More information on GeoJSON files can be found [here][2] and [here][7].

More information on TopoJSON files can be found [here][8].

These files can be visualized at [mapshaper][4].


## Acknowledgements

The data files were obtained from the [Global Administrative Boundaries Database][3].

[1]: https://en.wikipedia.org/wiki/Shapefile
[2]: https://en.wikipedia.org/wiki/GeoJSON
[3]: http://gadm.org
[4]: http://mapshaper.org/
[5]: https://github.com/maxogden/simplify-geojson
[6]: https://github.com/topojson/topojson-simplify
[7]: https://tools.ietf.org/html/rfc7946
[8]: https://github.com/topojson/topojson-specification
[9]: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3
[10]: https://d3js.org
[11]: https://github.com/topojson/topojson