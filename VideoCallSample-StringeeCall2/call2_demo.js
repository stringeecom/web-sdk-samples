var stringeeClient;
var access_token;
var call;
var userId;

$(document).ready(function () {
    
});

function switchCamera(){
    call.switchCamera();
}

function sendInfo(msg){
    call.sendInfo(msg, function (res){
        console.log('sendInfo res', res);
    });
}

function testLogin() {
    stringeeClient = new StringeeClient();
    settingsClientEvents(stringeeClient);
    accessToken = document.getElementById("accessToken").value;
    stringeeClient.connect(accessToken);
}

function settingsClientEvents(client) {
    client.on('authen', function (res) {
        console.log('on authen: ', res);
        if (res.r === 0) {
            userId = res.userId;
            $('#loggedUserId').html(res.userId);
            $('#loggedUserId').css('color', 'blue');
            $('#loginBtn').attr('disabled', 'disabled');

            $('#call2Btn').removeAttr('disabled');
            $('#call2HangupBtn').removeAttr('disabled');
            $('#muteBtn').removeAttr('disabled');
            $('#enableVideoBtn').removeAttr('disabled');
        }
    });
    client.on('connect', function () {
        console.log('++++++++++++++ connected');
    });
    client.on('disconnect', function () {
        console.log('++++++++++++++ disconnected');
    });
    client.on('requestnewtoken', function () {
        console.log('++++++++++++++ requestnewtoken+++++++++');
    });
    client.on('incomingcall2', function (call2) {
        call = call2;
        settingCallEvent(call);

        $('#incomingcallBox').show();
        $('#incomingCallFrom').html(call2.fromNumber);
    });
}


function testCall2() {
    var fromNumber = userId;
    var toNumber = $('#toNumberBtn').val();

    call = new StringeeCall2(stringeeClient, fromNumber, toNumber, true);

    settingCallEvent(call);
    call.makeCall(function (res) {
        if (res.r == 0) {
            console.log('make call success');
            setCallStatus('Calling...');
        }
    });
}

function settingCallEvent(call1) {
    call1.on('addlocalstream', function (stream) {
        // reset srcObject to work around minor bugs in Chrome and Edge.
//        console.log('addlocalstream');
        localVideo.srcObject = null;
        localVideo.srcObject = stream;
    });
    call1.on('addremotestream', function (stream) {
        // reset srcObject to work around minor bugs in Chrome and Edge.
//        console.log('addremoonstop()testream');
        remoteVideo.srcObject = null;
        remoteVideo.srcObject = stream;
        
        remoteAudio.srcObject = null;
        remoteAudio.srcObject = stream;

    });
    call1.on('signalingstate', function (state) {
        console.log('signalingstate ', state);
        if (state.code === 6) {
            $('#incomingcallBox').hide();
        }

        if (state.code === 6) {
            setCallStatus('Ended');
            onstop();
        } else if (state.code === 3) {
            setCallStatus('Answered');
        } else if (state.code === 5) {
            setCallStatus('User busy');
            onstop();
        }
    });
    call1.on('mediastate', function (state) {
        console.log('mediastate ', state);
    });
    call1.on('otherdevice', function (msg) {
        console.log('otherdevice ', msg);
        if (msg.type == 'CALL2_STATE') {
            if (msg.code == 200 || msg.code == 486) {
                $('#incomingcallBox').hide();
            }
        }
    });
    call1.on('info', function (info) {
        console.log('++++info ', info);
    });
}

function testAnswer() {
    call.answer(function (res) {
        console.log('answer res', res);
        if (res.r === 0) {
            setCallStatus('Answered');
        }
    });
    $('#incomingcallBox').hide();
}

function testReject() {
    console.log('testReject');
    call.reject(function (res) {
        console.log('reject res', res);
    });
    $('#incomingcallBox').hide();
}

function testHangup() {
    call.hangup(function (res) {
        console.log('hangup res', res);
    });
    onstop();
}

function onstop() {
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
}

function setCallStatus(status) {
    $('#txtStatus').html(status);
}

function testMute() {
    if (call.muted) {
        call.mute(false);
        console.log('unmuted');
    } else {
        call.mute(true);
        console.log('muted');
    }
}

function testDisableVideo() {
    if (call.localVideoEnabled) {
        call.enableLocalVideo(false);
        console.log('disable Local Video');
    } else {
        call.enableLocalVideo(true);
        console.log('enable Local Video');
    }
}