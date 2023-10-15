const color = [82, 255, 255] // starting color for problem border
const colorIncrement = 70

// write a function where the color depends on the depth according to this formula:
// the initial color is rgb(82, 255, 255)
// as the depth increases, g is decremented by 0x0F until it reaches a minimum of 82
// then r is decremented by 0x0F until it reaches a maximum of 255
// then b is decremented by 0x0F until it reaches a minimum of 82
export const getDepthColor = (depth: number): string => {
  let [r, g, b] = color;

  // decrement g until it reaches a minimum of 82
  while (depth > 0 && g > 82) {
    g -= colorIncrement;
    depth--;
  }

  // decrement r until it reaches a maximum of 255
  while (depth > 0 && r < 255) {
    r += colorIncrement;
    depth--;
  }

  // decrement b until it reaches a minimum of 82
  while (depth > 0 && b > 82) {
    b -= colorIncrement;
    depth--;
  }

  return `rgb(${r}, ${g}, ${b})`;
}