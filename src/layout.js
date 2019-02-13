import Masonry from 'masonry-layout';
import ImagesLoaded from 'imagesloaded';
import EvEmitter from 'ev-emitter';
import scrollMonitor from 'scrollmonitor';

import easyMO from './easyMO';
import unloadElem from './unloadElem';
import onInOut from './onInOut';

const CLASS_INCLUDED = 'dup-item';
const CLASS_PROCESSED = 'dup-processed';

/**
 * Settings
 * @typedef {Object} Settings
 * @property {HTMLElement} container - DOM Element to set up as a dash
 * container
 * @property {boolean} [initLayout=false]
 * @property {boolean} [fitWidth=true] - Masonry - indicates if the width of
 * the dash container should be adjusted to the span of the items rather than
 * fill the entire space (this enables centering items)
 * @property {?number} [columnWidth] - the width in pixels for each dashboard
 * column
 * @property {number} [transitionDuration=0] - controls the length of the
 * animation of adding new items. use '0' to disable animation altogether
 * @property {string} [itemIDPromName='id'] - name of HTML attribute that
 * contains each Dash-Item's ID or unique value, for use with unloading.
 * Defaults to the the 'id' property
 * @property {boolean} [unload=true] - unload elements that are scrolled away
 * from the page to improve performance when there are a lot of Dash-Items in a
 * page
 * @property {string} [unloadMethod='dom'] - the unloading technique for the
 * Dash, valid values are 'dom' (default), or 'html' (might break media
 * players)
 * @property {string} [inOutTrackingOrder] - the unloading strategy for the
 * Dash items, as accepted by 'onInOut' module
 * @property {string} [itemSelector='*'] - CSS selector string to define what is
 * considered a Dash-Item. By default, every child element of the Container will
 * be considered a Dash-Item
 * @property {boolean} [removeUnmatching=false] - indicates whether to remove
 * from the dash elements that don't match the itemSelector value
 */

/**
 * Create a new Dash instance
 *
 * @constructor
 * @param {Settings} [settings]
 * 
 * @return {object}
 */
function Dash(settings = {}) {
  if (this instanceof Dash !== true) {
    return new Dash(settings);
  }

  /**
   * @property {HTMLElement} settings.container
   */
  if (settings.container instanceof HTMLElement) {
    this.container = settings.container;
  } else {
    throw Error(`Dash(): 'container' property in settings must be an HTMLElement`);
  }

  const events = this.events = new EvEmitter();

  for (let prop in settings) {
    if (prop.startsWith('on')) {
      const eventName = prop[2].toLowerCase() + prop.substring(3);
      events.on(eventName, settings[prop]);
    }
  }

  this.itemSelector = typeof settings.itemSelector === 'string'
                    ? settings.itemSelector
                    : '*';

  this.initLayout = typeof settings.initLayout === 'boolean'
                  ? settings.initLayout
                  : false;

  this.fitWidth = typeof settings.fitWidth === 'boolean'
                ? settings.fitWidth
                : true;

  this.columnWidth = typeof settings.columnWidth === 'number'
                   ? settings.columnWidth
                   : null;

  this.transitionDuration = typeof settings.transitionDuration === 'string'
                          ? settings.transitionDuration
                          : 0;


  this.itemIDPropName = typeof settings.itemIdProp === 'string'
                      ? settings.itemIdProp 
                      : 'id';

  this.unload = typeof settings.unload === 'boolean'
              ? settings.unload
              : true;

  this.unloadMethod = typeof settings.unloadMethod === 'string'
                    ? settings.unloadMethod
                    : 'dom';

  this.inOutTrackingOrder = typeof settings.inOutTrackingOrder === 'string'
                          ? settings.inOutTrackingOrder
                          : null;

  this.removeUnmatching = typeof settings.removeUnmatching === 'boolean'
                    ? settings.removeUnmatching
                    : false;

  if (typeof this.itemSelector === 'string'
   && this.itemSelector !== ''
   && this.itemSelector !== '*') {
    this.filter = this.itemSelector;
  }
}

