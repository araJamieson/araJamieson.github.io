/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                 Classes                                  **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* A collection of Church or School displayable objects. */

class DisplayableObjectCollection
{
    constructor () {}
    
    add (displayableObject)
    {
	displayableObject.set("eltIndex", this.m_Collection.length);
	this.m_Collection.push(displayableObject);
	this.m_NameIndex.set(displayableObject.data().name, displayableObject);
    }

    forEach (fn) { this.m_Collection.forEach(fn); }

    forEachOfClassType (fn, classType)
    {
	function ofRequiredType (x) { return x.getElementClass() === classType; }
	this.m_Collection.filter(ofRequiredType).forEach(fn);
    }

    
    getAll () { return this.m_Collection; }
    
    getElt (ix) { return this.m_Collection[ix]; }
    
    m_Collection = new Array();
    m_NameIndex = new Map();
}
	

/******************************************************************************/
/* A base class for displayable objects. */

class DisplayableObject
{
    constructor (data) { this.m_Data = data; }

    data () { return this.m_Data; }

    display (onOrOff) {}

    getElementClass () {}
    
    getIconName () {}
    
    hideParishBoundary () {}
    
    includeInSelectionMenu () { return false; }
    
    select ()
    {
	this.showParishBoundary();
	this.setMarkerToSelected();
    }
    
    set (key, val) { this.m_Data[key] = val; }

    setMarkerToSelected ()
    {
	var ix = this.data().eltIndex;
	G_Markers[ix].options.icon = G_Icons[this.getIconName() + "Sel"];
	G_Markers[ix].removeFrom(G_Map);
	G_Markers[ix].addTo(G_Map);
	if (G_ShowingPopups) G_Popups[ix].openOn(G_Map);
    }

    setMarkerToUnselected ()
    {
	var ix = this.data().eltIndex;
	G_Markers[ix].options.icon = G_Markers[ix].myOriginalIcon;
	G_Markers[ix].removeFrom(G_Map);
	G_Markers[ix].addTo(G_Map);
    }

    showParishBoundary () {}

    unselect ()
    {
	this.hideParishBoundary();
	this.setMarkerToUnselected();
    }
}


/******************************************************************************/
/* Church. */

class Church extends DisplayableObject
{
    constructor (data)
    {
	super(data);
    }

    getElementClass () { return "church"; }

    getIconName () { return "church" + super.data().deanery + super.data().churchmanship; }

    hideParishBoundary ()
    {
	var myData = this.data();
	if (myData.hasOwnProperty("parishBoundary") && null !== myData.parishBoundary)
	    myData.parishBoundary.removeFrom(G_Map);
    }
    
    showParishBoundary ()
    {
	var myData = this.data();
	if (myData.hasOwnProperty("parishBoundary") && null !== myData.parishBoundary)
	myData.parishBoundary.addTo(G_Map);
    }
    
    includeInSelectionMenu () { return true; }
}



/******************************************************************************/
/* School. */

class School extends DisplayableObject
{
    constructor (data)
    {
	super(data);
    }

    display (onOrOff)
    {
    }

    getElementClass () { return "school"; }

    getIconName () { return "school" + super.data().deanery + (super.data().type === "Primary" ? "Primary" : "Secondary"); }

