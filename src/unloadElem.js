const UNLOADED_CLASS = 'ulded';

/**
 * A utility to remove DOM elements from a page when they are out of view, to
 * increase performance from a perspective of repaints/relayouts
 *
 * @param {string} idProp - a string that is the name of the attribute where
 * the element has a unique ID value
 * @param {boolean} [shadowDom=false] - overrides the default mode to use a
 * shadow DOM, which might save some interactive elements from breaking but
 * could be less performant
 *
 * @return {object} an unloader object containing methods for using and
 * controlling the unloader
 *
 */
export default function unloader(idProp, shadowDom = false) {
  const archive = new Map();
  const index = [];

  const unloader = shadowDom ? unloadDOM : unloadHTML;
  const reloader = shadowDom ? reloadDOM : reloadHTML;

  function unload(elem, key) {
    const sizes = addStaticSize(elem);
    const content = unloader(elem);    
    archive.set(key, content);
    elem.classList.add(UNLOADED_CLASS);
  }

  function reload(elem, key) {
    const content = archive.get(key);    
    if (!content) {
      return;
    }
    reloader(elem, content);    
    removeStaticSize(elem);
    archive.delete(key);
    elem.classList.remove(UNLOADED_CLASS);
  }

  return {
    addElem(elem) {
      let key = elem.getAttribute(idProp);

      // if no exisiting key in specified attribute name, create key and add it
      // as attribute value
      if (!key) {
        // generate key by incrementing array
        key = index.push(null); 
        elem.setAttribute(idProp, key);
      }

      return {
        key,
        elem,
        unload() {
          unload(elem, this.key);
        },
        reload() {
          reload(elem, this.key);
        },
      };
    },
    destroy() {
    
    },
  };
}

function addStaticSize(elem) {
  const {height, width} = elem.getBoundingClientRect();
  elem.style.height = height + 'px';
  elem.style.width = width + 'px';

  return {height, width};
}

function removeStaticSize(elem) {
  elem.style.height = null;
  elem.style.width = null;
}


function unloadHTML(elem) {
  const html = elem.innerHTML;
  elem.innerHTML = '';

  return html;
}

function reloadHTML(elem, content) {
  elem.innerHTML = content;
}

function unloadDOM(elem) {
  const docFrag = document.createDocumentFragment();
  while (elem.firstChild) {
    docFrag.appendChild(elem.firstChild);
  }

  return docFrag;
}

function reloadDOM(elem, content) {
  elem.appendChild(content);
}
