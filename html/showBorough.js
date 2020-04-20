/******************************************************************************/
/* Temporary intermediary to get round the fact that github won't let you have
   multiple web pages. */

function showBoroughInformation (borough)
{
    $("#general-modal-title").text("General information for " + borough);
    borough = borough.replace(" ", "").toLowerCase();
    var htmlString =
	   `<html>
              <head>
                <link rel="stylesheet" href="./css/local.css">
              </head>
              <body>
                <h3 style="text-align:center">Some (genuine) sample information</h3>
                <img src="./images/${borough}.gif" style="width:800" class="centred"></img>
              </body>
            </html>`;
    $("#general-modal-content").attr("srcdoc", htmlString);
    $("#general-modal").modal("show");
}

