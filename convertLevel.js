var fs = require('fs');
var path = require('path');
var PNG = require('pngjs').PNG;
var Promise = require('bluebird');

var levelFilename = process.argv[2];
if (!levelFilename) {
  throw new Error('Level path required');
}
var levelPath = path.dirname(levelFilename);

var impactLevelString = fs.readFileSync(levelFilename, 'utf8');
var startMarker = impactLevelString.indexOf('/*JSON[*/');
var endMarker = impactLevelString.indexOf('/*]JSON*/');
var impactJson = impactLevelString.substring(startMarker + '/*JSON[*/'.length, endMarker);

var level = JSON.parse(impactJson);

// The final tiled level. Start with basic stats.
var maxWidth, maxHeight;
var tiled = {
  orientation: 'orthogonal',
  version: 1,
  tilewidth: level.layer[0].tilesize,
  tileheight: level.layer[0].tilesize,
  tilesets: [],
  layers: []
};

var promises = [];

// For each image in the impact level, make a tileset in tiled.
var tilesetByName = {};
level.layer.forEach(function(l) {
  // Is this the collision layer?
  if (!l.tilesetName) {
    return;
  }
  if (tilesetByName.hasOwnProperty(l.tilesetName)) {
    return;
  }
  maxWidth = Math.max(maxWidth, l.width);
  maxHeight = Math.max(maxHeight, l.height);
  var tileset = {
    image: path.basename(l.tilesetName),
    margin: 0,
    name: path.basename(l.tilesetName, '.png'),
    spacing: 0,
    tilewidth: tiled.tilewidth,
    tileheight: tiled.tileheight
  };
  tilesetByName[l.tilesetName] = tileset;
  tiled.tilesets.push(tileset);
  var src = fs.createReadStream(path.join(levelPath, '..', '..', '..', l.tilesetName));
  var png = new PNG();
  promises.push(new Promise(function(resolve) {
    png.on('parsed', function() {
      tileset.imageheight = png.height;
      tileset.imagewidth = png.width;
      resolve();
    });
  }));
  src.pipe(png);
});

Promise.all(promises).then(function() {
  // Now assign width and height.
  tiled.width = maxWidth;
  tiled.height = maxHeight;
  // Now assign GIDs.
  var firstgid = 1;
  tiled.tilesets.forEach(function(t) {
    t.firstgid = firstgid;
    firstgid += t.imagewidth / tiled.tilewidth * t.imageheight / tiled.tileheight;
  });
}).then(function() {
  // Now convert layer data.
  // Impact uses Array of Arrays, Tiled is straight.
  level.layer.forEach(function(l) {
    // Is this the collision layer?
    if (!l.tilesetName) {
      return;
    }
    var layer = {
      name: l.name,
      opacity: 1,
      width: l.width,
      height: l.height,
      visible: !!l.visible,
      type: 'tilelayer',
      x: 0,
      y: 0,
      data: []
    };
    if (l.distance !== '1') {
      layer.properties = {
        distance: l.distance
      }
    }
    var tileset = tilesetByName[l.tilesetName];
    if (!tileset) {
      throw new Error('Could not find tileset!');
    }
    var firstgid = tileset.firstgid;
    l.data.forEach(function(row) {
      row.forEach(function(column) {
        var value = column > 0 ? column + firstgid - 1 : 0;
        layer.data.push(value)
      });
    });
    tiled.layers.push(layer);
  });
}).then(function() {
  // Now convert entities into an objectlayer.
  var layer = {
    name: 'entities',
    objects: [],
    opacity: 1,
    type: 'objectgroup',
    visible: true,
    x: 0,
    y: 0,
    width: tiled.width,
    height: tiled.height
  };
  layer.objects = level.entities.map(function(e) {
    var o = {
      name: e.type,
      x: e.x,
      y: e.y,
      visible: true,
      type: '',
      width: tiled.tilewidth,
      height: tiled.tileheight,
    };
    // Is there a width/height specified in the settings?
    if (e.settings && e.settings.size) {
      o.width = e.settings.size.x;
      o.height = e.settings.size.y;
      delete e.settings.size;
    }
    // Copy the other settings into the properties...
    if (e.settings) {
      o.properties = e.settings;
      // "target" is special!
      if (e.settings.target) {
        for (var k in e.settings.target) {
          o.properties['target.' + k] = e.settings.target[k];
        }
        // Don't serialize out a target property of null.
        o.properties.target = null;
        delete o.properties.target;
      }
    }
    return o;
  });
  tiled.layers.push(layer);
}).then(function() {
  console.log(JSON.stringify(tiled));
});