Dash.prototype = Object.create(EvEmitter.prototype);

/**
 * Destroys the Dash instance and its building blocks
 */
Dash.prototype.destroy = function() {
  /**
   * When a Dash instance is about to be destroyed
   *
   *  @event Dash#unload
   */
  this.events.emit('unload');
  this.masonry.destroy();
  this.mo.disconnect();
};

/**
 * Gets called for every Dash-Item as it is found
 * @param {HTMLElement} item - the item to be processed
 */
Dash.prototype.processItem = function(item) {
  /**
   * When a Dash-Item is detected and will be processed
   *
   * @event Dash#itemFound
   * @type {HTMLElement}
   */
  this.events.emitEvent('itemFound', [item]);

  item.classList.add(CLASS_INCLUDED);

  if (this.unloader) {
    const elemUnloader = this.unloader.addElem(item);
    const elemTracker = onInOut(
      item,
      /**
       * When a Dash-Items is scrolled into view
       * @event Dash#itemVisible
       * @type {HTMLElement}
       */
      () => {
        this.events.emitEvent('itemVisible', [item]);
        elemUnloader.reload();
      },
      /**
       * When a Dash-Items is scrolled completely out of you
       * @event Dash#itemHidden
       * @type {HTMLElement}
       */
      () => {
        this.events.emitEvent('itemHidden', [item]);
        elemUnloader.unload();
      },
      this.inOutTrackingOrder
    );
  }

  /**
   * When a Dash-Item was processed
   *
   * @event Dash#itemProcessed
   * @type {HTMLElement}
   */
  this.events.emitEvent('itemProcessed', [item]);

  return item;
}

Dash.prototype.observe = function () {
  let first = true;
  const itemNormalizer = this.processItem.bind(this);

  const mutationObserver = this.mo = easyMO(
    this.container,
    (items) => {
      /**
       * When a batch of Dash-Items is found
       *
       * @event Dash#batchFound
       * @type {array<HTMLElement>}
       */
      this.events.emitEvent('batchFound', [items]);

      items.map(itemNormalizer);

      if (this.firstLayout !== true) {
        this.firstLayout = true;
      } else {
        this.masonry.addItems(items);
      }

      /**
       * When a batch of Dash-Items is processed
       *
       * @event Dash#batchProcessed
       * @type {array<HTMLElement>}
       */
      this.events.emitEvent('batchProcessed', [items]);

      ImagesLoaded(items, loadedItems => {
        this.events.emitEvent('batchImgsLoaded', [items]);
        this.masonry.layout(loadedItems);

        /**
         * When images for all Dash-Item in the Batch have loaded
         *
         * @event Dash#batchImgsLoaded
         * @type {array<HTMLElement>}
         */
        this.events.emitEvent('batchImgsLoaded', [items]);
        items.map(item => item.classList.add(CLASS_PROCESSED));
      });
    },
    this.filter,
    this.removeUnmatching
  );

  return {
    masonry: this.masonry,
    mutationObserver,
  };
}

Dash.prototype.init = function () {
  const {
    initLayout,
    fitWidth,
    transitionDuration,
    columnWidth,
  } = this;

  const masonrySetup = {
    initLayout,
    fitWidth,
    transitionDuration,
    columnWidth,
  };

  const masonry = this.masonry = new Masonry(this.container, masonrySetup);

  masonry.on('layoutComplete', (items) => {
    /**
     * Element batch laid-out event
     *
     * @event Dash#createLayout
     * @type {array<HTMLElement>}
     */
    this.events.emitEvent('batchLaidOut', [items]);
  });

  masonry.layout();

  if (this.unload !== false) {
    const unloader = this.unloader = unloadElem(
      this.itemIDPropName,
      this.unloadMethod === 'dom'
    );
  }

  const mutationObserver = this.observe();

  return this;
}

export default {
  Masonry,
  ImagesLoaded,
  scrollMonitor,
  Dash: function(settings) {
    const dash = new Dash(settings);
  
    dash.init();

    return dash;
  },
};
