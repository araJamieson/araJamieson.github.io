/******************************************************************************/
var G_ChurchNames = [];
var G_CurrentlyVisibleParishBoundary = null;
var G_Icons = {};
var G_Map;
var G_Markers = [];


/******************************************************************************/
function onLoad ()
{
    initialiseData();
    handleHeights();
    setUpdatedDate();
    makeMap();
    makeIcons();
    makeMarkers();
    makeMenu();
    makeParishBoundaries();
}


/******************************************************************************/
function handleHeights ()
{
    setHeight();
    window.onorientationchange = function() { setTimeout(setHeightHeight, 1000); };
    window.onresize = function() { setTimeout(setHeightHeight, 100); };
}


/******************************************************************************/
function initialiseData ()
{
    for (var i = 0; i < G_ChurchDetailsIndex.length; ++i)
	G_ChurchNames.push("");
    
    for (var i = 0; i < G_ChurchDetailsIndex.length; ++i)
    {
	var x = G_ChurchDetailsIndex[i];
	G_ChurchNames[x.index] = x.name;
    }
}


/******************************************************************************/
function isTouchScreen ()
{
    return ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}


/******************************************************************************/
function makeIcons ()
{
    G_Icons.Hackney =
	L.icon({
	    iconUrl:      'images/hackney.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     [60, 100],
	    shadowSize:   [60, 100],
	    iconAnchor:   [30, 50],  // Point of the icon which will correspond to marker's location.
	    shadowAnchor: [30, 50],  // Ditto for the shadow.
	    popupAnchor:  [-5, -50]  // Point from which the popup should open relative to the iconAnchor.
	});

    G_Icons.Islington =
	L.icon({
	    iconUrl:      'images/islington.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     [60, 100],
	    shadowSize:   [60, 100],
	    iconAnchor:   [30, 50],  // Point of the icon which will correspond to marker's location.
	    shadowAnchor: [30, 50],  // Ditto for the shadow.
	    popupAnchor:  [-5, -50]  // Point from which the popup should open relative to the iconAnchor.
	});

    G_Icons.TowerHamlets =
	L.icon({
	    iconUrl:      'images/towerHamlets.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     [60, 100],
	    shadowSize:   [60, 100],
	    iconAnchor:   [30, 50],  // Point of the icon which will correspond to marker's location.
	    shadowAnchor: [30, 50],  // Ditto for the shadow.
	    popupAnchor:  [-5, -50]  // Point from which the popup should open relative to the iconAnchor.
	});
}


/******************************************************************************/
function makeMap ()
{
    G_Map = L.map('the-map', {center: [51.539088, -0.073342], zoom: 14});

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
		{attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
		 maxZoom: 18,
		 id: 'mapbox/streets-v11',
		 tileSize: 512,
		 zoomOffset: -1,
		 accessToken: 'pk.eyJ1IjoiYXJhai1tYXBwaW5nIiwiYSI6ImNrOTAxa2MwZzAwenczbW50Nmp2OHJnOGQifQ.MQaj-mNdjT6vbj4Pa5VGPQ' // Public key.
		}).addTo(G_Map);

    G_Map.on("popupopen", function (e) {  showParishBoundary(G_ChurchDetails[e.popup.churchDetailsIndex].parishBoundary);  });

    L.control.scale({metric:true, imperial:true, maxWidth:200}).addTo(G_Map);
}


/******************************************************************************/
function makeMarkers ()
{
    for (var i = 0; i < G_ChurchDetails.length; ++i)
    {
	var x = G_ChurchDetails[i];
	var parishBoundaryMarker = (0 !== x.dataBoundary.length) ? "* " : "";
	var marker = L.marker([x.latitude, x.longitude], {icon: G_Icons[x.deanery]}).addTo(G_Map);
	var popup = L.popup().setLatLng([x.latitude, x.longitude]).setContent(x.content);
	popup.churchDetailsIndex = i;
	marker.bindPopup(popup);
	if (!isTouchScreen()) marker.bindTooltip(parishBoundaryMarker + G_ChurchNames[i]);
	G_Markers.push(marker);
    }
}


