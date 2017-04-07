module.exports = {
  csvJSON : function(csv){
    var lines=csv.split('\n');

    var result = [];

    var headers=lines[0].split(',');
    lines.splice(0, 1);
    lines.forEach(function(line) {
      var obj = {};
      var currentline = line.split(',');
      headers.forEach(function(header, i) {
        obj[header] = currentline[i];
      });
      result.push(obj);
    });

    return result; //JavaScript object
    //return JSON.stringify(result); //JSON
  },
  CSVToArray : function(strData, strDelimiter){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
        );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [];
    var headers = [];
    var headersFound = false;
    var headerIndex = 0;

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter){

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( {} );
            headersFound = true;
            headerIndex = 0;
        }

        var strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[ 2 ].replace(new RegExp( "\"\"", "g" ),"\"");

        } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[ 3 ];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        if (!headersFound) {
          headers.push(strMatchedValue);
        } else {
          arrData[arrData.length -1][headers[headerIndex]] = strMatchedValue;
          headerIndex ++;
        }
    }

    // Return the parsed data.
    return( arrData );
  },
  csvFileToJSON: function(file){
    if (!window.FileReader || !window.File) {
      return Promise.reject('Does not support File API');
    }
    if (!(file instanceof File)) {
      return Promise.reject('Not a file');
    }

    return new Promise(function(resolve, reject) {
      var reader = new FileReader();

      reader.onerror = function(err) {
        reject(err);
      };

      // Closure to capture the file information.
      reader.onload = function() {
        var text = reader.result;
        resolve(CSVToArray(text));
      };

      // Read in the image file as a data URL.
      reader.readAsText(file);
    });
  },
  addZero:function(i) {
		if (i < 10) {
			i = "0" + i;
		}
		return i;
	},
  timeNow: function(dif) {
		var d = new Date();
		//var x = document.getElementById("demo");
		var h = this.addZero(d.getHours());
		var m = this.addZero(d.getMinutes()) + (dif!=undefined ? dif : 0);
		var s = this.addZero(d.getSeconds());
		return h + ":" + m + ":" + s;
	},
  classDayTrip: function(trip_id){
    /*
    Weekday service (Assignment list identifier code + S): Monday – Friday
    Saturday service (Assignment list identifier code + A): Saturday
    Sunday service (Assignment list identifier code + I): Sunday
    Holiday service (Assignment list identifier code + F1 or F2 or F3 or F4): Legal holidays
    */
    //let days = [];
    //console.log(new Date().getDay()+' day');
    let day = new Date().getDay();
    //console.log(day);

    switch (day) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        console.log(/S/.test(trip_id)+' from functions');
        return '"'+/S/.test(trip_id)+'"';
        break;
      case 6:
        //console.log('sat');
        return /A/.test(trip_id);
        break;
      case 7:
        //console.log('sun');
        return /I/.test(trip_id);
      default:
        //console.log('other');
        return false;
    }

    //return false;
  },
  classDayTrips:function(array){
    let day = new Date().getDay();
    let newArray=[];
    let cpt=0;
    if(day>0 && day<=5){
      array.forEach(function(el){
        cpt++;
        if( /S/.test(el.trip_id) ){
          newArray.push(el);
        }
      });
      return newArray;
    }
    else if (day==6) {
      array.forEach(function(el){
        cpt++;
        if( /A/.test(el.trip_id) ){
          newArray.push(el);
        }
      });
      return newArray;
    }
    else if ( day==7 ) {
      array.forEach(function(el){
        cpt++;
        if( /I/.test(el.trip_id) ){
          newArray.push(el);
        }
      });
      return newArray;
    }
  },
  getClosest: function(x, geoLat, latitude, geoLon, longitude){
    if( Math.sqrt( Math.pow((geoLat - latitude), 2) + Math.pow((geoLon - longitude), 2) ) <= x/100 )
      //console.log(Math.sqrt( Math.pow((geoLat - latitude), 2) + Math.pow((geoLon - longitude), 2)));
      return true;
  },
  setDistance: function(obj, geoLat, geoLon){
    obj.distance = Math.sqrt( Math.pow((geoLat - obj.stop_lat), 2) + Math.pow((geoLon - obj.stop_lon), 2) );
  }
};
