//document.write("WJUBU");
function initMap(){
    //document.write("WJUBU");
    //var key = {{ my_flask_dict }};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 51.505, lng: -0.09}
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
// Function to interpolate between two colors
function interpolateColor(color1, color2, factor) {
    var result = "#";
    for (var i = 1; i < 6; i += 2) {
        var val1 = parseInt(color1.substr(i, 2), 16);
        var val2 = parseInt(color2.substr(i, 2), 16);
        var val = Math.round(val1 + factor * (val2 - val1)).toString(16);
        result += ("00" + val).substr(val.length);
    }
    return result;
}