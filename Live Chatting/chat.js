const PUBLIC_KEY_MLS = "" // MLS ONLY
const serverOrigin_MLS = 'https://admin.lyve.fm' // MLS ONLY
const chatServerOrigin_MLS = '' // MLS ONLY

const PUBLIC_KEY_SPLY = "" // SPLY ONLY
const serverOrigin_SPLY = null // SPLY ONLY
const chatServerOrigin_SPLY = '' // SPLY ONLY

let socket = ""
let changed = false
window.onload = function (e) { 
    var token = document.getElementById('token')
    let session_token = null;
    let authorization_token = null; 
    let system = $('#system').val()
    $(document).ready(function () {
        $('#system').on('change', function () {
            if ($('#system').val() == 'sply') {
                $('#username').show()
            } else {
                $('#username').hide()
            }
        })
        $('#submit').click(function () {
            if ($('#system').val() == 'lyve') {
                var uri =  `${serverOrigin_MLS}/api/userSession/verify?token=`+token.value
                $.ajax({
                    url: uri,
                    dataType: 'json',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                     },
                    method: 'GET',
                    success: function (userdata) {
                       let username= userdata.user.firstName+' '+userdata.user.lastName
                        console.log(userdata.user._id)
                        var uri = `${chatServerOrigin_MLS}/auth/create-session`
                        $.ajax({
                            url: uri,
                            dataType: 'json',
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                "Content-Type": "application/json",
                                "Accept": "*/*",
                             },
                            method: 'POST',
                            data: JSON.stringify({ "auth_key": `${PUBLIC_KEY_MLS}`,'user': userdata.user._id, 'name': username ,'system': 'lyve', 'role': `${$('#role').val()}`, 'meta': `https://api.adorable.io/avatars/285/${username}.png|${$('#role').val()}`}),
                            success: function (sessionData) {
                                console.log(sessionData.session._id)
                                session_token = sessionData.session._id
                                var uri = `${chatServerOrigin}/auth/create-token?session_token=`+sessionData.session._id
                                if(sessionData.authorization_token==null){
                                    $.ajax({
                                        url: uri,
                                        dataType: 'json',
                                        headers: {
                                            'Access-Control-Allow-Origin': '*',
                                            "Content-Type": "application/json",
                                            "Accept": "*/*",
                                         },
                                        method: 'POST',
                                        data: JSON.stringify({ "auth_key": `${PUBLIC_KEY_MLS}`, "session_token": sessionData.session._id, "access": 'true', 'write': 'true', 'read': 'true'}),
                                        success: function (tokenData) {
                                           authorization_token = tokenData.authorization_token
                                           $("#AUTHDATA").append(`SESSION TOKEN: ${session_token} | AUTH_TOKEN: ${authorization_token}`)
                                        }
                                    })
                                }else{
                                    authorization_token = sessionData.authorization_token
                                    $("#AUTHDATA").append(`SESSION TOKEN: ${session_token} | AUTH_TOKEN: ${authorization_token}`)
                                } 
                            }
                        }) 
                    }
                })
            } else if ($('#system').val() == 'sply') {
                var uri = `${chatServerOrigin_SPLY}/auth/create-session`
                let username = $('#username').val()
                $.ajax({
                    url: uri,
                    dataType: 'json',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                        },
                    method: 'POST',
                    data: JSON.stringify({ "auth_key": `${PUBLIC_KEY_SPLY}`,'user': token.value, 'name': username ,'system': 'sply', 'role': `${$('#role').val()}`, 'meta': `https://api.adorable.io/avatars/285/${username}.png|${$('#role').val()}`}),
                    success: function (sessionData) {
                        console.log(sessionData.session._id)
                        session_token = sessionData.session._id
                        var uri = `${chatServerOrigin_SPLY}/auth/create-token?session_token=`+sessionData.session._id
                        if(sessionData.authorization_token==null){
                            $.ajax({
                                url: uri,
                                dataType: 'json',
                                headers: {
                                    'Access-Control-Allow-Origin': '*',
                                    "Content-Type": "application/json",
                                    "Accept": "*/*",
                                    },
                                method: 'POST',
                                data: JSON.stringify({ "auth_key": `${PUBLIC_KEY_SPLY}`, "session_token": sessionData.session._id, "access": 'true', 'write': 'true', 'read': 'true'}),
                                success: function (tokenData) {
                                    authorization_token = tokenData.authorization_token
                                    $("#AUTHDATA").append(`SESSION TOKEN: ${session_token} | AUTH_TOKEN: ${authorization_token}`)
                                }
                            })
                        }else{
                            authorization_token = sessionData.authorization_token
                            $("#AUTHDATA").append(`SESSION TOKEN: ${session_token} | AUTH_TOKEN: ${authorization_token}`)
                        } 
                    }
                })
            }
        })
        $('#getRoom').on('click', function () {
            if ($('#system').val() == 'sply') {
                var uri = `${chatServerOrigin_SPLY}/api/rooms/get-rooms?session_token=`+session_token+'&authorization_token='+authorization_token+'&stream=true'+'&room='+$('#room').val()
            } else {
                var uri = `${chatServerOrigin_MLS}/api/rooms/get-rooms?session_token=`+session_token+'&authorization_token='+authorization_token+'&stream=true'+'&room='+$('#room').val()
            }
            $.ajax({
                url: uri,
                dataType: 'json',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                 },
                method: 'GET',
                success: function (roomData) {
                    if ($('#system').val() == 'sply') {
                        var uri = `${chatServerOrigin_SPLY}/api/messages/livechat-messages?session_token=`+session_token+'&authorization_token='+authorization_token+'&room='+roomData.rooms[0]._id+'&startFrom=0'
                    } else {
                        var uri = `${chatServerOrigin_MLS}/api/messages/livechat-messages?session_token=`+session_token+'&authorization_token='+authorization_token+'&room='+roomData.rooms[0]._id+'&startFrom=0'
                    }
                    $.ajax({
                        url: uri,
                        dataType: 'json',
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            "Content-Type": "application/json",
                            "Accept": "*/*",
                         },
                        method: 'GET',
                        success: function (messages) {
                            console.log(messages)
                            messages.messages.forEach(message => {
                                $('#messages').append(`<div class="message" style="display:block"><img src='${message.meta.split('|')[0]}' style="height=20px;display: inline;border-radius: 100%;width: 20px;"/><h3 style="display: inline-block;padding: 10px;">${message.name}</h3><span id='${message.from}'>${message.message}</span></div>`)
                            })
                        }
                    })
                    $("#ROOM").html(`<pre>${JSON.stringify(roomData.rooms[0], undefined, 2)}</pre>`)
                    startSocketServer(roomData.rooms[0]._id)
                }
           })
        })
    })
    function startSocketServer(room) { 
        if (changed == false) {
            if ($('#system').val() == 'sply') { 
                socket = io(`${chatServerOrigin_SPLY}`);  
                changed = true
            } else {
                socket = io(`${chatServerOrigin_MLS}`);  
                changed = true
            }
        }
        socket.emit('join', { authorization_token, room }, (error) => {
            if(error) {
                alert('ERROR')
                console.log(error);
            }
            socket.on("roomData", ({ users }) => {
                // JS TO ACTIVE USERS TO DIV  OR ACTIVE USER COUNT
                console.log(users) 
                $('#users').html(users.length)
            });
            socketListeners()
        });
    }
    function socketListeners() {
        socket.on('message', message => {
            // JS TO APPEND TO MESSAGES DIV
            console.log(message) 
            $('#messages').append(`<div class="message" style="display:block"><img src='${message.userData.meta.split('|')[0]}' style="height=20px;display: inline;border-radius: 100%;width: 20px;"/><h3 style="display: inline-block;padding: 10px;">${message.user}</h3><span id='${message.userData._id}'>${message.text}</span></div>`)
        });
    } 
    $('#sendMessage').on('click', function () {
        let message = $('#message').val()
        socket.emit('sendMessage', { message, streamTime:0 }, () => {
            //callback function 
        }); 
    })
}