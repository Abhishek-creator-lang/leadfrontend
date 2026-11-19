/**
 * @return {{ promise: Promise<any>, resolve: (value?: any) => void, reject: (reason?: any) => void }}
 */
export default function promiseWithResolvers() {
  let resolve;
  let reject;
  // The executor runs synchronously, so both functions are assigned before we return.
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
