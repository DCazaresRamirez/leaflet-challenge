// Creating the map object with center and zoom level
let map = L.map('map').setView([37.7749, -122.4194], 3); // Centered on the US

// Base layers
let grayscale = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let satellite = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.opentopomap.org/copyright">OpenTopoMap</a>'
});

// default base layer
grayscale.addTo(map);

// Layer groups for the overlays
let tectonicPlates = new L.LayerGroup();
let earthquakes = new L.LayerGroup();

// Base maps object to hold the different base layers
let baseMaps = {
    "Grayscale": grayscale,
    "Satellite": satellite
};

// Overlay object to hold the overlay layers
let overlayMaps = {
    "Tectonic Plates": tectonicPlates,
    "Earthquakes": earthquakes
};

// Layer control to select base layers and overlays
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(map);

// USGS Earthquake data URL
let earthquakeDataUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetching the earthquake data and plotting
d3.json(earthquakeDataUrl).then(data => {

    // Function to style each marker based on magnitude and depth
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    // Function to determine marker color based on depth
    function getColor(depth) {
        switch (true) {
            case depth > 90:
                return "#ea2c2c";
            case depth > 70:
                return "#ea822c";
            case depth > 50:
                return "#ee9c00";
            case depth > 30:
                return "#eecc00";
            case depth > 10:
                return "#d4ee00";
            default:
                return "#98ee00";
        }
    }

    // Function to determine marker size based on magnitude
    function getRadius(magnitude) {
        return magnitude === 0 ? 1 : magnitude * 4;
    }

    // Adding GeoJSON layer to the earthquakes overlay
    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function(feature, layer) {
            layer.bindPopup(`Magnitude: ${feature.properties.mag}<br>Location: ${feature.properties.place}<br>Depth: ${feature.geometry.coordinates[2]} km`);
        }
    }).addTo(earthquakes);

    // Adding the earthquakes layer to the map
    earthquakes.addTo(map);
});

// Fetching and plotting tectonic plates data
let tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(tectonicPlatesUrl).then(data => {
    L.geoJson(data, {
        color: "#ff6500",
        weight: 2
    }).addTo(tectonicPlates);

    // Adding the tectonic plates layer to the map
    tectonicPlates.addTo(map);
});

// Creating a legend control object
let legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    const depths = [0, 10, 30, 50, 70, 90];
    const colors = [
        "#98ee00",
        "#d4ee00",
        "#eecc00",
        "#ee9c00",
        "#ea822c",
        "#ea2c2c"
    ];

    // Looping through intervals to generate a label with a colored square for each interval
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " +
            depths[i] + (depths[i + 1] ? "&ndash;" + depths[i + 1] + " km<br>" : "+ km");
    }
    return div;
};

// Adding the legend to the map
legend.addTo(map);