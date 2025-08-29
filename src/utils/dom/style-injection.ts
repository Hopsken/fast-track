/**
 * Utilities for injecting and managing style elements in the DOM
 */

export class StyleInjector {
  private static styleElements = new Map<string, HTMLStyleElement>()

  /**
   * Creates or updates a style element with the given content
   */
  static createStyleElement(id: string, content: string): HTMLStyleElement {
    const existingElement = this.styleElements.get(id)
    
    if (existingElement) {
      existingElement.textContent = content
      return existingElement
    }

    const element = document.createElement('style')
    element.id = `jira-boost-${id}`
    element.textContent = content
    
    this.styleElements.set(id, element)
    return element
  }

  /**
   * Injects a style element into the document head
   */
  static injectStyle(id: string, content: string): HTMLStyleElement {
    const element = this.createStyleElement(id, content)
    
    if (!element.parentElement) {
      document.head.appendChild(element)
    }
    
    return element
  }

  /**
   * Creates a style element with media query support
   */
  static createMediaStyleElement(
    id: string, 
    content: string, 
    mediaQuery?: string
  ): HTMLStyleElement {
    const wrappedContent = mediaQuery 
      ? `@media ${mediaQuery} {\n${content}\n}`
      : content
      
    return this.createStyleElement(id, wrappedContent)
  }

  /**
   * Removes a style element from both DOM and cache
   */
  static removeStyle(id: string): void {
    const element = this.styleElements.get(id)
    if (element) {
      element.remove()
      this.styleElements.delete(id)
    }
  }

  /**
   * Gets an existing style element
   */
  static getStyleElement(id: string): HTMLStyleElement | undefined {
    return this.styleElements.get(id)
  }

  /**
   * Cleans up all managed style elements
   */
  static cleanup(): void {
    this.styleElements.forEach(element => element.remove())
    this.styleElements.clear()
  }
}