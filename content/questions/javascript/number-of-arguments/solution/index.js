/**
 * @param {...any} args
 * @return {number} How many arguments this call received.
 */
export default function numberOfArguments(...args) {
  return args.length;
}
