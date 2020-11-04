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
    let system = $('#system').val()
    $(document).ready(function () {
        $('#system').on('change', function () {
            if ($('#system').val() == 'sply') {
                $('#username').show()
                $('#token').show()
                $('#firstName').hide()
                $('#lastName').hide()
                $('#id').hide()
                $('#user').hide()
                $('#password').hide()
            } else {
                $('#username').hide()
                $('#token').hide()
                $('#firstName').show()
                $('#lastName').show()
                $('#id').show()
                $('#user').hide()
                $('#password').hide()
            }
        })
        $('#role').on('change', function () {
            if ($('#role').val() == 'su') {
                $('#username').hide()
                $('#token').hide()
                $('#firstName').hide()
                $('#lastName').hide()
                $('#id').hide()
                $('#user').show()
                $('#password').show()
            } else {
                $('#system').val('lyve')
                $('#username').hide()
                $('#token').hide()
                $('#firstName').show()
                $('#lastName').show()
                $('#id').show()
                $('#user').hide()
                $('#password').hide()
            }
        })
        $('#submit').click(function () {
            if ($('#role').val() == 'su') {
                if ($('#system').val() == 'sply') {
                    var uri = `${chatServerOrigin_SPLY}/auth/admin/login-admin`
                } else {
                    var uri = `${chatServerOrigin_MLS}/auth/admin/login-admin`
                }
                $.ajax({
                    url: uri,
                    dataType: 'json',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                    },
                    method: 'POST',
                    data: JSON.stringify({ "user": $('#user').val(), "password": $('#password').val() }),
                    success: function (tokenData) {
                        authorization_token = tokenData.authorization_token
                        session_token = tokenData.session._id
                        $("#AUTHDATA").append(`SESSION TOKEN: ${session_token} <br/> AUTH_TOKEN: ${authorization_token}`)
                        $("#submit").attr("disabled", "disabled");
                        $("#role").attr("disabled", "disabled");
                        $("#system").attr("disabled", "disabled");

                        $('#username').attr("disabled", "disabled")
                        $('#token').attr("disabled", "disabled")
                        $('#firstName').attr("disabled", "disabled")
                        $('#lastName').attr("disabled", "disabled")
                        $('#id').attr("disabled", "disabled")
                        $('#user').attr("disabled", "disabled")
                        $('#password').attr("disabled", "disabled")
                        getAllRooms()
                    }
                })
            } else {
                if ($('#system').val() == 'lyve') {

                    let username = document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value
                    console.log(document.getElementById('id').value)
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
                        data: JSON.stringify({ "auth_key": `${PUBLIC_KEY_MLS}`, 'user': document.getElementById('id').value, 'name': username, 'system': 'lyve', 'role': `${$('#role').val()}`, 'meta': `https://api.adorable.io/avatars/285/${username}.png|${$('#role').val()}` }),
                        success: function (sessionData) {
                            console.log(sessionData.session._id)
                            session_token = sessionData.session._id
                            var uri = `${chatServerOrigin_MLS}/auth/create-token?session_token=` + sessionData.session._id
                            if (sessionData.authorization_token == null) {
                                $.ajax({
                                    url: uri,
                                    dataType: 'json',
                                    headers: {
                                        'Access-Control-Allow-Origin': '*',
                                        "Content-Type": "application/json",
                                        "Accept": "*/*",
                                    },
                                    method: 'POST',
                                    data: JSON.stringify({ "auth_key": `${PUBLIC_KEY_MLS}`, "session_token": sessionData.session._id, "access": 'true', 'write': 'true', 'read': 'true' }),
                                    success: function (tokenData) {
                                        authorization_token = tokenData.authorization_token
                                        $("#AUTHDATA").append(`SESSION TOKEN: ${session_token} <br/> AUTH_TOKEN: ${authorization_token}`)
                                        $("#submit").attr("disabled", "disabled");
                                        $("#role").attr("disabled", "disabled");
                                        $("#system").attr("disabled", "disabled");

                                        $('#username').attr("disabled", "disabled")
                                        $('#token').attr("disabled", "disabled")
                                        $('#firstName').attr("disabled", "disabled")
                                        $('#lastName').attr("disabled", "disabled")
                                        $('#id').attr("disabled", "disabled")
                                        $('#user').attr("disabled", "disabled")
                                        $('#password').attr("disabled", "disabled")
                                        getAllRooms()
                                    }
                                })
                            } else {
                                authorization_token = sessionData.authorization_token
                                $("#AUTHDATA").append(`SESSION TOKEN: ${session_token} <br/> AUTH_TOKEN: ${authorization_token}`)
                                $("#submit").attr("disabled", "disabled");
                                $("#role").attr("disabled", "disabled");
                                $("#system").attr("disabled", "disabled");

                                $('#username').attr("disabled", "disabled")
                                $('#token').attr("disabled", "disabled")
                                $('#firstName').attr("disabled", "disabled")
                                $('#lastName').attr("disabled", "disabled")
                                $('#id').attr("disabled", "disabled")
                                $('#user').attr("disabled", "disabled")
                                $('#password').attr("disabled", "disabled")
                                getAllRooms()
                            }
                        }
                    })
                    // var uri =  `${serverOrigin_MLS}/api/userSession/verify?token=`+token.value
                    // $.ajax({
                    //     url: uri,
                    //     dataType: 'json',
                    //     headers: {
                    //         'Access-Control-Allow-Origin': '*',
                    //         "Content-Type": "application/json",
                    //         "Accept": "*/*",
                    //      },
                    //     method: 'GET',
                    //     success: function (userdata) {
                    //     }
                    // })
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
                        data: JSON.stringify({ "auth_key": `${PUBLIC_KEY_SPLY}`, 'user': token.value, 'name': username, 'system': 'sply', 'role': `${$('#role').val()}`, 'meta': `https://api.adorable.io/avatars/285/${username}.png|${$('#role').val()}` }),
                        success: function (sessionData) {
                            console.log(sessionData.session._id)
                            session_token = sessionData.session._id
                            var uri = `${chatServerOrigin_SPLY}/auth/create-token?session_token=` + sessionData.session._id
                            if (sessionData.authorization_token == null) {
                                $.ajax({
                                    url: uri,
                                    dataType: 'json',
                                    headers: {
                                        'Access-Control-Allow-Origin': '*',
                                        "Content-Type": "application/json",
                                        "Accept": "*/*",
                                    },
                                    method: 'POST',
                                    data: JSON.stringify({ "auth_key": `${PUBLIC_KEY_SPLY}`, "session_token": sessionData.session._id, "access": 'true', 'write': 'true', 'read': 'true' }),
                                    success: function (tokenData) {
                                        authorization_token = tokenData.authorization_token
                                        $("#AUTHDATA").append(`SESSION TOKEN: ${session_token} <br/> AUTH_TOKEN: ${authorization_token}`)
                                        $("#submit").attr("disabled", "disabled");
                                        $("#role").attr("disabled", "disabled");
                                        $("#system").attr("disabled", "disabled");

                                        $('#username').attr("disabled", "disabled")
                                        $('#token').attr("disabled", "disabled")
                                        $('#firstName').attr("disabled", "disabled")
                                        $('#lastName').attr("disabled", "disabled")
                                        $('#id').attr("disabled", "disabled")
                                        $('#user').attr("disabled", "disabled")
                                        $('#password').attr("disabled", "disabled")
                                        getAllRooms()
                                    }
                                })
                            } else {
                                authorization_token = sessionData.authorization_token
                                $("#AUTHDATA").append(`SESSION TOKEN: ${session_token} <br/> AUTH_TOKEN: ${authorization_token}`)
                                $("#submit").attr("disabled", "disabled");
                                $("#role").attr("disabled", "disabled");
                                $("#system").attr("disabled", "disabled");

                                $('#username').attr("disabled", "disabled")
                                $('#token').attr("disabled", "disabled")
                                $('#firstName').attr("disabled", "disabled")
                                $('#lastName').attr("disabled", "disabled")
                                $('#id').attr("disabled", "disabled")
                                $('#user').attr("disabled", "disabled")
                                $('#password').attr("disabled", "disabled")
                                getAllRooms()
                            }
                        }
                    })
                }
            }
        })
        $('#getRoom').on('click', function () {
            if ($('#system').val() == 'sply') {
                var uri = `${chatServerOrigin_SPLY}/api/rooms/get-rooms?session_token=` + session_token + '&authorization_token=' + authorization_token + '&stream=true' + '&room=' + $('#room').val()
            } else {
                var uri = `${chatServerOrigin_MLS}/api/rooms/get-rooms?session_token=` + session_token + '&authorization_token=' + authorization_token + '&stream=true' + '&room=' + $('#room').val()
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
                        var uri = `${chatServerOrigin_SPLY}/api/messages/livechat-messages?session_token=` + session_token + '&authorization_token=' + authorization_token + '&room=' + roomData.rooms[0]._id + '&startFrom=0'
                    } else {
                        var uri = `${chatServerOrigin_MLS}/api/messages/livechat-messages?session_token=` + session_token + '&authorization_token=' + authorization_token + '&room=' + roomData.rooms[0]._id + '&startFrom=0'
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
                                $('#messages').prepend(`<div class="message" style="display:block"><img src='${message.meta.split('|')[0]}' style="height=20px;display: inline;border-radius: 100%;width: 20px;"/><h5 style="display: inline-block;padding: 10px;">${message.name}</h5><span id='${message.from}'>${message.message}</span></div>`)
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
            if (error) {
                alert('ERROR')
                console.log(error);
            }
            socketListeners()
        });
    }
    function socketListeners() {
        socket.on("roomData", ({ users }) => {
            // JS TO ACTIVE USERS TO DIV  OR ACTIVE USER COUNT
            console.log(users)
            $('#users').html(users.length)
        });
        socket.on('message', message => {
            // JS TO APPEND TO MESSAGES DIV
            console.log(message)
            $('#messages').prepend(`<div class="message" style="display:block"><img src='${message.userData.meta.split('|')[0]}' style="height=20px;display: inline;border-radius: 100%;width: 20px;"/><h5 style="display: inline-block;padding: 10px;">${message.user}</h5><span id='${message.userData._id}'>${message.text}</span></div>`)
        });
    }
    $('#sendMessage').on('click', function () {
        let message = $('#message').val()
        socket.emit('sendMessage', { message, streamTime: 0 }, () => {
            //callback function 
        });
    })
    function getAllRooms() {
        if ($('#system').val() == 'sply') {
            var uri = `${chatServerOrigin_SPLY}/api/rooms/get-rooms?session_token=` + session_token + '&authorization_token=' + authorization_token
        } else {
            var uri = `${chatServerOrigin_MLS}/api/rooms/get-rooms?session_token=` + session_token + '&authorization_token=' + authorization_token
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
            success: function (data) {
                data.rooms.forEach(room => {
                    $('#rooms').prepend(`<div class="room" style="display:block"><span style="display: inline-block;padding: 10px;">Room Name: ${room.roomName}</span><br/><span id='${room._id}'>Room Id: ${room._id}</span><br/><span>${room.meta}</span><hr/></div>`)
                })
            }
        })
    }
}