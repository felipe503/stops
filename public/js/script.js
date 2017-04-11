function getLocation(){
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
  } else {
      console.log("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  initMap(position);
}


function initMap(pos)
{
  const posArray = pos ? [pos.coords.latitude, pos.coords.longitude] : [45.5016889,-73.56725599999999];
  const CLUSTER_MINIMUM_SIZE = 3;
  const options = { minimumClusterSize: CLUSTER_MINIMUM_SIZE ,imagePath: 'public/images/m'};
  const mapOptions = {
    center: new google.maps.LatLng(posArray[0],posArray[1]),
    zoom: 18,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  const path = 'public/data/';

  const markers = [];
  $.each(stops, function(i){
    const latLng = new google.maps.LatLng(this.stop_lat,this.stop_lon);
    const marker = new google.maps.Marker({
      title:this.stop_name,
      position: latLng,
      lat:this.stop_lat,
      lon:this.stop_lon,
      id:this.stop_id,
      wheelchair_boarding : this.wheelchair_boarding,
      map: map
    });

    var infoWindow = new google.maps.InfoWindow();

    google.maps.event.addListener(marker, 'mousedown', (function (marker, i) {
          //console.log('adding listener to markers');
          return function(){
            let imgSrc = 'https://maps.gstatic.com/tactile/directions/transit/accessibility_1x.png';
            wheelchair = marker.wheelchair_boarding == 1 ? '<img src="'+imgSrc+'" />' : '';
            marker.content = '<span> '+wheelchair+'</span>';
            infoWindow.setContent('<strong>' + marker.title + '</strong>' + marker.content + '<div id="infoWindow_'+marker.id+'"></div>');
            infoWindow.open(map, marker);
            let trips_id = [];
            $.ajax({
              type:'GET',
              url:'/gettripsid/'+marker.id
            }).done(function(response){
              //console.log(response);
              $('#infoWindow_'+marker.id).html(response);
            });
          }
    })(marker, i));
    markers.push(marker);
  });

  const markerCluster = new MarkerClusterer(map, markers, options);
  const listener = google.maps.event.addListener(map, "idle", function(){
    google.maps.event.removeListener(listener);
  });
}
getLocation();
