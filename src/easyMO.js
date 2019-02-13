/**
 * Simplifies the creation of MutationObservers. Creates and configures a MO
 * based on common use cases, including processing of matching elements already
 * in the DOM and element filtering.
 *
 * @param {HTMLElement} container - an element for which mutations will be
 * tracked 
 * @param {function} handler - a callback function that will be called once
 * mutations occurs with an array of mutation results as argument
 * @param {string} [filter='*'] - a CSS selector to filter mutations by,
 * elements that don't match the selector will be excluded from processing
 * @param {boolean} [purge=false] - boolean indicating whether to delete nodes
 * that don't match the provided selector in the 'filter' argument
 * @param {HTMLElement} [MOsettings] - optional object to pass directly to the
 * MutationObserver constructor. By default the settings are to watch for
 * mutations in the element's child-element list
 *
 * @return {MutationObserver} the MutationObserver instance that was created
 * and configuered
 *
 */
export default function easyMO( container, handler, filter='*', purge=false, MOsettings={childList:true} ) {
  if (container instanceof HTMLElement !== true) {
    throw Error('easyMO: expected an HTMLElement as the first argument, received: «' + container + '»');
  }

  if (typeof handler !== 'function') {
    throw Error('easyMO: expected a handler function as a second argument, received: «' + handler + '»');
  }

  let doFiltering = false;

  if (typeof filter === 'string'
   && filter !== '*'
   && filter !== '') {
    doFiltering = true;
  }

  const MO = new MutationObserver(mutationRecords => {
    const extracted = [];
    if (!mutationRecords || !mutationRecords.length) {
      return;
    }
    for (let mutationRecord of mutationRecords) {
      for (let addition of mutationRecord.addedNodes) {
        if (doFiltering
         && addition.matches( filter ) !== true) {
          if (purge) {
            addition.parentNode.removeChild( addition );
          }

          continue;
        }
        extracted.push(addition);
      }
    }

    if ( extracted.length > 0 ) {
      handler( extracted );
    }
  });

  MO.observe( container, MOsettings );

  let initialElements = [];

  if (purge === true) {
    let inspect = container.firstElementChild;
    while (inspect) {
      let inspectNext = inspect.nextElementSibling;
      if (inspect.matches( filter )) {
        initialElements.push( inspect );
      } else {
        inspect.parentNode.removeChild( inspect );
      }
      inspect = inspectNext;
    }
  } else {
    let children = Array.from( container.children );
    initialElements = children.filter(child => child.matches( filter ));
  }
  handler( initialElements );

  return MO;
};
