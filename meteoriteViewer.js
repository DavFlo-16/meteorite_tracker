//NASA API key = w1T0tMKlC0sZUkHEqHZjOcfNZc1L5X0dRpRIew9N
//Google Geocoding API = AIzaSyD9djfdEZBOJ6JqbYR2O2_Ymc3haIDUfTY




//Use Google Geocoding API to get Lat, Lng coordinates for address entered by user.

// Get address information from User
      $("#formSubmit").click(function(){
        $('.errorMessage').remove();  //remove error messages from previous queries, if any
//Create and format variables using inputted address data
        var street = encodeURIComponent($("#inputStreetAdd").val().trim());
        var state = encodeURIComponent($("#inputState").val().trim());
        var city = encodeURIComponent($("#inputCity").val().trim());
        var zipCode = encodeURIComponent($("#inputZipCode").val().trim());
        var country = encodeURIComponent($("#inputCountry").val().trim());
        if (!$("#radius").val()){
          $('#addressForm').append('<div class="col-sm-8 col-sm-offset-1 errorMessage">You must enter a radius.</div>');
          return;
        }
//convert miles to meters
        if ($('#milesRadio').is(':checked')){
          var radiusOfInterest = (1609.34*parseFloat($("#radius").val())).toString();
        }
//convert kilometers to meters
        else if ($('#kilometersRadio').is(':checked')) {
          var radiusOfInterest = (1000*parseFloat($("#radius").val())).toString();
        }
        console.log(radiusOfInterest);
//Create address variable to use in url for Google Geocode API
        var address = street+city+state+zipCode+country;
        console.log(address);
//Send user address to Google Geocode API
        $.ajax({
          method: 'GET',
              url:`https://maps.googleapis.com/maps/api/geocode/xml?address=${address}&key=AIzaSyD9djfdEZBOJ6JqbYR2O2_Ymc3haIDUfTY`,
              error: function() {
                $('#addressForm').append('<div class="col-sm-8 col-sm-offset-1 errorMessage">Unrecognized Address</div>');
              },
              success: function(geoData) {
                var lat = geoData.getElementsByTagName("location")[0].getElementsByTagName("lat")[0].childNodes[0].nodeValue;
                var lng = geoData.getElementsByTagName("location")[0].getElementsByTagName("lng")[0].childNodes[0].nodeValue;
                console.log(geoData);
                console.log(lat + lng);
//Send Lat, Lng coordinates to NASA Meteoritical API
                $.ajax({
                  method: 'GET',
                      url:`https://data.nasa.gov/resource/y77d-th95.json?$where=within_circle(geolocation, ${lat}, ${lng}, ${radiusOfInterest})`,
//Generate Google Map using data obtaines from NASA Meteoritical API.
                      success: function(NASAdata) {
                        console.log(NASAdata);
                        if ($('#meteoriteMap').length > 0){
                          $('#meteoriteMap').remove(); //Remove map if one is already present on the page
                        }
                        if (NASAdata.length){
                          $('#jQuery').before('<div class="col-sm-8 col-sm-offset-2" id="meteoriteMap"></div>');
                          createMeteoriteMap(lat, lng, radiusOfInterest);
                          setMeteoriteMapMarkers(NASAdata);
                        }
                        else {
                          $('#addressForm').append('<div class="col-sm-8 col-sm-offset-1 errorMessage">No matches found</div>');
                        }

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
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.HYBRID,
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
        content: `Name: ${meteorite.name} <br>
                  Date: ${meteorite.year.slice(5,7)}/${meteorite.year.slice(8,10)}/${meteorite.year.slice(0,4)} <br>
                  Mass (grams): ${meteorite.mass || "unavailable"} <br>
                  Location: ${meteorite.reclat}, ${meteorite.reclong}`
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
