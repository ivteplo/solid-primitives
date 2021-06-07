import { onMount, createSignal, onCleanup } from 'solid-js'

/**
 * Primitive for wrapping Intersection Observer.
 *
 * @param elementRef - Element that should be targetted
 * @param threshold - Indicates at what percentage of the target's visibility the observer's callback should be executed
 * @param root - Root element to target
 * @param rootMargin - Margin around the root. Can have values similar to the CSS margin property
 * @param freezeOnceVisible - Deterines to freeze the observer
 * 
 * @example
 * ```ts
 * createEventListener("mouseDown", () => console.log("Click"), document.getElementById("mybutton"))
 * ```
 */
const useIntersectionObserver = (
  elementRef: HTMLElement,
  threshold: number = 0,
  root: HTMLElement | null = null,
  rootMargin: string = '0%',
  freezeOnceVisible = false,
): () => IntersectionObserverEntry | undefined => {
  let observer: IntersectionObserver;
  const [entry, setEntry] = createSignal<IntersectionObserverEntry>();
  const frozen = entry?.isIntersecting && freezeOnceVisible;
  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry)
  }

  // Bind and then release the observer
  onMount(() => {
    const node = elementRef;
    const hasIOSupport = !!window.IntersectionObserver
    if (!hasIOSupport || frozen || !node) return
    const observerParams = { threshold, root, rootMargin }
    observer = new IntersectionObserver(updateEntry, observerParams)
    observer.observe(node)
  });
  onCleanup(() => observer.disconnect());

  return entry;
}

export default useIntersectionObserver;