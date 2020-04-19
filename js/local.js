/******************************************************************************/
var C_Version = 0.1
var C_WarnAfterDays = 90;;


var G_ChurchNames = [];
var G_Icons = {};
var G_InPopupCloseProcessing = false;
var G_InPopupOpenProcessing = false;
var G_Map;
var G_Markers = [];
var G_Popups = [];
var G_SelectedItems = [];


/******************************************************************************/
function onLoad ()
{
    initialiseData();
    handleHeights();
    setVersionInformation();
    makeMap();
    makeIcons();
    makeMarkers();
    makeMenu();
    makeParishBoundaries();
    autoClosePopups(false);
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                              Initialisation                              **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

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

    G_Icons.Selected =
	L.icon({
	    iconUrl:      'images/selected.png',
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
    G_Map = L.map('the-map', {center: [51.539088, -0.073342], zoom: 14,  zoomSnap: 0, wheelPxPerZoomLevel:120 });

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
		{attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
		 maxZoom: 20,
		 id: 'mapbox/streets-v11',
		 tileSize: 512,
		 zoomOffset: -1,
		 accessToken: 'pk.eyJ1IjoiYXJhai1tYXBwaW5nIiwiYSI6ImNrOTAxa2MwZzAwenczbW50Nmp2OHJnOGQifQ.MQaj-mNdjT6vbj4Pa5VGPQ' // Public key.
		}).addTo(G_Map);

    G_Map.on("popupopen",  function (e) {  popupOpen (e.popup);  });
    G_Map.on("popupclose", function (e) {  popupClose(e.popup);  });

    L.control.scale({metric:true, imperial:true, maxWidth:200}).addTo(G_Map);
}


/******************************************************************************/
function makeMarkers ()
{
    for (var i = 0; i < G_ChurchDetails.length; ++i)
    {
	var x = G_ChurchDetails[i];
	var parishBoundaryMarker = (0 !== x.dataBoundary.length) ? "* " : "";
	var icon = G_Icons[x.deanery]; 
	var marker = L.marker([x.latitude, x.longitude], {icon: icon, riseOnHover:true}).addTo(G_Map);
	marker.myOriginalIcon = icon;
	marker.myOnMap = true;
	var popup = L.popup().setLatLng([x.latitude, x.longitude]).setContent(x.content);
	popup.myChurchDetailsIndex = i;
	marker.bindPopup(popup);
	if (!isTouchScreen()) marker.bindTooltip(parishBoundaryMarker + G_ChurchNames[i]);
	G_Markers.push(marker);
	G_Popups.push(popup);
	x.marker = marker;
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
function setVersionInformation ()
{
    //----------------------------------------------------------------------
    var v = G_DateLastUpdated.split("/");
    var dtUpdated = new Date(v[2], v[1] - 1, v[0]);
    const formattedDate = dtUpdated.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}).replace(/ /g, '-');
    $("#version").text("Version: Tool " + C_Version + " • Data " + formattedDate);



    //----------------------------------------------------------------------
    var today = new Date();
    var daysSinceLastUpdate =  Math.floor((today.getTime() - dtUpdated.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastUpdate > C_WarnAfterDays) // Warning if too elderly.
    {
	$("#out-of-date-warning").html("&nbsp;&nbsp;WARNING: Data is at least " + C_WarnAfterDays + " days old.&nbsp;&nbsp;");
	$("#out-of-date-warning").css("visibility", "visible");
    }
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                           Selection processing                           **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
function accumulateInformationForSelectedItems ()
{
    //----------------------------------------------------------------------
    if (0 === G_SelectedItems.length)
    {
	$("#accumulated-data").css("visibility", "hidden");
	return;
    }


    
    //----------------------------------------------------------------------
    var dubiousElectoralRoll = false;
    var dubiousParishPopulation = false;
    var totalElectoralRoll = 0;
    var totalParishPopulation = 0;

    for (var i = 0; i < G_SelectedItems.length; ++i)
    {
	x = G_ChurchDetails[G_SelectedItems[i]];

	if (0 === x.electoralRoll.length)
	    dubiousElectoralRoll = true;
	else
	    totalElectoralRoll += Number(x.electoralRoll);
	
	if (0 === x.parishPopulation.length)
	    dubiousParishPopulation = true;
	else
	    totalParishPopulation += Number(x.parishPopulation);
    }

    var electoralRoll = "Total electoral roll: " + totalElectoralRoll + (dubiousElectoralRoll ? " (Figure incomplete)" : "");
    var totalParishPopulation = "Total parish pop: " + totalParishPopulation + (dubiousParishPopulation ? " (Figure incomplete)" : "");
    var text = electoralRoll + " • " + totalParishPopulation;



    //----------------------------------------------------------------------
    var dist = "";
    if (2 === G_SelectedItems.length)
    {
	var ix0 = G_SelectedItems[0];
	var ix1 = G_SelectedItems[1];
	var d = distance(G_ChurchDetails[ix0].latitude, G_ChurchDetails[ix0].longitude, G_ChurchDetails[ix1].latitude, G_ChurchDetails[ix1].longitude);
	dist = "Dist: " + d.toFixed(1) + "mls • ";
    }


    
    //----------------------------------------------------------------------
    text = dist + text;
    $("#accumulated-data").text(text);
    $("#accumulated-data").css("visibility", "visible");
}


/******************************************************************************/
function autoClosePopups (val)
{
    for (var i = 0; i < G_Popups.length; ++i)
    {
	G_Popups[i].options.autoClose = val;
	G_Popups[i].options.closeOnClick = val;
	G_Popups[i].options.draggable = true;
    }
}


/******************************************************************************/
function limitToRadius (id)
{
    //----------------------------------------------------------------------
    var response;
    while (true)
    {
	response = window.prompt("Limit to churches within this number of miles (blank => show all churches).  Decimals of a mile are ok.", "");
	if (null === response) return;
	response = response.trim();
	if (0 === response.length) break;
	if (!isNaN(response)) break;
	alert("That wasn't a number!");
    }



    //----------------------------------------------------------------------
    if (0 === response.length)
    {
	for (var i = 0; i < G_Markers.length; ++i)
	    addMarkerToMap(G_Markers[i]);
	return;
    }



    //----------------------------------------------------------------------
    var ixTarget;
    for (ixTarget = 0; ixTarget < G_ChurchDetails.length; ++ixTarget)
	if (G_ChurchDetails[ixTarget].uniqueId == id) break;

    var dist = Number(response);
    for (var i = 0; i < G_ChurchDetails.length; ++i)
    {
	var d = distance(G_ChurchDetails[i].latitude, G_ChurchDetails[i].longitude, G_ChurchDetails[ixTarget].latitude, G_ChurchDetails[ixTarget].longitude);
	if (d <= dist)
	    addMarkerToMap(G_ChurchDetails[i].marker);
        else
	    removeMarkerFromMap(G_ChurchDetails[i].marker);
    }
}


/******************************************************************************/
function popupClose (popup)
{
    if (G_InPopupOpenProcessing || G_InPopupCloseProcessing) return;
    G_InPopupCloseProcessing = true;

    var ix = popup.myChurchDetailsIndex;
    
    if (null != G_ChurchDetails[ix].parishBoundary)
	G_ChurchDetails[ix].parishBoundary.removeFrom(G_Map);

    G_Markers[ix].options.icon = G_Markers[ix].myOriginalIcon;
    G_Markers[ix].removeFrom(G_Map);
    G_Markers[ix].addTo(G_Map);

    G_SelectedItems.push[ix];
    G_SelectedItems.splice(G_SelectedItems.indexOf(ix), 1);
    accumulateInformationForSelectedItems();

    G_InPopupCloseProcessing = false;
}


/******************************************************************************/
function popupOpen (popup)
{
    if (G_InPopupOpenProcessing) return;
    G_InPopupOpenProcessing = true;
    
    var ix = popup.myChurchDetailsIndex;

    if (null != G_ChurchDetails[ix].parishBoundary)
	G_ChurchDetails[ix].parishBoundary.addTo(G_Map);

    G_Markers[ix].options.icon = G_Icons.Selected;
    G_Markers[ix].removeFrom(G_Map);
    G_Markers[ix].addTo(G_Map);
    G_Popups[ix].openOn(G_Map);

    G_SelectedItems.push(ix);
    accumulateInformationForSelectedItems();

    G_InPopupOpenProcessing = false;
}


/******************************************************************************/
function selectItem (n)
{
    var x = G_ChurchDetails[n];
    var latLng = L.latLng(x.latitude, x.longitude);
    G_Map.flyTo(latLng);
    G_Markers[n].openPopup();
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                              Miscellaneous                               **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
function addMarkerToMap (marker)
{
    if (!marker.myOnMap)
    {
	marker.myOnMap = true;
	marker.addTo(G_Map);
    }
}


/******************************************************************************/
function degreesToRadians (degrees)
{
    return degrees * Math.PI / 180;
}


/******************************************************************************/
/* Distance between two points (miles). */

function distance (lat1, lng1, lat2, lng2)
{
    var R = 6371e3; // metres
    var phi1 = degreesToRadians(lat1);
    var phi2 = degreesToRadians(lat2);
    var deltaPhi = degreesToRadians(lat2-lat1);
    var deltaLambda = degreesToRadians(lng2-lng1);
    var a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = R * c;
    d /= 1000;
    d *= (5/8);

    return d;
}

/******************************************************************************/
function handleHeights ()
{
    setHeight();
    window.onorientationchange = function() { setTimeout(setHeightHeight, 1000); };
    window.onresize = function() { setTimeout(setHeightHeight, 100); };
}


/******************************************************************************/
function isTouchScreen ()
{
    return ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}


/******************************************************************************/
function removeMarkerFromMap (marker)
{
    if (marker.myOnMap)
    {
	marker.myOnMap = false;
	marker.removeFrom(G_Map);
    }
}


/******************************************************************************/
/* Force the map container to fill the space between header and footer. */

function setHeight ()
{
    var h = $(window).outerHeight() - $("#navbar").outerHeight() - $("#footer").outerHeight();
    $("#the-map").css("max-height", h + "px");
    $("#the-map").css("min-height", h + "px");
    $(".modal-body").css("max-height", (h * 0.8) + "px");
}


/******************************************************************************/
function showHelp ()
{
    var s = $("#help-modal").html();
    var addr = "jamie" + "@" + "critos.co.uk";
    var text = "<a href='mail" + "to:" + addr + "'>" + addr + "</a>";
    $("#help-modal").html(s.replace("$$$", text));
    $("#help-modal").modal("show");
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
