/******************************************************************************/
var C_SoftwareVersion = 0.3;
var C_WarnAfterDays = 90;


var G_ChurchNames = [];
var G_Icons = {};
var G_InPopupCloseProcessing = false;
var G_InPopupOpenProcessing = false;
var G_Map;
var G_Markers = [];
var G_ParishColouring = ["grey", "green", "yellow", "orange", "red"]; // Per GC value.
var G_Popups = [];
var G_SelectedItems = [];
var G_ShowingPopups;





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                  Onload                                  **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
function onLoad ()
{
    $("#show-popups").prop("checked", true);
    $("#track-me").prop("checked", false);
    G_ShowingPopups = $("#show-popups").is(":checked");
    initialiseData();
    handleHeights();
    makeMap();
    makeIcons();
    makeMarkers();
    makeMenu();
    makeParishBoundaries();
    autoClosePopups(false);
    $("#general-modal").on("shown.bs.modal", shownDeaneryModal);

    //var compass = new L.Control.Compass({autoActive: true, showDigit:true});
    //G_Map.addControl(compass);
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
//    $("#select-churches-button").css("width", $("#help-button").css("width"));
    
    for (var i = 0; i < G_ChurchDetailsIndex.length; ++i)
	G_ChurchNames.push("");
    
    for (i = 0; i < G_ChurchDetailsIndex.length; ++i)
    {
	var x = G_ChurchDetailsIndex[i];
	G_ChurchNames[x.index] = x.name;
    }
}


