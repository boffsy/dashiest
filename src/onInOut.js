/**
 *  @param {HTMLElement} element - element to watch
 *  @param {function} onIn - function to call back when element is becoming
 *  visible
 *  @param {function} onOut - function to call back when element is out of
 *  sight
 *  @param {string} [strategy] - string representing a recipe for visibility
 *  tracking
 */
export default function onInOut(element, onIn, onOut, strategy) {

  const elementWatcher = scrollMonitor.create( element );

  switch (strategy) {
    case 'activateOnEnter': {
      elementWatcher.enterViewport(function() {
        elementWatcher.exitViewport(onOut);
        onIn();
      });

      break;
    }

    case 'independent': {
      elementWatcher.enterViewport(onIn);
      elementWatcher.exitViewport(onOut);

      break;
    }

    case 'enterOnly': {
      elementWatcher.enterViewport(onIn);

      break;
    }

    case 'exitOnly': {
      elementWatcher.exitViewport(onOut);

      break;
    }

    case 'activateOnExit':
    default: {
      elementWatcher.exitViewport(function() {
        elementWatcher.enterViewport(onIn);
        onOut();
      });

      break;
    }
  }


  return elementWatcher;
}