    showPopup (onOrOff)
    {
    }
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                 Global                                   **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
const C_ParishColouring = { Hackney:"#FFB6C1", Islington:"#FF00FF", TowerHamlets:"#9ACD32" };
const C_SoftwareVersion = 0.4;
const C_WarnAfterDays = 90;


/******************************************************************************/
var G_DataLastUpdated = "???"; // Date when the underlying data was last updated.
var G_DisplayableObjectCollection = new DisplayableObjectCollection(); // All the Church and School objects.
var G_Icons = {}; // All available icons.
var G_Map; // The map.
var G_Markers = []; // All markers.
var G_Popups = []; // All popups.
var G_ShowingPopups; // True if any popups are visible.


/******************************************************************************/
/* Kicks everything off. */

function onLoad ()
{
    $("#show-popups").prop("checked", true);
    $("#track-me").prop("checked", false);
    G_ShowingPopups = $("#show-popups").is(":checked");
    initialiseData();
    handleHeights();
    makeMap();
    makeIcons();
    G_DisplayableObjectCollection.forEach(makeMarker);
    makeMenu();
    G_DisplayableObjectCollection.forEach(makeParishBoundary);
    autoClosePopups(false);
    $("#general-modal").on("shown.bs.modal", shownDeaneryModal);
    geographicalSearchInitialise();
    // $$$ See below.  setUpForObtainingLocations();
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                              Initialisation                              **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* Reads the data exported from the spreadsheet. */

function initialiseData ()
{
    addChurches();
    addSchools();

    function fn (x)
    {
	var data = x.data();
	if (data.hasOwnProperty("popUp"))
	    data.popUp = data.popUp.replace("@index@", data.eltIndex);
    }

    G_DisplayableObjectCollection.forEach(fn);
}


/******************************************************************************/
/* Creates the full set of icons. */

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
	    popupAnchor:  popupAnchor,
	});



    /*************************************************************************/
    /* Added in support of things like geographical search locator. */
    
    iconSize = [23, 42];
    iconAnchor = [12, 42];
 
    G_Icons.SelectedLocation = 
	L.icon({
	    iconUrl:      'images/selectedLocationMarker.png',
	    iconSize:     iconSize,
	    iconAnchor:   iconAnchor,
	    className:    'blinking'
	});
   

    
    /*************************************************************************/
    iconSize = [23, 42];
    iconAnchor = [12, 42];
    shadowSize = [48, 57];
    shadowAnchor = [12, 45];
    var popupAnchor = [0, -44]; // Don't think this is used -- the popup belongs to the Sel version of the icon.
    

    
    /*************************************************************************/
    function createIcon (collection, deanery, type, selected)
    {
	var iconUrl = "images/" + collection + deanery + type + selected + ".png";
	return L.icon({
	    iconUrl:      iconUrl,
	    shadowUrl:    "images/shadow.png",
	    iconSize:     iconSize,
	    shadowSize:   shadowSize,
	    iconAnchor:   iconAnchor,
	    shadowAnchor: shadowAnchor,
	    popupAnchor:  popupAnchor
	});
    }

    

    /*************************************************************************/
    var classTypes = ["church", "school"];
    var deaneries = ["Hackney", "Islington", "TowerHamlets"];
    var selecteds = ["", "Sel"];
    var types = ["Evangelical", "High", "Liberal", "Unknown"];
    for (var classType of classTypes)
    {
	for (var deanery of deaneries)
	    for (var type of types)
		for (var selected of selecteds)
		    G_Icons[classType + deanery + type + selected] = createIcon(classType, deanery, type, selected);

	types = ["Primary", "Secondary"];
    }
}


/******************************************************************************/
/* Creates the map. */

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

    G_Map.on("popupopen",  function (e) {  selectOne  (e.popup);  });
    G_Map.on("popupclose", function (e) {  unselectOne(e.popup);  });

    L.control.scale({metric:true, imperial:true, maxWidth:200}).addTo(G_Map);
}


/******************************************************************************/
/* Makes a marker and popup for each displayable item. */

function makeMarker (x)
{
    data = x.data();
    var parishBoundaryMarker = ""; if (data.hasOwnProperty("dataBoundary") && 0 !== data.dataBoundary.length) parishBoundaryMarker = "* ";
    var icon = G_Icons[x.getIconName()];
    var marker = L.marker([data.latitude, data.longitude], {icon: icon, riseOnHover:true}).addTo(G_Map);
    var popup = L.popup().setLatLng([data.latitude, data.longitude]).setContent(data.popUp);
    marker.bindPopup(popup);
    if (!isTouchScreen()) marker.bindTooltip(parishBoundaryMarker + data.name);
    G_Markers.push(marker);
    G_Popups.push(popup);
    data.marker = marker;
    data.popup = popup;
    marker.myOriginalIcon = icon;
    marker.myOnMap = true;
    marker.myPopup = popup;
    popup.myOwnersUniqueId = data.eltIndex;
}


