# Dashiest

Orchestrates common operations and plugins used to change the layout and presentation of social-media dashboards/timelines

[desandro/masonry](https://github.com/desandro/masonry) for cascading layout

[desandro/imagesloaded](https://github.com/desandro/imagesloaded) for tracking images loading status

[metafizzy/ev-emitter](https://github.com/metafizzy/ev-emitter) for lifecycle hooks

[stutrek/scrollmonitor](https://github.com/stutrek/scrollmonitor) for element visibility tracking

## Installation

Using NPM:

```shell
npm install -g boffsy/dasuhp
```

## Usage

```js
import { layout } from 'dashiest';

const itemsContainer = document.querySelector('#container');
const options = {
  // DOM element that holds items
  container: itemsContainer,

  // the rest are optional, listed below with default values

  // masonry settings
  initLayout: false,
  fitWidth: true,
  columnWidth: null,
  transitionDuration: 0,

  // unloader settings
  itemIDPropName: 'id',
  unload: true,
  unloadMethod: 'dom', // 'html'

  // CSS selector to define what's a Dash Item
  itemSelector: '',
  removeUnmatching: false
};

var myDash = layout.Dash(options);
```
