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
    try { G_Map.stopLocate(); } catch (err) {}
}


/******************************************************************************/
function geoLocationOn ()
{
    var options =
    {
	watch: true,
	setView: true,
	maxZoom: 16,
	timeout: 10000,
	enableHighAccuracy: false,
	maximumAge: 15000
    };

    G_Map.on("locationfound", geoLocationNewPosition);
    G_Map.on("locationerror", geoLocationNotWorking);

    G_Map.locate(options);
}





/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**                                  Private                                 **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
var m_PreviousLatLng = null;


/******************************************************************************/
function geoLocationNewPosition (position)
{
    if (m_PreviousLatLng && position.latlng.equals(m_PreviousLatLng)) return;
    m_PreviousLatLng = position.latlng;
    displayCurrentLocation(position);
}


/******************************************************************************/
function geoLocationNotWorking (err)
{
    geoLocationOff();
    alert("Location information not available: " + err.message);
}
