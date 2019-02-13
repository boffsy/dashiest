/**
 * adds a stylesheet to a document
 *
 * @param {Document} doc - document object for the document to operate on
 * @param {string} type - 'external' for external stylesheets or 'inline'
 * for inline style elements
 * @param {string} id - an id attribute to give to the resulting element
 * @param {string} content - the content of an inline style element or the
 * url of the external stylesheet to add
 * @param {HTMLElement} [scopeOverride] - the element to which to add the
 * resulting styling element to
 *
 * @return {HTMLElement} a reference to the resulting styling element
 *
 */
function addStyle(doc, type, id, content, scopeOverride) {
  const target = scopeOverride instanceof HTMLElement
               ? scopeOverride
               : doc.head;
  let elem = null;

  if (type === 'external') {
    elem = doc.createElement('link');
    elem.href = content;
    elem.type = 'text/css';
    elem.rel = 'stylesheet';
  } else if (type === 'inline') {
    elem = doc.createElement('style');
    elem.innerHTML = content;
  } else {
    throw new Error(`addStyle: expected 2nd argument to specifiy if stylesheet is 'inline' or 'external'`);
  }

  if (typeof id === 'string'
   && id.length > 0) {
    elem.id = id;
  }

  target.appendChild( elem );

  return elem;
}

/**
 * creates a new script element and appends it
 *
 * @param {HTMLElement} destination - the destination element to append the
 * resulting script element to
 * @param {string} content - the script element's content
 * @param {string} [typeOverride] - a mime-type to set for the resulting
 * script element
 *
 * @return {HTMLElement} a reference to the resulting script element
 */
function addScript(doc, destination, content, typeOverride) {
  const newScript = doc.createElement('script');

  if (typeof typeOverride === 'string') {
    newScript.type = typeOverride;
  }
  newScript.innerHTML = content;
  destination.appendChild( newScript );

  return newScript;
}

export default {
  addStyle,
  addScript,
};
