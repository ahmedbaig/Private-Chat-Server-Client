

var token =  document.getElementById("token");
var eventId = document.getElementById('event')
$(document).ready(function() {
    $("#video").click(function(){
        
        var uri = 'http://localhost:4040/api/wallet/fetch-user-All-purchasedTickets?token='+token.value
        console.log(uri)
        $.ajax({
            url: uri,
            dataType: 'json',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json",
                "Accept": "*/*",
             },
            method: 'GET',
            success: function (data) {
                data.tickets.forEach(ticket=>{
                    console.log(ticket.eventId)
                    if(ticket.eventId == eventId.value){
                        var uri = 'http://localhost:4040/api/wallet/fetch-user-purchased-virtualEventTicket/'+ticket._id+'?token='+token.value
                        $.ajax({
                            url: uri,
                            dataType: 'json',
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                "Content-Type": "application/json",
                                "Accept": "*/*",
                             },
                            method: 'GET',
                            success: function (ticketdata) {
                                console.log(ticketdata.streamEvent)
                                var uri = 'https://api.mux.com/video/v1/live-streams/'+ticketdata.streamEvent.livestreamId

                                $.ajax({
                                            url: uri,
                                            dataType: 'json',  
                                            headers: {
                                              'Access-Control-Allow-Origin': '*',
                                              "Content-Type": "application/json",
                                              "Accept": "*/*",
                                            //   "Authorization": `Basic ${btoa("15df9e19-1dfa-4a02-9e81-c822e4124889:TRPUR4FCq6VhvSJbzG2Rexmuln+02UWNVOXqwXtlyVYlNG/wifjg15nNjHfF3eVx7EE7t+2Nrc+")}`
                                            },
                                            method: 'GET', 
                                            success: function(comingData){
                                                var comingData = JSON.parse(JSON.stringify(comingData))
                                                if(comingData.data.status == 'active'){
                                                    
                                                    $(this).prop('disabled',true);
                                                    var player = window.player = videojs('yo');
                                                    var url = 'https://stream.mux.com/'+ticketdata.streamEvent.playbackId+'.m3u8'
                                                    player.src({
                                                        src: url,
                                                        type: 'application/x-mpegURL'
                                                    })  
                                                }
                                                else{
                                                    var player = window.player = videojs('yo');
                                                    var url = 'https://stream.mux.com/'+ticketdata.streamEvent.playbackId+'/medium.mp4'
                                                    player.src({
                                                        src: url,
                                                        type: 'video/mp4'
                                                    })  
                                                }
                                                
                                            },
                                            error : function(error) {
                                                
                                                $("#error").html('Invalid Url')
                                                
                                                
                                            }
                                        })
                                    
                            }
                        })
                    }
                })
            }
        })
       
        
    //    
    })


})

