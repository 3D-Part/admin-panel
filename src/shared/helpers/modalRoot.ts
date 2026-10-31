// Flowbite's Modal moves its container back onto the page on every render unless
// it gets a root, and moving it takes the focus out of the field being typed in.
export const modalRoot = () =>
  typeof document === 'undefined' ? undefined : document.body
