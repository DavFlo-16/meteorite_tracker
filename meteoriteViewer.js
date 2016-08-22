//NASA api key = w1T0tMKlC0sZUkHEqHZjOcfNZc1L5X0dRpRIew9N
//Google Geocoding API = AIzaSyD9djfdEZBOJ6JqbYR2O2_Ymc3haIDUfTY


//Interface


//Use Google Geocoding API to get Lat, Lng coordinates for address entered by user.


      $("#formSubmit").click(function(){
        var street = encodeURIComponent($("#inputStreetAdd").val().trim());
        var state = encodeURIComponent($("#inputState").val().trim());
        var city = encodeURIComponent($("#inputCity").val().trim());
        var zipCode = encodeURIComponent($("#inputZipCode").val().trim());
        var radiusofInterest = $("#radius").val()
        var address = street+city+state+zipCode;
        console.log(address);
        $.ajax({
          method: 'GET',
              url:`https://maps.googleapis.com/maps/api/geocode/xml?address=${address}&key=AIzaSyD9djfdEZBOJ6JqbYR2O2_Ymc3haIDUfTY`
    ,
              success: function(geoData) {
                var lat = geoData.getElementsByTagName("location")[0].getElementsByTagName("lat")[0].childNodes[0].nodeValue;
                var lng = geoData.getElementsByTagName("location")[0].getElementsByTagName("lng")[0].childNodes[0].nodeValue;
                console.log(geoData);
                console.log(lat + lng);
                $.ajax({
                  method: 'GET',
                      url:`https://data.nasa.gov/resource/y77d-th95.json?$where=within_circle(geolocation, ${lat}, ${lng}, ${radiusofInterest})`,
                      success: function(NASAdata) {
                        console.log(NASAdata);
                        $('#jQuery').before('<div class="col-sm-8 col-sm-offset-2" id="meteoriteMap"></div>');
                        createMeteoriteMap(lat, lng, radiusofInterest);
                        setMeteoriteMapMarkers(NASAdata);
                      }
                    });


              }
            });
      });

      //Google Maps API Function Reference

      var meteoriteMap;
      function createMeteoriteMap(latitude, longitude, radius) {
        meteoriteMap = new google.maps.Map(document.getElementById('meteoriteMap'), {
          center: {lat: parseFloat(latitude), lng: parseFloat(longitude)},
          zoom: 4,
          styles: [
            {
              featureType: 'all',
              stylers: [
                { saturation: -80 }
              ]
            },{
              featureType: 'road.arterial',
              elementType: 'geometry',
              stylers: [
                { hue: '#00ffee' },
                { saturation: 50 }
              ]
            },{
              featureType: 'poi.business',
              elementType: 'labels',
              stylers: [
                { visibility: 'off' }
              ]
            }
          ]
        });
        var meteoriteRadius = new google.maps.Circle({
          center: {lat: parseFloat(latitude), lng: parseFloat(longitude)},
          radius: parseFloat(radius),
          strokeColor:"#0000FF",
          strokeOpacity:0.8,
          strokeWeight:2,
          fillColor:"#0000FF",
          fillOpacity:0.4
        });
        meteoriteRadius.setMap(meteoriteMap);
      }

      function createMeteoriteMarker(meteorite){
        var marker=new google.maps.Marker({
        position:{lat: parseFloat(meteorite.reclat), lng: parseFloat(meteorite.reclong)},
        });
        var infowindow = new google.maps.InfoWindow({
        content: `Name: ${meteorite.name} <br> Date: ${meteorite.year}`
        });

        marker.setMap(meteoriteMap);
        marker.addListener('click', function() {
          infowindow.open(meteoriteMap, marker);
        });
      }

      function setMeteoriteMapMarkers(meteoriteData){
        for (i = 0; i < meteoriteData.length; i++){
          createMeteoriteMarker(meteoriteData[i]);
        }
      }


      // function initMap() {
      //     var myLatLng = {lat: -25.363, lng: 131.044};
      //
      //     var map = new google.maps.Map(document.getElementById('map'), {
      //       zoom: 1,
      //       center: myLatLng
      //     });
      //
      //     var marker = new google.maps.Marker({
      //       position: myLatLng,
      //       map: map,
      //       title: 'Hello World!'
      //     });
      //   }
