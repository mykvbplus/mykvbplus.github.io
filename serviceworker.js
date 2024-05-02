const CACHE_VERSION = 1.4;
const CURRENT_CACHES = {
  prefetch: `prefetch-cache-v${CACHE_VERSION}`,
};

self.addEventListener("install", (event) => {
  const urlsToPrefetch = [
    "/",
    "/index.html",
    "/img.png",
  ];

  console.log(
    "Handling install event. Resources to pre-fetch:",
    urlsToPrefetch,
  );

  event.waitUntil(
    caches
      .open(CURRENT_CACHES["prefetch"])
      .then((cache) => {
        return cache
          .addAll(
            urlsToPrefetch.map((urlToPrefetch) => {
              return new Request(urlToPrefetch, { mode: "no-cors" });
            }),
          )
          .then(() => {
            console.log("All resources have been fetched and cached.");
          });
      })
      .catch((error) => {
        console.error("Pre-fetching failed:", error);
      }),
  );
});


self.addEventListener('fetch', event => {
    const {request} = event;
    const url = new URL(request.url);
    
    if(url.origin === location.origin) {

        return event.respondWith(cacheData(request));
    } 
    return event.respondWith(network(request));
});

async function network(request) {
  return await fetch(request);
}
async function cacheData(request) {
  const cache = await caches.open(CURRENT_CACHES["prefetch"]);
  // 优先使用网络
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch(e) {
    // 其次使用缓存
    return await caches.match(request);
  }

}