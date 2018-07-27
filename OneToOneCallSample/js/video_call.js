
var stringeeClient;
var fromNumber = 'FROM_YOUR_NUMBER';
var call;

$(document).ready(function () {
	//check isWebRTCSupported
        console.log('StringeeUtil.isWebRTCSupported: ' + StringeeUtil.isWebRTCSupported());

	stringeeClient = new StringeeClient();

	settingClientEvents(stringeeClient);
	
	stringeeClient.connect(access_token);
});

function testAnswerCall() {
	call.answer(function (res) {
		console.log('answer res', res);
		$('#incoming-call-div').hide();
	});
}

function testRejectCall() {
	call.reject(function (res) {
		console.log('reject res', res);
		$('#incoming-call-div').hide();
	});
}

function testMakeCall(videocall) {
	console.log('make call, videocall: ' + videocall);
//				var videoCall = false;
	call = new StringeeCall(stringeeClient, fromNumber, $('#callTo').val(), videocall);

//	call.videoResolution = {width: 1280, height: 720};

	settingCallEvent(call);

	call.makeCall(function (res) {
		console.log('make call callback: ' + JSON.stringify(res));
	});
}

function settingClientEvents(client) {
	client.on('connect', function () {
		console.log('++++++++++++++ connected to StringeeServer');
	});

	client.on('authen', function (res) {
		console.log('authen', res);
		$('#loggedUserId').html(res.userId);
	});

	client.on('disconnect', function () {
		console.log('++++++++++++++ disconnected: ' + this.test);
	});

	client.on('incomingcall', function (incomingcall) {
		call = incomingcall;
		settingCallEvent(incomingcall);

//			call.videoResolution = {width: 1280, height: 720};

		$('#incoming-call-div').show();

		call.ringing(function (res) {});

		console.log('++++++++++++++ incomingcall', incomingcall);
	});

	client.on('requestnewtoken', function () {
		console.log('++++++++++++++ requestnewtoken; please get new access_token from YourServer and call client.connect(new_access_token)+++++++++');
		//please get new access_token from YourServer and call: 
		//client.connect(new_access_token);
	});
}

function settingCallEvent(call1) {
	call1.on('addremotestream', function (stream) {
		console.log('addremotestream');
		// reset srcObject to work around minor bugs in Chrome and Edge.
		remoteVideo.srcObject = null;
		remoteVideo.srcObject = stream;
	});

	call1.on('addlocalstream', function (stream) {
		console.log('addlocalstream');
		// reset srcObject to work around minor bugs in Chrome and Edge.
		localVideo.srcObject = null;
		localVideo.srcObject = stream;
	});

	call1.on('signalingstate', function (state) {
		console.log('signalingstate ', state);
		var reason = state.reason;
		$('#callStatus').html(reason);
		
		if (state.code === 6) {//call Ended
			$('#incoming-call-div').hide();
		}
	});

	call1.on('mediastate', function (state) {
		console.log('mediastate ', state);
	});

	call1.on('info', function (info) {
		console.log('on info:' + JSON.stringify(info));
	});

	call1.on('otherdevice', function (data) {
		console.log('on otherdevice:' + JSON.stringify(data));
		if ((data.type === 'CALL_STATE' && data.code >= 200) || data.type === 'CALL_END') {
			$('#incoming-call-div').hide();
		}
	});
}

function testHangupCall() {
	remoteVideo.srcObject = null;

	call.hangup(function (res) {
		console.log('hangup res', res);
	});
}

function upgradeToVideoCall() {
	call.upgradeToVideoCall();
}


function switchVoiceVideoCall() {
	var info = {requestVideo: true};
//	var info = true;
	call.sendInfo(info, function (res) {
		console.log('switchVoiceVideoCall', res);
	});
}



function mute() {
	var muted = !call.muted;
	call.mute(muted);

	if (muted) {
		$('#muteBtn').html('Unmute');
	} else {
		$('#muteBtn').html('Mute');
	}
}

function enableVideo() {
	var success;
	if (call.localVideoEnabled) {
		success = call.enableLocalVideo(false);
	} else {
		success = call.enableLocalVideo(true);
	}
	console.log('enableVideo result: ' + success);
}