/******************************************************************************/
/* Makes a selection menu for items which are prepared to be found by name. */

function makeMenu ()
{
    /**************************************************************************/
    var details = new Array();
    
    function gatherInfo (x)
    {
	if (x.includeInSelectionMenu())
	    details.push(x.data().name + "%%%" + x.data().eltIndex);
    }

    G_DisplayableObjectCollection.forEach(gatherInfo);
    details.sort();


    /**************************************************************************/
    var html = "";
    
    function createHtml (x)
    {
	var bits = x.split("%%%");
	html += "<li><a class='dropdown-item' href='javascript:selectItem(" + bits[1] + ")'>" + bits[0] + "</a></li>";
    }
    
    details.forEach(createHtml);
	    



    /**************************************************************************/
    $("#menu-of-churches").html(html);
}


/******************************************************************************/
/* For those things which have a parish boundary, associates an appropriate
   polygon with the element. */

function makeParishBoundary (elt)
{
    elt.set("parishBoundary", null);

    if (!elt.data().hasOwnProperty("dataBoundary")) return;

    var dataBoundary = elt.data().dataBoundary;
    if (0 === dataBoundary.length) return;
    
    var polygon = L.polygon(decode(dataBoundary), {color: C_ParishColouring[elt.data().deanery]});
    elt.set("parishBoundary", polygon);
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
    G_Deanery = deanery;
    $("#general-modal-title").text(deanery + " Deanery");
    $("#general-modal").modal("show");
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                           Geographical search                            **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
var G_SelectedLocationMarker = null;


/******************************************************************************/
function geographicalSearchClear ()
{
    $("#geographical-search").val("");
}


/******************************************************************************/
function geographicalSearchInitialise ()
{
    geographicalSearchClear();

    $("#geographical-search")[0].addEventListener
    (
	"keyup",
	function (event)
	{
	    if (event.keyCode === 13)
	    {
		event.preventDefault();
                geographicalSearch();
	    }
	}
    );
}


/******************************************************************************/
function geographicalSearch ()
{
    /*************************************************************************/
    var geographicalSearch = $("#geographical-search").val().trim();

    if (0 === geographicalSearch.length)
    {
	geographicalSearchClear();
	return;
    }
    


    /*************************************************************************/
    if (geographicalSearch.match(/[a-z]+\.[a-z]+\.[a-z]+/i))
    {
	geographicalSearchWhat3Words(geographicalSearch);
	return;
    }


    
    /*************************************************************************/
    var requestText = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(geographicalSearch) + "&format=json&addressdetails=1&extratags=1&limit=2&countrycodes=gb&viewbox=-0.4,51.4,0.07,51.6&bounded=1";
    const req = new XMLHttpRequest();
    req.responseType = "json";
    req.open("GET", requestText);
    req.send();
    req.onreadystatechange = function ()
    {
	if (4 == this.readyState)
	    geographicalSearchResponse(req.response, this.status);
    };
}


/******************************************************************************/
function geographicalSearchMatchesChurch (postcode)
{
    postcode = postcode.toUpperCase();

    function fn (x)
    {
	if (postcode == x.data().postcode.toUpperCase())
	{
	    geographicalSearchClear();
	    selectItem(x.data().eltIndex);
	    throw true;
	}
    }

    try
    {
	G_DisplayableObjectCollection.forEach(fn);
	return false;
    }
    catch (e)
    {
	return true;
    }
}



/******************************************************************************/
function geographicalSearchPositionMarker (lon, lat)
{
    /*************************************************************************/
    var latLng = L.latLng(lat, lon);

    if (null === G_SelectedLocationMarker)
    {
	G_SelectedLocationMarker = L.marker(latLng, {icon: G_Icons.SelectedLocation, riseOnHover:false}).addTo(G_Map);
	G_Map.panTo(latLng);
    }
    else
    {
	G_SelectedLocationMarker.setLatLng(latLng);
	G_Map.panTo(latLng);
    }



    /*************************************************************************/
    geographicalSearchClear();
    $("#geographical-search-modal").modal("hide");
}


/******************************************************************************/
function geographicalSearchResponse (response, status)
{
    /*************************************************************************/
    if (200 != status)
    {
	alert("Search failed.");
	return;
    }



    /*************************************************************************/
    if (0 == response.length)
    {
	alert("No match found.");
	return;
    }



    /*************************************************************************/
    if (1 != response.length)
	alert("Ambiguous search.  Taking the first match.");



    /*************************************************************************/
    response = response[0];
    if (geographicalSearchMatchesChurch(response.address.postcode))
	return;


    
    /*************************************************************************/
    geographicalSearchPositionMarker(response.lon, response.lat);
}


/******************************************************************************/
function geographicalSearchWhat3Words (searchString)
{
    what3words.api.convertToCoordinates(searchString.toLowerCase()).then
    (
	function (response)
	{
	    geographicalSearchPositionMarker(response.coordinates.lng, response.coordinates.lat);
	},

	function (err)
	{
	    alert("Search failed.");
	}
    );
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                           Selection processing                           **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
var G_InPopupCloseProcessing = false; // Prevents recursion during popup close processing.
var G_InPopupOpenProcessing = false;  // Prevents recursion during popup open  processing.
var G_ParishBoundariesDisplayed = ""; // Parish boundaries presently visible.
var G_SelectedItems = [];             // List of all items currently selected.


/******************************************************************************/
/* For selected items, accumulates information for use in the footer.  This is
   slightly complicated.  ElectoralRoll and parish population apply across
   a parish, not to an individual church, plus they aren't always available
   anyway.  In addition, they may actually be recorded against more than one
   church in the parish, or only against a single one. */

function accumulateInformationForSelectedItems ()
{
    //----------------------------------------------------------------------
    if (0 === G_SelectedItems.length)
    {
	$("#accumulated-data").css("visibility", "hidden");
	return;
    }


    
    //----------------------------------------------------------------------
    class ParishData
    {
	constructor (electoralRoll, parishPopulation) { this.m_ElectoralRoll = electoralRoll; this.m_parishPopulation = parishPopulation; }

	m_ElectorallRoll = 0;
	m_ParishPopulation = 0;

	m_ElectoralRollError = false;	
	m_ParishPopulationError = false;	
    };


    
    //----------------------------------------------------------------------
    // Get a list of parishes.
    
    var parishes = new Map();
    function getParishes (ix) { parishes.set(ix, new ParishData(0, 0)); }
    G_SelectedItems.forEach(getParishes);
    


    //----------------------------------------------------------------------
    // Get the data for each parish.
    
    for (const [key, value] of parishes)
    {
	var churchesInParish = G_DisplayableObjectCollection.getAll().filter(x => x.data().hasOwnProperty("parish") && x.data().parish == key);
	for (var i = 0; i < churchesInParish.length; ++i)
	{
	    var data = churchesInParish[i].data();

	    var electoralRoll = parseInt(data.electoralRoll);
	    var parishPopulation = parseInt(data.wikipediaPopulationOfParish);
	    
	    if (0 === value.m_ElectoralRoll)
		value.m_ElectoralRoll = electoralRoll;
	    else if (value.m_ElectoralRoll !== electoralRoll)
		value.m_ElectoralRollError = true;
		
	    if (0 === value.m_ParishPopulation)
		value.m_ParishPopulation = parishPopulation
	    else if (value.m_ParishPopulation !== parishPopulation)
		value.m_ParishPopulationError = true;
	}
    }


    
    //----------------------------------------------------------------------
    var dubiousElectoralRoll = false;
    var dubiousParishPopulation = false;
    var totalElectoralRoll = 0;
    var totalParishPopulation = 0;

    function accumulate (x)
    {
	dubiousElectoralRoll = dubiousElectoralRoll || x.m_ElectoralRollError;
	dubiousParishPopulation = dubiousParishPopulation || x.m_ParishPopulationError;

	if (!x.m_ElectoralRollError) totalElectoralRoll += x.m_ElectoralRoll;
	if (!x.m_ParishPopulationError) totalParishPopulation += x.m_ParishPopulation;
    }

    const iterator = parishes.values();
    let result = iterator.next();
    while (!result.done)
    {
	accumulate(result.value)
	result = iterator.next();
    }
    


    //----------------------------------------------------------------------
    if (0 === totalElectoralRoll)
	totalElectoralRoll = "";
    else
	totalElectoralRoll = "Total electoral roll: " + totalElectoralRoll + (dubiousElectoralRoll ? " (Figure incomplete)" : "");

    if (0 === totalParishPopulation)
	totalParishPopulation= "";
    else
	totalParishPopulation = "Total parish pop: " + totalParishPopulation + (dubiousParishPopulation ? " (Figure incomplete)" : "");

    var sep = 0 === totalElectoralRoll.length || 0 === totalParishPopulation.length ? "" : " • ";
    var text = totalElectoralRoll + sep + totalParishPopulation;


    //----------------------------------------------------------------------
    var dist = "";
    if (2 === G_SelectedItems.length)
    {
	var ix0 = G_SelectedItems[0];
	var ix1 = G_SelectedItems[1];
	var d = distance(G_DisplayableObjectCollection.getElt(ix0).data().latitude, G_DisplayableObjectCollection.getElt(ix0).data().longitude,
			 G_DisplayableObjectCollection.getElt(ix1).data().latitude, G_DisplayableObjectCollection.getElt(ix1).data().longitude);
	dist = "Dist: " + d.toFixed(1) + "mls • ";
    }


    
    //----------------------------------------------------------------------
    sep = 0 === (dist + text).length ? "" : " • ";
    text = "Churches: " + G_SelectedItems.length + sep + dist + text;
    $("#accumulated-data").text(text);
    $("#accumulated-data").css("visibility", "visible");
}


/******************************************************************************/
/* Closes all of the popups in one fell swoop. */

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
/* Limits the display to churches within a given radius of a given church. */

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
    var centreChurch = G_DisplayableObjectCollection.getElt(id);
    var dist = Number(response);

    function f (elt)
    {
	var d = distance(elt.data().latitude, elt.data().longitude, centreChurch.data().latitude, centreChurch.data().longitude);

	if (d <= dist)
	    addMarkerToMap(elt.data().marker);
        else
	    removeMarkerFromMap(elt.data().marker);
	
    }

    G_DisplayableObjectCollection.forEachOfClassType(f, "church");
}


/******************************************************************************/
/* Selects a single item. */

function selectOne (popup)
{
    if (G_InPopupOpenProcessing) return;
    G_InPopupOpenProcessing = true;
    
    var ix = popup.myOwnersUniqueId;

    if (G_SelectedItems.includes(ix)) // User has clicked on an already-selected church -- toggle it.
    {
	G_InPopupOpenProcessing = false;
	unselectOne(popup);
	return;
    }
    
    var owningElement = G_DisplayableObjectCollection.getElt(ix);
    owningElement.select();

    G_SelectedItems.push(ix);
    accumulateInformationForSelectedItems();

    G_InPopupOpenProcessing = false;
}


/******************************************************************************/
/* Closes all popups. */

function unselectAll ()
{
    if (G_InPopupOpenProcessing || G_InPopupCloseProcessing) return;
    G_InPopupCloseProcessing = true;

    function f (owningElt) { owningElt.unselect(); }
    G_DisplayableObjectCollection.forEach(f);
    
    G_SelectedItems = [];
    accumulateInformationForSelectedItems();

    G_InPopupCloseProcessing = false;
}


/******************************************************************************/
/* Closes a given popup. */

function unselectOne (popup)
{
    if (G_InPopupOpenProcessing || G_InPopupCloseProcessing) return;
    G_InPopupCloseProcessing = true;

    var ix = popup.myOwnersUniqueId;
    var owningElement = G_DisplayableObjectCollection.getElt(ix);

    owningElement.unselect();
    
    G_SelectedItems.splice(G_SelectedItems.indexOf(ix), 1);
    accumulateInformationForSelectedItems();

    G_InPopupCloseProcessing = false;
}


/******************************************************************************/
function selectItem (ix)
{
    var x = G_DisplayableObjectCollection.getElt(ix);
    var latLng = L.latLng(x.data().latitude, x.data().longitude);
    G_Map.flyTo(latLng);
    G_Markers[ix].openPopup();
    $("#geographical-search-modal").modal("hide");
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                              Miscellaneous                               **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* Does what it says on the tin. */

function addMarkerToMap (marker)
{
    if (!marker.myOnMap)
    {
	marker.myOnMap = true;
	marker.addTo(G_Map);
    }
}


/******************************************************************************/
/* Checks to see how elderly the data is, with a view to warning if it's very
   old, so that people can check if it needs updating.  I tend to the view that
   we probably no longer want to do this, because the Diocesan Directory, which
   is the main source of church information, is not entirely correct, and
   updating the data risks losing the manual corrections which I have applied
   to it. */

function dataOutOfDate ()
{
    var v = G_DataLastUpdated.split("/");
    var dtUpdated = new Date(v[2], v[1] - 1, v[0]);
    var today = new Date();
    var daysSinceLastUpdate =  Math.floor((today.getTime() - dtUpdated.getTime()) / (1000 * 60 * 60 * 24));
    return (daysSinceLastUpdate > C_WarnAfterDays);
}

    
/******************************************************************************/
/* Does what it say on the tin. */

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
/* As I recall, the purpose of this is to arrange that the contents are set up
   appropriately according to the device size and orientation, and also takes
   account of changes in the size of the window. */

function handleHeights ()
{
    setDimensions();
    window.onorientationchange = function() { setTimeout(setDimensions, 1000); };
    window.onresize = function() { setTimeout(setDimensions, 100); };
}


/******************************************************************************/
/* What it says on the tin. */

function isTouchScreen ()
{
    return ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}


/******************************************************************************/
/* What it says on the tin. */

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
/* Shows the window which serves as the search-by-name menu. */

function showGeographicalSearchModal ()
{
    $("#geographical-search-modal").modal("show");
    $("#modal-body-church-list").scrollTop(0);

}


/******************************************************************************/
/* What it says on the tin. */

function showHelp ()
{
    //----------------------------------------------------------------------
    var v = G_DataLastUpdated.split("/");
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
    $("#help-modal").scrollTop(0);
    $("#help-modal").modal("show");
}


/******************************************************************************/
/* Responds to the overall control which determines whether popups are visible.
   Popups are useful in that they show information which may be of interest,
   but they may be quite big, and may therefore obscure the map. */

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





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                            Location tracking                             **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/* Can't quite recall what this is for.  I _think_ I wrote it because the tool
   was being used on a mobile phone from a bike, and we wanted the map to
   re-centre itself from time to time so that the user's actual location
   remained in sight.  However, picking up the GPS data proved difficult and
   seemed to work differently on different devices, and I don't think the
   code was ever really used. */

/******************************************************************************/
var G_PersonMarker = null;


/******************************************************************************/
/* This checks to see if the location passed via the arguments is close to the
   edge of the map as currently displayed.  If so, it proposes a revised centre
   for the map so that the person icon is reasonably well centered.  Note that
   at present I can't convince myself this degree of sophisticaion is
   necessary, so the caller may ignore the proposed location, and simply
   recentre on the given location if the present routine implies that
   repositioning is needed. */

function closeToEdge (longitude, latitude)
{
    /**************************************************************************/
    const fac = 0.2;
    var bounds = G_Map.getBounds();
    var height = bounds.getNorth() - bounds.getSouth();
    var width = bounds.getEast() - bounds.getWest();
    var changed = false;
    var newLatitude = latitude;
    var newLongitude = longitude;



    /**************************************************************************/
    var bottomBeforeRecentre = bounds.getSouth() + height * fac;
    if (latitude < bottomBeforeRecentre)
    {
	changed = true;
	newLatitude = bounds.getSouth();
    }
    else
    {
	var topBeforeRecentre = bounds.getNorth() - height * fac;
	if (latitude > topBeforeRecentre)
	{
	    changed = true;
	    newLatitude = bounds.getNorth();
	}
    }
    
    
    /**************************************************************************/
    var leftBeforeRecentre = bounds.getWest() + width * fac;
    if (longitude < leftBeforeRecentre)
    {
	changed = true;
	return newLongitude = bounds.getWest();
    }
    else
    {
	var rightBeforeRecentre = bounds.getEast() - width * fac;
	if (longitude > rightBeforeRecentre)
	{
	    changed = true;
	    newLongitude = bounds.getEast();
	}
    }



    /**************************************************************************/
    if (!changed) return null;
    return [newLongitude, newLatitude];
}


/******************************************************************************/
/* Shifts the display so as to keep the present location reasonably well
   centred. */

function displayCurrentLocation (longitude, latitude)
{
    if (null === longitude)
    {
	$('.leaflet-pane img[src="images/person.png"]').hide();
	$('.leaflet-pane img[src="images/personShadow.png"]').hide();
    }
    else
    {
	var latLng = L.latLng(latitude, longitude);
	
	if (null === G_PersonMarker)
	{
	    G_PersonMarker = L.marker(latLng, {icon: G_Icons.Person, riseOnHover:false}).addTo(G_Map);
	    G_Map.panTo(latLng);
	}
	else
	{
	    G_PersonMarker.setLatLng(latLng);
	    var newPos = closeToEdge(longitude, latitude);
	    if (newPos) // Reposition entire map.
	    {
		// $$$ Ignore the proposed location.  latLng = L.latLng(newPos[1], newPos[0]);
		G_Map.panTo(latLng);
	    }
	}

	$('.leaflet-pane img[src="images/person.png"]').show();
	$('.leaflet-pane img[src="images/personShadow.png"]').show();
    }
}


/******************************************************************************/
/* Can't get GPS data. */

function notifyGeoLocationFailed ()
{
    $("#track-me").prop("checked", false);
    $("#track-me").prop("disabled", true);
    $("#track-me-prompt").css("color", "gray");
}


/******************************************************************************/
/* Used to control the adjustment of the map in order to keep the user's actual
   location visible. */

function trackMeChangeHandler ()
{
    if ($("#track-me").is(":checked"))
	geoLocationOn();
    else
    {
	geoLocationOff();
	displayCurrentLocation(null, null);
	return;
    }

    $("#main-menu-button").dropdown("toggle");
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                              Map refinement                              **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/*
  It proved to be very difficult to obtain accurate location information for
  the churches which appeared in the initial implementation.  In the end, I
  had to map the postcodes to coordinates and use that.  However, this is
  somewhat of a blunt instrument, in that postcodes can cover a somewhat
  extended area, and the church therefore still cannot be located precisely.

  To address this (albeit somewhat painfully), arrange for the following
  method to be called.

  You can now select one church at a time (by clicking on the peg, or by
  searching for it), and then click RIGHT at the location where the peg
  should actually lie.  Provided you deselect the church once you have
  done this, you can repeat proceedings multiple times with different
  churches if you wish.

  Finally, click right with no churches selected, and an alert will appear
  giving the names of the churches and their coordinates, and you can cut
  and paste this into the spreadsheet.
/******************************************************************************/

/******************************************************************************/
var G_AccumulatedCoordinates = ""; // Used to collect coordinates when accumulating information to enable churches to be positioned more accurately.


/******************************************************************************/
function setUpForObtainingLocations ()
{
    G_Map.addEventListener
    (
	'contextmenu',
	function(ev)
	{
	    if (0 == G_SelectedItems.length)
	    {
		alert("Accumulated coordinates:" + "\n" + G_AccumulatedCoordinates);
		G_AccumulatedCoordinates = "";
		return;
	    }
	    
	    if (G_SelectedItems.length > 1)
	    {
		alert("More than one church selected.");
		return;
	    }
	    
	    lat = ev.latlng.lat;
	    lng = ev.latlng.lng;

	    var name = G_DisplayableObjectCollection.getElt(G_SelectedItems[0]).data().name;

	    G_AccumulatedCoordinates += "\n" + name + "\t" + lat + "\t" + lng;
	    document.execCommand("copy");
	}
    );
}
