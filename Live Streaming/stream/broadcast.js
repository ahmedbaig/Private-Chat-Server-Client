const AUTH = btoa("")
window.onload = function (e) { 
    var token = document.getElementById('token')
    var eventId = document.getElementById('event')
    console.log(token)
    $(document).ready(function () {
        $('#submit').click(function (){
           
            var uri = 'http://localhost:4040/api/userSession/verify?token='+token.value
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
                    console.log(data.user.role)
                   
                    if(data.user.role == 'promoter'){
                        var uri = 'http://localhost:4040/detailEvent/'+eventId.value
                      
                        $.ajax({
                            url: uri,
                            dataType: 'json',
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                "Content-Type": "application/json",
                                "Accept": "*/*",
                             },
                            method: 'GET',
                            success: function (eventdata) {
                                console.log(eventdata.creator._id)
                                console.log(eventdata.event)
                                if(data.user._id == eventdata.creator._id && eventdata.event.adminApproval == 'approved')
                                $('#getStream').show()
                                $("#getStream").click(function () { 
                                    $.ajax({
                                        url: 'https://api.mux.com/video/v1/live-streams',
                                        dataType: 'json',
                                        headers: {
                                            'Access-Control-Allow-Origin': '*',
                                            "Content-Type": "application/json",
                                            "Accept": "*/*",
                                            "Authorization": `Basic ${AUTH}`
                                        },
                                        method: 'POST',
                                        data: JSON.stringify({ "playback_policy": "public", "new_asset_settings": { "playback_policy": "public" } }),
                                        success: function (data) {
                                            data = data.data
                                            console.log(data.stream_key)
                                            console.log(data.playback_ids[0].id)
                                            console.log(data.id) 
                                            
                                           
                                                $('#getStream').hide()
                                                var interval = setInterval(function doStuff(){
                                                    $.ajax({
                                                        url: 'https://api.mux.com/video/v1/live-streams/' + data.id,
                                                        dataType: 'json',
                                                        headers: {
                                                            'Access-Control-Allow-Origin': '*',
                                                            "Content-Type": "application/json",
                                                            "Accept": "*/*",
                                                           
                                                        },
                                                        method: 'GET',
                                                        success: function (comingData) {  
                                                            $('#getStream').hide()
                                                            if (comingData.data.status == 'active') { 
                                                                $('#goLive').show()
                                                                clearInterval(interval);
                                                                $("#goLive").click(function () { 
                                                                var uri = 'http://localhost:4040/api/wallet/create-live-stream?token='+token.value
                                                                $.ajax({
                                                                    url: uri,
                                                                    dataType: 'json',
                                                                    headers: {
                                                                        'Access-Control-Allow-Origin': '*',
                                                                        "Content-Type": "application/json",
                                                                        "Accept": "*/*",
                                                                     },
                                                                    method: 'POST',
                                                                    data: JSON.stringify({"livestreamId": data.id, "eventId": eventId.value, "playbackId": data.playback_ids[0].id}),
                                                                    success: function (streamData) { 
                                                                    console.log(streamData)
                                                              
                                                                
                                                                $(this).prop('disabled', true);
                                                                var player = window.player = videojs('liveStream');
                                                                var url = 'https://stream.mux.com/' + data.playback_ids[0].id + '.m3u8'
                                                                player.src({
                                                                    src: url,
                                                                    type: 'application/x-mpegURL'
                                                                })
                                                            },
                                                            error: function (error) {
                                                                alert(error);
                                                            }
                                                        });
                                                      })
                                                    }
                                                 }
                                               })
                                             }, 5000); 
                                                                                                 
                                                 
                        
                                            
                                        
                                            $("#video").html('Stream Key: ' + data.stream_key + '<br><br> URL: ' + 'rtmp://global-live.mux.com:5222/app <br><br> Add this to your OBS studio and then hit Get Stream. Your stream will start and then wait for Go Live button')
                                            
                                            // $("video").html('<source src="https://storage.googleapis.com/webfundamentals-assets/videos/chrome.webm" type="application/x-mpegURL"></source>' );
                        
                                            // $("video")[0].load();
                                            // $("video").html('<source src="https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8" type="application/x-mpegURL"></source>' );
                        
                        
                                            // var player = window.player = videojs('yo');
                                            // var url = 'https://stream.mux.com/'+data.data.playback_ids[0].id+'.m3u8'
                                            // player.src({
                                            //     src: url,
                                            //     type: 'application/x-mpegURL'
                                            // })  
                                        },
                                        error: function (error) {
                                            alert(error);
                                        }
                                    });
                        
                                });
                        
                            },
                            error: function (error) {
                                alert(error);
                            }
                        })
                    }
                }
               
        })
    })
        
    });

}