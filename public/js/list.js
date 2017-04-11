var options ={
  distance:0.3
};
function getLocation(range){
  if(range){
      options.distance = range;
  }
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition,error, options);
  } else {
      console.log("Geolocation is not supported by this browser.");
  }
}
function error(){
  console.log(error);
}
function showPosition(position) {
  $.ajax({
    type:'POST',
    url:'/closeststops/',
    data:{latitude:position.coords.latitude, longitude:position.coords.longitude, distance:options.distance}
  }).done(function(data){
    //console.log(data);
    let stops = data;
    let stopslist='';
    stops.forEach(function(st){
      //let stop_id = st.stop_id;
      stopslist+='<a class="list-group-item" title="'+st.stop_name+'" data-stopid="'+st.stop_id+'" data-latitude="'+st.stop_lat+'" data-longitude="'+st.stop_lon+'" data-distance="'+st.distance+'" role="button" data-toggle="collapse" href="#collapseExample_'+st.stop_id+'" aria-expanded="false" aria-controls="collapseExample">'+st.stop_name+'<span class="badge">'+(st.distance*100).toFixed(2)+' km</span></a>';
      stopslist+='<div class="collapse" id="collapseExample_'+st.stop_id+'" data-id="'+st.stop_id+'"><div class="well"><img src="public/images/loading.gif" width="50"/></div></div>';
    });
    $('.stops').html(stopslist);
    $('.collapse').on('show.bs.collapse', function(){
      $this = $(this);
      $.ajax({
        type:'GET',
        url:'/gettripsid/'+$(this).data('id')
      }).done(function(response){
        $this.find('.well').html(response);
      });
    });
  });
}

$(document).ready(function(){
  getLocation();
  $('input[type=range]').change(function(){
    //console.log($(this).val());
    getLocation($(this).val()/100);
  });
});
