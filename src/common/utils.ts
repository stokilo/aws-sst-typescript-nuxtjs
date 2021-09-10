/**
 * Typescript expression used on the right side of && operator.
 * It allows to throw an error in undefined property
 *
 * @param errorMessage that we throw
 */
export function throwExpression (errorMessage: string): never {
  throw new Error(errorMessage)
}
