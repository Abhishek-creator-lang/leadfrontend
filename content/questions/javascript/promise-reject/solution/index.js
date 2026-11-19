/**
 * @param {*} reason
 * @return {Promise<never>}
 */
export default function promiseReject(reason) {
  // `reject` never inspects its argument: no unwrapping, no thenable adoption.
  return new Promise((_, reject) => {
    reject(reason);
  });
}
