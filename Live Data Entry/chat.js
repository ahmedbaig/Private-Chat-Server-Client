const PUBLIC_KEY_MLS = "2dh54mksCfzl5SKBuuDrN8ACFrF8WCkWEnOZz1CTxUnVDlAHIM" // MLS ONLY
const serverOrigin_MLS = 'https://admin.lyve.fm' // MLS ONLY
const chatServerOrigin_MLS = 'https://lyve-chat-server.herokuapp.com' // MLS ONLY

const PUBLIC_KEY_SPLY = "7Nm2buDMzadgaa0aZms2WqvCIRKsZbhQtKkHZjCWDNBqrZgyjO" // SPLY ONLY
const serverOrigin_SPLY = null // SPLY ONLY
const chatServerOrigin_SPLY = 'https://sply-chat-server.herokuapp.com' // SPLY ONLY

let socket = ""
let changed = false
window.onload = function (e) {
    var token = document.getElementById('token')
    let session_token = null;
    let authorization_token = null;
    let SU_session_token = null;
    let SU_authorization_token = null;
    let system = $('#system').val()
    $(document).ready(function () {
        $('#system').on('change', function () {
            if ($('#system').val() == 'sply') {
                $('#username').show()
                $('#token').show()
                $('#firstName').hide()
                $('#lastName').hide()
                $('#id').hide()
            } else {
                $('#username').hide()
                $('#token').hide()
                $('#firstName').show()
                $('#lastName').show()
                $('#id').show()
            }
        })
        $('#submit').click(function () {
            if ($('#system').val() == 'lyve') {
                let username = document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value
                console.log(document.getElementById('id').value)
                var uri = `${chatServerOrigin_MLS}/auth/create-session`
                ajaxPOST(uri, JSON.stringify({ "auth_key": `${PUBLIC_KEY_MLS}`, 'user': document.getElementById('id').value, 'name': username, 'system': 'lyve', 'role': `${$('#role').val()}`, 'meta': `https://api.adorable.io/avatars/285/${username}.png|${$('#role').val()}` }), sessionData => {
                    console.log(sessionData.session._id)
                    var uri = `${chatServerOrigin_MLS}/auth/create-token?session_token=` + sessionData.session._id
                    if (sessionData.authorization_token == null) {
                        ajaxPOST(uri, JSON.stringify({ "auth_key": `${PUBLIC_KEY_MLS}`, "session_token": sessionData.session._id, "access": 'true', 'write': 'true', 'read': 'true' }), tokenData => {
                            $("#AUTHDATA").append(`<hr/><br/>USERNAME: ${username} <br/> SESSION TOKEN: ${sessionData.session._id} <br/> AUTH_TOKEN: ${tokenData.authorization_token}`)
                            getAllRooms(sessionData.session._id,tokenData.authorization_token )
                        })
                    } else {
                        $("#AUTHDATA").append(`<hr/><br/>USERNAME: ${username} <br/> SESSION TOKEN: ${sessionData.session._id} <br/> AUTH_TOKEN: ${sessionData.authorization_token}`)
                        getAllRooms(sessionData.session._id,sessionData.authorization_token )
                    }
                })
            } else if ($('#system').val() == 'sply') {
                var uri = `${chatServerOrigin_SPLY}/auth/create-session`
                let username = $('#username').val()
                ajaxPOST(uri, JSON.stringify({ "auth_key": `${PUBLIC_KEY_SPLY}`, 'user': token.value, 'name': username, 'system': 'sply', 'role': `${$('#role').val()}`, 'meta': `https://api.adorable.io/avatars/285/${username}.png|${$('#role').val()}` }), sessionData => {
                    console.log(sessionData.session._id)
                    var uri = `${chatServerOrigin_SPLY}/auth/create-token?session_token=` + sessionData.session._id
                    if (sessionData.authorization_token == null) {
                        ajaxPOST(uri, JSON.stringify({ "auth_key": `${PUBLIC_KEY_SPLY}`, "session_token": sessionData.session._id, "access": 'true', 'write': 'true', 'read': 'true' }), tokenData => {
                            $("#AUTHDATA").append(`<hr/><br/>USERNAME: ${username} <br/> SESSION TOKEN: ${sessionData.session._id} <br/> AUTH_TOKEN: ${tokenData.authorization_token}`)
                            getAllRooms(sessionData.session._id,tokenData.authorization_token )
                        })
                    } else {
                        $("#AUTHDATA").append(`<hr/><br/>USERNAME: ${username} <br/> SESSION TOKEN: ${sessionData.session._id} <br/> AUTH_TOKEN: ${sessionData.authorization_token}`)
                        getAllRooms(sessionData.session._id,sessionData.authorization_token )
                    }
                })
            }
        })
        $('#login').on('click', function () {
            if ($('#system').val() == 'sply') {
                var uri = `${chatServerOrigin_SPLY}/auth/admin/login-admin`
            } else {
                var uri = `${chatServerOrigin_MLS}/auth/admin/login-admin`
            }
            if ($('#user').val() != "" && $('#password').val() != "") {
                ajaxPOST(uri, JSON.stringify({ "user": $('#user').val(), "password": $('#password').val() }), tokenData => {
                    SU_authorization_token = tokenData.authorization_token
                    SU_session_token = tokenData.session._id
                    $("#SUDATA").append(`SESSION TOKEN: ${SU_session_token} <br/> AUTH_TOKEN: ${SU_authorization_token}`)
                    getAllRooms(SU_session_token,SU_authorization_token)
                })
            } else {
                alert('ADMIN DETAILS BLANK!')
            }
        })
        $('#roomCreate').on('click', function () {
            if (SU_authorization_token != null && SU_session_token != null) { 
                if ($('#system').val() == 'sply') {
                    var uri = `${chatServerOrigin_SPLY}/api/rooms/create-room?session_token=${SU_session_token}&authorization_token=${SU_authorization_token}`
                } else {
                    var uri = `${chatServerOrigin_MLS}/api/rooms/create-room?session_token=${SU_session_token}&authorization_token=${SU_authorization_token}`
                }
                if ($("#roomName").val() != "" && $('#roomMeta').val() != "") {
                    let body = {
                        "room": {
                            "id": null,
                            "isStream": true,
                            "roomName": $("#roomName").val(),
                            "system": "lyve",
                            "meta": `${$("#roomMeta").val()}|https://api.adorable.io/avatars/285/${$("#roomName").val()}.png`
                        }
                    }
                    ajaxPOST(uri, JSON.stringify(body), createRoom => {
                        getAllRooms(SU_session_token,SU_authorization_token)
                    })
                } else {
                    alert('ROOM DETAILS BLANK!')
                }
            } else {
                alert('ADMIN LOGIN REQUIRED!')
            }
        })
        $('#getRoom').on('click', function () {
            getRoom()
        })
        $('#sendMessage').on('click', function () {
            if ($('#user_sessionToken').val() != '' && $('#user_authToken').val() != '' && $('#message').val() != '' && $('#streamSeconds').val() != ''&&$('#room').val()!="") {
                if ($('#system').val() == 'sply') {
                    session_token = "5f8812aebe0a960017015a82"
                    authorization_token = "bUTD1XPeDhYkSKfVczqmZYnAobKf4vqEvV8edWCxPnRBtuM7fE"
                    var uri = `${chatServerOrigin_SPLY}/api/rooms/get-rooms?session_token=5f8812aebe0a960017015a82` + '&authorization_token=bUTD1XPeDhYkSKfVczqmZYnAobKf4vqEvV8edWCxPnRBtuM7fE&stream=true' + '&room=' + $('#room').val()
                } else {
                    session_token = "5f87053b0846dd0004f28fad"
                    authorization_token = "dLxWmMYiuLSavnxZOGwGcsHjcxHEK3dIgitsvHeV2v9rvej5BF"
                    var uri = `${chatServerOrigin_MLS}/api/rooms/get-rooms?session_token=5f87053b0846dd0004f28fad` + '&authorization_token=dLxWmMYiuLSavnxZOGwGcsHjcxHEK3dIgitsvHeV2v9rvej5BF' + '&stream=true' + '&room=' + $('#room').val()
                }
                ajaxGET(uri, roomData => { 
                    if ($('#system').val() == 'sply') {
                        var uri = `${chatServerOrigin_SPLY}/api/messages/livechat-insert-message?session_token=${$('#user_sessionToken').val()}&authorization_token=${$('#user_authToken').val() }`
                    } else {
                        var uri = `${chatServerOrigin_MLS}/api/messages/livechat-insert-message?session_token=${$('#user_sessionToken').val()}&authorization_token=${$('#user_authToken').val() }`
                    } 
                    let body = {
                        "to": roomData.rooms[0]._id ,
                        "from": $('#user_sessionToken').val(),
                        "isRoom": "false",
                        "streamTime": $('#streamSeconds').val() ,
                        "message":$('#message').val()
                    }
                    ajaxPOST(uri, JSON.stringify(body), message => {
                        getRoom($('#room').val())
                    })
                })
                
            } else {
                alert('MESSAGE DETAILS NOT COMPLETE!')
            }
        })
    })

    function getRoom() {
        if ($('#system').val() == 'sply') {
            session_token = "5f8812aebe0a960017015a82"
            authorization_token = "bUTD1XPeDhYkSKfVczqmZYnAobKf4vqEvV8edWCxPnRBtuM7fE"
            var uri = `${chatServerOrigin_SPLY}/api/rooms/get-rooms?session_token=5f8812aebe0a960017015a82` + '&authorization_token=bUTD1XPeDhYkSKfVczqmZYnAobKf4vqEvV8edWCxPnRBtuM7fE&stream=true' + '&room=' + $('#room').val()
        } else {
            session_token = "5f87053b0846dd0004f28fad"
            authorization_token = "dLxWmMYiuLSavnxZOGwGcsHjcxHEK3dIgitsvHeV2v9rvej5BF"
            var uri = `${chatServerOrigin_MLS}/api/rooms/get-rooms?session_token=5f87053b0846dd0004f28fad` + '&authorization_token=dLxWmMYiuLSavnxZOGwGcsHjcxHEK3dIgitsvHeV2v9rvej5BF' + '&stream=true' + '&room=' + $('#room').val()
        }
        ajaxGET(uri, roomData => {
            $("#ROOM").html(`<pre>${JSON.stringify(roomData.rooms[0], undefined, 2)}</pre>`)
            getRoomMessages(roomData)
        })
    }
    function getAllRooms(session_token,authorization_token ) {
        if ($('#system').val() == 'sply') {
            var uri = `${chatServerOrigin_SPLY}/api/rooms/get-rooms?session_token=` + session_token + '&authorization_token=' + authorization_token
        } else {
            var uri = `${chatServerOrigin_MLS}/api/rooms/get-rooms?session_token=` + session_token + '&authorization_token=' + authorization_token
        }
        ajaxGET(uri, data => { 
            $("#rooms").empty()
            data.rooms.forEach(room => {
                $('#rooms').prepend(`<div class="room" style="display:block"><span style="display: inline-block;padding: 10px;">Room Name: ${room.roomName}</span><br/><span id='${room._id}'>Room Id: ${room._id}</span><br/><span>${room.meta}</span><hr/></div>`)
            })
        }) 
    }
    function getRoomMessages(roomData) { 
        if ($('#system').val() == 'sply') {
            var uri = `${chatServerOrigin_SPLY}/api/messages/livechat-messages?session_token=` + session_token + '&authorization_token=' + authorization_token + '&room=' + roomData.rooms[0]._id + '&startFrom=0'
        } else {
            var uri = `${chatServerOrigin_MLS}/api/messages/livechat-messages?session_token=` + session_token + '&authorization_token=' + authorization_token + '&room=' + roomData.rooms[0]._id + '&startFrom=0'
        }
        ajaxGET(uri, messages => {
            $("#messages").empty()
            console.log(messages)
            messages.messages.forEach(message => {
                $('#messages').prepend(`<div class="message" style="display:block"><img src='${message.meta.split('|')[0]}' style="height=20px;display: inline;border-radius: 100%;width: 20px;"/><h5 style="display: inline-block;padding: 10px;">${message.name}</h5><span id='${message.from}'>${message.message} [At Time: ${message.streamTime}]</span></div>`)
            })
        })
    }

    function ajaxPOST(URI, body, callback) {
        $.ajax({
            url: URI,
            dataType: 'json',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json",
                "Accept": "*/*",
            },
            method: 'POST',
            data: body,
            success: function (data) {
                return callback(data)
            }
        })
    }
    function ajaxGET(URI, callback) {
        $.ajax({
            url: URI,
            dataType: 'json',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json",
                "Accept": "*/*",
            },
            method: 'GET',
            success: function (data) {
                return callback(data)
            }
        })
    }
}