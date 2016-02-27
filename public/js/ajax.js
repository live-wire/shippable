

function check()
{

  var link = $('#git').val();
  link = link.trim();
  $('#loading-indicator').show();

  console.log(link);
  $.ajax({
        url: 'http://localhost:3000/processURL',
        // dataType: "jsonp",
        data: {"link":link},
        type: 'POST',
        jsonpCallback: 'callback', // this is not relevant to the POST anymore
        success: function (data) {
            console.log('Success: '+data);
            //var ret = jQuery.parseJSON(data);
            $('#open').html(data.open);
            $('#seven').html(data.seven);
            $('#twenty').html(data.twenty);
            $('#loading-indicator').hide();
            
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error.message);
            $('#open').html('---');
            $('#seven').html('---');
            $('#twenty').html('---');
            $('#loading-indicator').hide();
        },
    });
}