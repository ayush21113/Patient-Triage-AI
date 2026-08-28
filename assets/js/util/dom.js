export function el(tagName, attributes = {}) {
  const node = document.createElement(tagName);
  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, value);
  }
  return node;
}

export function on(target, type, listener) {
  target.addEventListener(type, listener);
  return () => target.removeEventListener(type, listener);
}

export function text(value) {
  return document.createTextNode(String(value));
}
