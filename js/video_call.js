
var client2;
var fromNumber = 'FROM_YOUR_NUMBER';
var call;

$(document).ready(function () {
	client2 = new StringeeClient();

	client2.connect(access_token);

	client2.on('connect', function () {
		console.log('++++++++++++++ connected to StringeeServer');
	});

	client2.on('authen', function (res) {
		console.log('authen', res);
		$('#loggedUserId').html(res.userId);
	});

	client2.on('disconnect', function () {
		console.log('++++++++++++++ disconnected: ' + this.test);
	});

	client2.on('incomingcall', function (incomingcall) {
		call = incomingcall;
		settingCallEvent(incomingcall);

//			call.videoResolution = {width: 1280, height: 720};

		var answer = confirm('Incoming call from: ' + incomingcall.fromNumber + ', do you want to answer?');

		if (answer) {
			call.answer(function (res) {
				console.log('answer res', res);
			});
		} else {
			call.reject(function (res) {
				console.log('reject res', res);
			});
		}

		console.log('++++++++++++++ incomingcall', incomingcall);
	});
});

function testMakeCall(videocall) {
	console.log('make call, videocall: ' + videocall);
//				var videoCall = false;
	call = new StringeeCall(client2, fromNumber, $('#callTo').val(), videocall);

//	call.videoResolution = {width: 1280, height: 720};

	settingCallEvent(call);

	call.makeCall(function (res) {
		console.log('make call callback: ' + JSON.stringify(res));
	});
}

function settingCallEvent(call1) {
	call1.on('addremotestream', function (stream) {
		// reset srcObject to work around minor bugs in Chrome and Edge.
		remoteVideo.srcObject = null;
		remoteVideo.srcObject = stream;
	});

	call1.on('addlocalstream', function (stream) {
//					console.log('addlocalstream ', stream);
		// reset srcObject to work around minor bugs in Chrome and Edge.
		localVideo.srcObject = null;
		localVideo.srcObject = stream;
	});

	call1.on('state', function (state) {
		console.log('state ', state);
	});

	call1.on('info', function (info) {
		console.log('on info:' + JSON.stringify(info));
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