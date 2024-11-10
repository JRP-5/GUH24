var key = "";
var map;
function init(k){
    key = k;
}
function initMap(){
    //document.write("WJUBU");
    //var key = {{ my_flask_dict }};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: {lat: 51.505, lng: -0.09},
        styles: [
            {
                featureType: "poi",
                stylers: [{ visibility: "off" }] // Hides all POIs
            }
        ]
    });
    google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        var ne = bounds.getNorthEast(); // Northeast corner
        var sw = bounds.getSouthWest(); // Southwest corner

        const nw = { lat: ne.lat(), lng: sw.lng() }; // northwest corner
        const se = { lat: sw.lat(), lng: ne.lng() }; // southeast corner

        console.log("Northeast (NE):", ne.toString());
        console.log("Southwest (SW):", sw.toString());
        console.log("Northwest (NW):", nw);
        console.log("Southeast (SE):", se);
    });


    var roadSegments = [
        {path: [{lat: 51.505, lng: -0.09}, {lat: 51.506, lng: -0.08}], distanceFromCenter: 0}
        //{path: [{lat: 51.507, lng: -0.07}, {lat: 51.508, lng: -0.06}], distanceFromCenter: 1},
        // Add more segments...
    ];

    // Calculate maximum distance for normalization
    var maxDistance = Math.max(...roadSegments.map(s => s.distanceFromCenter));

    // Apply gradient coloring based on distance from center
    roadSegments.forEach(function(segment) {
        var normalizedDistance = segment.distanceFromCenter / maxDistance;
        var color = interpolateColor('#00f', '#f00', normalizedDistance); // Blue to red

        new google.maps.Polyline({
            path: segment.path,
            strokeColor: color,
            strokeOpacity: 1,
            strokeWeight: 4,
            map: map
        });
    });

}
function visualise(){
    points = [
    [51.505, -0.09, 1], 
    [51.506, -0.08, 4],
    [51.507, -0.07, -2], 
    [51.515,-0.09, 2]
    ];
    colourBusy(points);
}
function colourBusy(points){
    //lat, lon
    //     {path: [], distanceFromCenter: 0}
    //     {path: [{lat: 51.507, lng: -0.07}, {lat: 51.508, lng: -0.06}], distanceFromCenter: 1},
    var average = 0;
    var max = Number.MIN_SAFE_INTEGER;
    var min = Number.MAX_SAFE_INTEGER;
    for(let i = 0; i < points.length; i++){
        average = average + points[i][2];
        if(points[i][2] > max){
            max = points[i][2];
        }
        if(points[i][2] < min){
            min = points[i][2];
        }
    }
    var diff = max - min;
    average = average/points.length;
    input = []
    colours = []
    for(let i = 0; i < points.length; i++){
        input.push(points[i][0] + ", " + points[i][1]);
        var rgb= interpolateColor(points[i][2], min, max);
        colours.push(rgb);
    }
    //console.log(colours);
    //return;
    const url = `https://roads.googleapis.com/v1/nearestRoads?points=${input.join('|')}&key=${key}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
 
            for(let i = 0; i < data.snappedPoints.length; i++){
                var centre = {lat : data.snappedPoints[i].location["latitude"], lng :data.snappedPoints[i].location["longitude"] }
                var rgb = colours[i];
                //console.log([r,g,b]);
                var cityCircle = new google.maps.Circle({
                    strokeColor: rgb,     // Border color
                    strokeOpacity: 0.8,         // Border opacity
                    strokeWeight: 2,            // Border thickness
                    fillColor: rgb,       // Fill color
                    fillOpacity: 1,          // Fill opacity
                    map: map,
                    center: centre,             // Center of the circle
                    radius: 600/map.getZoom()              // Radius in meters (5 km in this case)
                    });
            }
            // You can now use this data to draw road segments on your map
            //document.write(response)
        })
        .catch(error => console.error('Error fetching road segments:', error));
}
function interpolateColor(value, minValue, maxValue) {
    // Ensure the value is within bounds
    value = Math.max(minValue, Math.min(maxValue, value));
    
    // Normalize the value to a range [0, 1]
    const normalizedValue = (value - minValue) / (maxValue - minValue);

    // Define RGB for Red, Yellow, Green
    const red = [255, 0, 0];
    const yellow = [255, 255, 0];
    const green = [0, 255, 0];

    let r, g, b;

    // If normalizedValue is in the first half [0.0 - 0.5], interpolate from Red to Yellow
    if (normalizedValue <= 0.5) {
        const t = normalizedValue / 0.5;
        r = Math.round(red[0] * (1 - t) + yellow[0] * t);
        g = Math.round(red[1] * (1 - t) + yellow[1] * t);
        b = Math.round(red[2] * (1 - t) + yellow[2] * t);
    }
    // If normalizedValue is in the second half [0.5 - 1.0], interpolate from Yellow to Green
    else {
        const t = (normalizedValue - 0.5) / 0.5;
        r = Math.round(yellow[0] * (1 - t) + green[0] * t);
        g = Math.round(yellow[1] * (1 - t) + green[1] * t);
        b = Math.round(yellow[2] * (1 - t) + green[2] * t);
    }

    return `rgb(${r}, ${g}, ${b})`;
}
