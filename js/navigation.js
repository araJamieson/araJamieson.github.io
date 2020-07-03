/******************************************************************************/
var G_WatchId = null;


      
/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                  Public                                  **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
function geoLocationOff ()
{
    if (!navigator.geolocation) return;
    try { navigator.geolocation.clearWatch(G_WatchId); } catch (err) {}
    G_WatchId = null;
}


/******************************************************************************/
function geoLocationOn ()
{
    if (!navigator.geolocation)
    {
	alert("Tracking facility not available.");
	return;
    }

    var options =
    {
	enableHighAccuracy: false,
	timeout: 10000,
	maximumAge: 150000
    };
    

    G_WatchId = navigator.geolocation.watchPosition(geoLocationNewPosition, geoLocationErr, options);
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                  Private                                 **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
function geoLocationErr (err)
{
    alert(err.message);
    notifyGeoLocationFailed();
}


/******************************************************************************/
function geoLocationNewPosition (position)
{
    displayCurrentLocation(position.coords.longitude, position.coords.latitude);
}

