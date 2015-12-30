# [Varèse][Varese]-inspired pitch space tools ![Travis status][]

  [Varese]: https://en.wikipedia.org/wiki/Edgard_Var%C3%A8se
  [Travis status]: https://travis-ci.org/WChargin/varese.svg?branch=master

## What?

The gist of it is that if you throw away your contemporary notions of harmony&mdash;in particular, the notion that equivalence classes of pitches are determined by modding out octaves&mdash;then you get some interesting stuff.

### The tree

One of the core concepts at hand is the notion of infoldings and outfoldings of a chord&mdash;say a trichord (three notes) for simplicity. If you have a trichord, you can *outfold* it by &ldquo;pivoting&rdquo; the middle note about the top note (an *upward outfolding*) or the bottom note (a *downward outfolding*), preserving the interval. So C&ndash;E&ndash;G would upfold to C&ndash;G&ndash;B&flat;, preserving the minor third, or downfold to A&flat;&ndash;C&ndash;G, preserving the major third.

The inverse operation is an infolding: pivot one of the outer notes about the middle note. So C&ndash;E&ndash;G could infold to C&ndash;C&sharp;&ndash;E or E&ndash;G&ndash;G&sharp;. But note only the first of those outfolds back to the original, because only the first one puts the folded pitch in the middle. So we see that it's more useful to infold the pitch that makes a smaller interval, and there's a *canonical infolding*.

Thus, the trichords form a (complete, infinite) binary tree: left children are downward outfoldings, and right children are upward outfoldings; parents are canonical infoldings.

This is what the tree explorer ([`/#/tree`](http://wchargin.github.io/varese/#/tree)) allows you to explore.

This is closely related to Var&egrave;se's work.

### The roots

There's also the concept of finding the *acoustic root* of an interval, or, by extension, of a chord.

Suppose we have an interval of two pitches. We want to find some fundamental frequency of which each of the pitches in the interval is an integer multiple. For example, if the pitches are at 500&thinsp;Hz and 300&thinsp;Hz, then the fundamental is 100&thinsp;Hz; if the first pitch were instead 600&thinsp;Hz, the fundamental would be 200&thinsp;Hz.

We can extend that to chords recursively: most concisely, if `intervalRoot : Pitch → Pitch → Pitch`, then define
```haskell
pairwiseRoots :: [Pitch] → [Pitch]
pairwiseRoots ps = zipWith intervalRoot ps (tail ps)

chordRoot :: [Pitch] → Pitch
chordRoot = head ∘ last ∘ takeWhile (not ∘ null) ∘ iterate pairwiseRoots
```
and `chordRoot` gives the root of a chord.

For example, consider the chord C4&ndash;E&flat;4&ndash;F&sharp;4. The root of (C4, E&flat;4) is A&flat;1, and the root of (E&flat;4, F&sharp;4) is B1. The root of (A&flat;1, B1) is E&minus;1. The next iteration would yield the empty list, so we stop here; E&minus;1 is the root of the chord. (Note that the roots get really low really fast: a normal trichord and we're already more than a full octave below the piano!)

If you're paying close attention, you may be wondering how we work with pitches when we really want to be dealing with frequencies&mdash;after all, [they don't always coincide](http://music.stackexchange.com/a/39995/10556)! So how do we convert something like C4&ndash;E4&ndash;G4 to frequency? Simple: we get the user to do it! Specifically, if the user gives us specific acoustic ratios for each of the simple intervals&mdash;e.g., &ldquo;we'll call a minor sixth the ratio of the fifth to the eighth overtones&rdquo;&mdash;we can extrapolate everything we need from there. (We only need ratios because the actual frequencies don't matter.) Going in the other direction is easy because we can get exact values logarithmically, and they should be mostly consistent with the user-specified rationalizations.

This is what the pitch calculator ([`/#/calculator`](http://wchargin.github.io/varese/#/calculator)) calculates.

This is mostly a new area of study.

## Technical overview

The core operations (i.e., the actual calculations and the interesting stuff) are in a thoroughly tested functional core. The UI is as light as possible a React wrapper around this, which makes it really easy to reason about the data flow. We're also starting to write some tests for the React components themselves—both in terms of the DOM output they produce and with simulated user interactions.

The whole React app is [webpack][]ed into a `bundle.js` file, which is included by the HTML page. The HTML page is tiny, and just provides a `<div id="app"></div>` into which React will render the application.

The UI entry point is `index.jsx`, but you really probably want to start looking at either `PitchCalculator` or `TreeExplorer`.

Confused? Looking for API links? Here's the stack: [React][] and [React Router][] for the UI and routing, [Bootstrap][] (not [React-Bootstrap][]) for the CSS (not JS), [Mocha][] and [Chai][] for the unit testing. The global state (configuration and settings) is managed through the wonderful [Redux][] and bound to the UI with [React Redux][]. We use [VexFlow][] for engraving chords.

  [React]: https://facebook.github.io/react/
  [React Router]: https://github.com/rackt/react-router#readme
  [Bootstrap]: http://getbootstrap.com/
  [React-Bootstrap]: http://react-bootstrap.github.io/
  [Mocha]: https://mochajs.org/
  [Chai]: http://chaijs.com/api/bdd/
  [Redux]: https://github.com/rackt/redux
  [React Redux]: https://github.com/rackt/react-redux
  [VexFlow]: http://www.vexflow.com/

The tool stack includes [webpack][] for the module bundling and [babel][] for the ES2015-and-up desugarings.

  [webpack]: https://webpack.github.io/
  [babel]: https://babeljs.io/

## Building

```shell
$ cd varese
$ npm install
$ npm test
$ npm start
$ open http://localhost:8080/
```

This will start a development server with hot reloading enabled: just change the JSX files and you shouldn't even have to refresh the page to see your changes. If your changes aren't going through, try `touch`ing the file you changed.

## Deploying

```shell
$ git commit -m "do a thing"
$ ./deploy.sh
```
You should also probably push to `master`.

You may have to restart your development server after deploying to get your hot loading working again. Just hit `^C` and run `npm start` again.