/******************************************************************************/
function makeMenu ()
{
    var details = "";
    for (var i = 0; i < G_ChurchDetailsIndex.length; ++i)
    {
	var x = G_ChurchDetailsIndex[i];
	details += "<li><a class='dropdown-item' href='javascript:selectItem(" + x.index + ")'>" + x.name + "</a></li>";
    }

    $("#menu-of-churches").html(details);
}


/******************************************************************************/
function makeParishBoundaries ()
{
    for (var i = 0; i < G_ChurchDetails.length; ++i)
    {
	var x = G_ChurchDetails[i];
	x.parishBoundary = null;
	if (0 !== x.dataBoundary.length)
	{
	    var boundaryElts = decode(G_ChurchDetails[i].dataBoundary);
	    var polygon = L.polygon(boundaryElts, {color: 'red'});
	    x.parishBoundary = polygon;
	}
    }
}


/******************************************************************************/
function selectItem (n)
{
    var x = G_ChurchDetails[n];
    var latLng = L.latLng(x.latitude, x.longitude);
    G_Map.flyTo(latLng);
    G_Markers[n].openPopup();
    showParishBoundary(x.parishBoundary);
}


/******************************************************************************/
/* Force the map container to fill the space between header and footer. */

function setHeight ()
{
    var h = $(window).outerHeight() - $("#navbar").outerHeight() - $("#footer").outerHeight();
    $("#the-map").css("max-height", h + "px");
    $("#the-map").css("min-height", h + "px");
}


/******************************************************************************/
function setUpdatedDate ()
{
    //----------------------------------------------------------------------
    var v = G_DateLastUpdated.split("/");
    var dtUpdated = new Date(v[2], v[1] - 1, v[0]);
    const formattedDate = dtUpdated.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}).replace(/ /g, '-');
    $("#last-update").text(formattedDate);



    //----------------------------------------------------------------------
    var C_WarnAfterDays = 60;
    var today = new Date();
    var daysSinceLastUpdate =  Math.floor((today.getTime() - dtUpdated.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastUpdate > C_WarnAfterDays) // Warning if too elderly.
    {
	$("#out-of-date-warning").html("&nbsp;&nbsp;WARNING: Data is at least " + C_WarnAfterDays + " days old.&nbsp;&nbsp;");
	$("#out-of-date-warning").css("visibility", "visible");
    }
}


/******************************************************************************/
function showParishBoundary (boundary)
{
    if (null != G_CurrentlyVisibleParishBoundary)
    {
	G_CurrentlyVisibleParishBoundary.removeFrom(G_Map);
	G_CurrentlyVisibleParishBoundary = null;
    }
    
    if (null != boundary)
    {
	G_CurrentlyVisibleParishBoundary = boundary;
	boundary.addTo(G_Map);
    }
}
    





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/** Code taken from jhermsmeier / node-google-polyline -- decodes encoded    **/
/** boundary information.  With thanks.                                      **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* jhermsmeier / node-google-polyline */

function decode (value)
{
  var PRECISION = 1e5

  var points = []
  var lat = 0
  var lon = 0

  var values = decodeIntegers( value, function( x, y ){
    lat += x
    lon += y
    points.push([ lat / PRECISION, lon / PRECISION ])
  })

  return points
}

decodeSign = function( value )
{
  return value & 1 ? ~( value >>> 1 ) : ( value >>> 1 )
}

decodeIntegers = function( value, callback )
{
  var values = 0
  var x = 0
  var y = 0

  var byte = 0
  var current = 0
  var bits = 0

  for( var i = 0; i < value.length; i++ ) {

    byte = value.charCodeAt( i ) - 63
    current = current | (( byte & 0x1F ) << bits )
    bits = bits + 5

    if( byte < 0x20 ) {
      if( ++values & 1 ) {
        x = decodeSign( current )
      } else {
        y = decodeSign( current )
        callback( x, y )
      }
      current = 0
      bits = 0
    }
  }

  return values
}
