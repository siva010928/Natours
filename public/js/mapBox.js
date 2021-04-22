export const mapMarker = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoic2l2YTAxMDkyOCIsImEiOiJja25sZHZoaGswNDYxMndsaWZ0NWxwNHVzIn0.XKjwISSYcsLsC5Cw0W7YWA';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/siva010928/cknms0l823vnr17nk3vd9bhni',
    scrollZoom: false,
  });
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}:${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 200,
      right: 200,
    },
  });
};
