# impact-level-to-tiled

Convert an ImpactJS level to Tiled JSON format.

## Overview

A teensy tiny utility that won't work for anyone but me because it makes
tons of assumptions:

* All your tiles across all your layers are the same size.
* All your tileset images are PNGs.
* The height and width of your Tiled map should be the max of the width
  and height of your Impact layers.
* Your collision layer doesn't really have important information in it.
* Your entities don't have complicated `settings` from Weltmeister
  beyond the `target`.
* You wanted to represent your entities as objects in an `objectlayer`.

There's probably a raft of other assumptions too, like:

* You're using the standard `lib/game/levels` directory structure.
* Hell, I dunno, you're running OSX probably.

Stuff like that. Use at your own risk.

I haven't spent a lot of time with Tiled to figure out how it knows where to look
for image files, so it's probably a miracle that it worked for me like it did.

## Usage

First download, then run `npm install`. Then do:

```
   node convertLevel.js path/to/impact/level.js > nameOfLevel.json
```

And, assuming you made all the same assumptions I did, you'll have something
that looks like a Tiled map. Load it up to see.

## License

Copyright (c) 2015 David Hayes

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
