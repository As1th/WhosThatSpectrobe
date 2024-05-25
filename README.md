# Who's That Spectrobe?

> See http://as1th.github.io/WhosThatSpectrobe/ if you just want to play the game.

A browser-based game in which Spectrobe silhouettes are shown to the user and they guess which Spectrobe it is.

* Silhouettes are generated dynamically in-browser using the canvas tag
* Multiple difficulty settings, which choose the image source for generating the silhouette
* User-facing stats including correct streaks and times taken

## Development (For programmers, not important if you just want to play the game. See link above to play.)

You will need [node and npm](https://nodejs.org/en/) set up to get the code running locally. You will also need to download the Spectrobe images and sounds, because they are not included in this repository. You can download them from https://gearoid.me/pokemon/downloads/pokemedia.zip. Unzip this and put `images/` and `sounds/` in the `public` directory.

Once you have done this, install the dependencies by running:

```
npm install
```

To run the site locally, you can then run:

```
npm run serve
```

To build the site to be deployed online, run:

```
npm run build
```


## Licence
This code is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/).

All the Spectrobe names, images and sounds are copyrighted by Disney.