/******************************************************************************/
function makeIcons ()
{
    /*************************************************************************/
    var iconSize = [20, 45];
    var iconAnchor = [10, 45];
    var shadowSize = [36, 33];
    var shadowAnchor = [10, 33];

    G_Icons.Person =
	L.icon({
	    iconUrl:      'images/person.png',
	    shadowUrl:    'images/personShadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});



    /*************************************************************************/
    iconSize = [23, 42];
    iconAnchor = [12, 42];
    shadowSize = [48, 57];
    shadowAnchor = [12, 45];
    var popupAnchor = [0, -44]; // Don't think this is used -- the popup belongs to the Sel version of the icon.
    

    
    /*************************************************************************/
    G_Icons.HackneyLiberal =
	L.icon({
	    iconUrl:      'images/hackneyLiberal.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.HackneyEvangelical =
	L.icon({
	    iconUrl:      'images/hackneyEvangelical.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.HackneyHigh =
	L.icon({
	    iconUrl:      'images/hackneyHigh.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});


    G_Icons.HackneyUnknown =
	L.icon({
	    iconUrl:      'images/hackneyUnknown.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});



    /*************************************************************************/
    G_Icons.IslingtonLiberal =
	L.icon({
	    iconUrl:      'images/islingtonLiberal.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.IslingtonEvangelical =
	L.icon({
	    iconUrl:      'images/islingtonEvangelical.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.IslingtonHigh =
	L.icon({
	    iconUrl:      'images/islingtonHigh.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.IslingtonUnknown =
	L.icon({
	    iconUrl:      'images/islingtonUnknown.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});



    /*************************************************************************/
    G_Icons.TowerHamletsLiberal =
	L.icon({
	    iconUrl:      'images/towerHamletsLiberal.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.TowerHamletsEvangelical =
	L.icon({
	    iconUrl:      'images/towerHamletsEvangelical.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.TowerHamletsHigh =
	L.icon({
	    iconUrl:      'images/towerHamletsHigh.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.TowerHamletsUnknown =
	L.icon({
	    iconUrl:      'images/towerHamletsUnknown.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});


    /*************************************************************************/
    /*************************************************************************/
    /*************************************************************************/
    /*************************************************************************/
    iconSize = [38, 58];
    iconAnchor = [19, 50];
    shadowSize = [38, 58];
    //shadowAnchor = [12, 42];
    popupAnchor = [0, -52];
    

    

    /*************************************************************************/
    G_Icons.HackneyLiberalSel =
	L.icon({
	    iconUrl:      'images/hackneyLiberalSel.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.HackneyEvangelicalSel =
	L.icon({
	    iconUrl:      'images/hackneyEvangelicalSel.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.HackneyHighSel =
	L.icon({
	    iconUrl:      'images/hackneyHighSel.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.HackneyUnknownSel =
	L.icon({
	    iconUrl:      'images/hackneyUnknownSel.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});



    /*************************************************************************/
    G_Icons.IslingtonLiberalSel =
	L.icon({
	    iconUrl:      'images/islingtonLiberalSel.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.IslingtonEvangelicalSel =
	L.icon({
	    iconUrl:      'images/islingtonEvangelicalSel.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.IslingtonHighSel =
	L.icon({
	    iconUrl:      'images/islingtonHighSel.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.IslingtonUnknownSel =
	L.icon({
	    iconUrl:      'images/islingtonUnknownSel.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});



    /*************************************************************************/
    G_Icons.TowerHamletsLiberalSel =
	L.icon({
	    iconUrl:      'images/towerHamletsLiberalSel.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.TowerHamletsEvangelicalSel =
	L.icon({
	    iconUrl:      'images/towerHamletsEvangelicalSel.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.TowerHamletsHighSel =
	L.icon({
	    iconUrl:      'images/towerHamletsHighSel.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});

    G_Icons.TowerHamletsUnknownSel =
	L.icon({
	    iconUrl:      'images/towerHamletsUnknownSel.png',
	    shadowUrl:    'images/shadow.png',
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
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
	var icon = G_Icons[x.deanery + x.churchmanship];
	var marker = L.marker([x.latitude, x.longitude], {icon: icon, riseOnHover:true}).addTo(G_Map);
	var popup = L.popup().setLatLng([x.latitude, x.longitude]).setContent(x.content);
	marker.bindPopup(popup);
	if (!isTouchScreen()) marker.bindTooltip(parishBoundaryMarker + G_ChurchNames[i]);
	G_Markers.push(marker);
	G_Popups.push(popup);
	x.marker = marker;
	marker.myOriginalIcon = icon;
	marker.myOnMap = true;
	marker.myPopup = popup;
	popup.myChurchDetailsIndex = i;
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
	    var polygon = L.polygon(boundaryElts, {color: G_ParishColouring[G_ChurchDetails[i].gc]});
	    x.parishBoundary = polygon;
	}
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
	var x = G_ChurchDetails[G_SelectedItems[i]];

	if (0 === x.electoralRoll.length)
	    dubiousElectoralRoll = true;
	else
	    totalElectoralRoll += Number(x.electoralRoll);
	
	if (0 === x.parishPopulation.length)
	    dubiousParishPopulation = true;
	else
	    totalParishPopulation += Number(x.parishPopulation);
    }

    totalElectoralRoll = "Total electoral roll: " + totalElectoralRoll + (dubiousElectoralRoll ? " (Figure incomplete)" : "");
    totalParishPopulation = "Total parish pop: " + totalParishPopulation + (dubiousParishPopulation ? " (Figure incomplete)" : "");
    var text = totalElectoralRoll + " • " + totalParishPopulation;



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
    text = "Churches: " + G_SelectedItems.length + " • " + dist + text;
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
	response = window.prompt("Limit to churches within this number of miles as the crow flies (blank => show all churches).  Decimals of a mile are ok.", "");
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

    if (null !== G_ChurchDetails[ix].parishBoundary)
	G_ChurchDetails[ix].parishBoundary.removeFrom(G_Map);

    G_Markers[ix].options.icon = G_Markers[ix].myOriginalIcon;
    G_Markers[ix].removeFrom(G_Map);
    G_Markers[ix].addTo(G_Map);

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

    if (G_SelectedItems.includes(ix)) // User has clicked on an already-selected church.
    {
	G_InPopupOpenProcessing = false;
	popupClose(popup);
	return;
    }
    
    if (null !== G_ChurchDetails[ix].parishBoundary)
	G_ChurchDetails[ix].parishBoundary.addTo(G_Map);

    G_Markers[ix].options.icon = G_Icons[G_ChurchDetails[ix].deanery + G_ChurchDetails[ix].churchmanship + "Sel"];
    G_Markers[ix].removeFrom(G_Map);
    G_Markers[ix].addTo(G_Map);
    if (G_ShowingPopups) G_Popups[ix].openOn(G_Map);

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
    $("#church-list-modal").modal("hide");
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
function dataOutOfDate ()
{
    var v = G_DateLastUpdated.split("/");
    var dtUpdated = new Date(v[2], v[1] - 1, v[0]);
    var today = new Date();
    var daysSinceLastUpdate =  Math.floor((today.getTime() - dtUpdated.getTime()) / (1000 * 60 * 60 * 24));
    return (daysSinceLastUpdate > C_WarnAfterDays);
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
    setDimensions();
    window.onorientationchange = function() { setTimeout(setDimensions, 1000); };
    window.onresize = function() { setTimeout(setDimensions, 100); };
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
	if (marker.myPopup.isOpen())  marker.closePopup();
	marker.removeFrom(G_Map);
    }
}


/******************************************************************************/
/* Force the map container to fill the space between header and footer. */

function setDimensions ()
{
    var h = $(window).outerHeight() - $("#navbar").outerHeight() - $("#footer").outerHeight();

    $("#the-map").css("max-height", h + "px");
    $("#the-map").css("min-height", h + "px");

    h = h * 0.8;
    $("#modal-body-help").css("max-height", h + "px");

    var w = ($("#general-modal").innerWidth() -
	     parseInt($("#general-modal").css("padding-left")) -
	     parseInt($("#general-modal").css("padding-right")) -
	     parseInt($("#general-modal").css("border-left-width")) -
	     parseInt($("#general-modal").css("border-right-width")) );
    w = 0.8 * w;

    $(".general-modal").css("min-width", w + "px");
    $(".general-modal").css("min-height", w + "px");
    $("#general-modal-content").css("min-height", (h * 0.8) + "px");

    $("#general-modal").css("left", (0.125 * w) + "px");
    $(".general-modal").css("position", "fixed");
}


/******************************************************************************/
function showChurchList ()
{
    $("#church-list-modal").modal("show");
}


/******************************************************************************/
function showHelp ()
{
    //----------------------------------------------------------------------
    var v = G_DateLastUpdated.split("/");
    var dtUpdated = new Date(v[2], v[1] - 1, v[0]);
    var formattedDate = dtUpdated.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}).replace(/ /g, '-');



    //----------------------------------------------------------------------
    var s = $("#help-modal").html();
    var addr = "jamie" + "@" + "critos.co.uk";
    var text = "<a href='mail" + "to:" + addr + "'>" + addr + "</a>";
    s = s.replace("$contact$", text);
    s = s.replace("$softwareVersion$", "" + C_SoftwareVersion);
    s = s.replace("$dataDate$", formattedDate);
    s = s.replace("$outOfDateVisibility$", dataOutOfDate() ? "display": "none");
    s = s.replace("$warnAfterDays$", "" + C_WarnAfterDays);



    //----------------------------------------------------------------------
    $("#help-modal").html(s);
    $("#help-modal").modal("show");
}


/******************************************************************************/
function showPopupsChangeHandler ()
{
    G_ShowingPopups = $("#show-popups").is(":checked");

    G_InPopupCloseProcessing = true;
    G_InPopupOpenProcessing = true;

    if (G_ShowingPopups)
	for (var i = 0; i < G_SelectedItems.length; ++i)
	    G_Popups[G_SelectedItems[i]].addTo(G_Map);
    else
    {
	for (var i = 0; i < G_SelectedItems.length; ++i)
	{
	    G_Popups[G_SelectedItems[i]].removeFrom(G_Map);
	}
    }

    G_InPopupCloseProcessing = false;
    G_InPopupOpenProcessing = false;

    $("#main-menu-button").dropdown("toggle");
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                            Location tracking                             **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
var G_PersonMarker = null;


/******************************************************************************/
function displayCurrentLocation (position)
{
    if (null === position)
    {
	$('.leaflet-pane img[src="images/person.png"]').hide();
	$('.leaflet-pane img[src="images/personShadow.png"]').hide();
    }
    else
    {
	if (null === G_PersonMarker)
	    G_PersonMarker = L.marker(position.latlng, {icon: G_Icons.Person, riseOnHover:false}).addTo(G_Map);
	else
	    G_PersonMarker = L.marker([position.latitude, position.longitude]).update(G_PersonMarker);

	$('.leaflet-pane img[src="images/person.png"]').show();
	$('.leaflet-pane img[src="images/personShadow.png"]').show();
    }
}


/******************************************************************************/
function trackMeChangeHandler ()
{
    if ($("#track-me").is(":checked"))
	geoLocationOn();
    else
    {
	geoLocationOff();
	displayCurrentLocation(null);
	return;
    }

    $("#main-menu-button").dropdown("toggle");
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                            Deanery statistics                            **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
var G_Deanery; // The deanery currently selected for display.
var G_PopulationChart;
var G_ReligionChart;


/******************************************************************************/
function shownDeaneryModal ()
{
    showDeaneryCharts();
}


/******************************************************************************/
/* Called when closing the deanery modal. */

function closeDeaneryModal ()
{
    G_PopulationChart.clearChart();
    G_ReligionChart.clearChart();
}


/******************************************************************************/
/* The per-deanery buttons are disabled on startup, because we need to have
   loaded Google charting stuff before they can be used.  This is called when
   the load is complete, to enable the buttons. */

function enableDeaneryButtons ()
{
    $(".legend").prop("disabled", false);
}


/******************************************************************************/
function showDeaneryCharts ()
{
    /*************************************************************************/
    $("#general-modal-body").scrollTop(0);



    /*************************************************************************/
    var deanery = G_Deanery;



    /*************************************************************************/
    var options =
    {
        title: G_Deanery + ": Actual / projected population by year and age group",
        hAxis: {titleTextStyle: {color: "#333"}, format:"#"},
        vAxis: {minValue: 0},
	chartArea: {"width":"80%", "height":"80%"},
        isStacked: true,
        pointSize: 5,
	legend: {position: "top"}
    };

    deanery = deanery.replace(" ", "");
    G_PopulationChart = new google.visualization.AreaChart(document.getElementById("population-chart"));
    G_PopulationChart.draw(google.visualization.arrayToDataTable(G_PopulationByDeanery[deanery]), options);



    /*************************************************************************/
    options =
    {
        title: G_Deanery + ": Trends in religion",
        hAxis: {titleTextStyle: {color: "#333"}, format:"#"},
        vAxis: {minValue: 0},
	chartArea: {"width":"80%", "height":"80%"},
	colors: ["red", "green", "blue", "orange", "pink", "teal", "black", "brown"],
        pointSize: 5,
	legend: {position: "top"}
    };

    G_ReligionChart = new google.visualization.LineChart(document.getElementById("religion-chart"));
    G_ReligionChart.draw(google.visualization.arrayToDataTable(G_ReligionTrends[deanery]), options);
}


/******************************************************************************/
function showDeaneryInformation (deanery)
{
    /*************************************************************************/
    $("#general-modal-title").text(deanery + " Deanery");
    $("#general-modal").modal("show");
    G_Deanery = deanery;
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
    var PRECISION = 1e5;

    var points = [];
    var lat = 0;
    var lon = 0;

  var values = decodeIntegers( value, function( x, y ){
      lat += x;
      lon += y;
      points.push([ lat / PRECISION, lon / PRECISION ]);
  });

    return points;
}

function decodeSign ( value )
{
    return value & 1 ? ~( value >>> 1 ) : ( value >>> 1 );
}

function decodeIntegers ( value, callback )
{
    var values = 0;
    var x = 0;
    var y = 0;

    var byte = 0;
    var current = 0;
    var bits = 0;

  for( var i = 0; i < value.length; i++ ) {

      byte = value.charCodeAt( i ) - 63;
      current = current | (( byte & 0x1F ) << bits );
      bits = bits + 5;

      if( byte < 0x20 ) {
	  if( ++values & 1 ) {
              x = decodeSign( current );
      } else {
          y = decodeSign( current );
          callback( x, y );
      }
	  current = 0;
	  bits = 0;
    }
  }

    return values;
}
