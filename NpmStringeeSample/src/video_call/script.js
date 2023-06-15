import { StringeeUtil, StringeeClient, StringeeCall2 } from "@/latest.npm.sdk.bundle.js";

let stringeeClient,
    call,
    timeoutStats;

const
    sdkVersion          = document.querySelector("#sdkVersion"),
    loggedUserId        = document.querySelector("#loggedUserId"),
    loginBtn            = document.querySelector("#loginBtn"),
    accessTokenArea     = document.querySelector("#accessTokenArea"),
    call2Btn            = document.querySelector("#call2Btn"),
    call2HangupBtn      = document.querySelector("#call2HangupBtn"),
    muteBtn             = document.querySelector("#muteBtn"),
    enableVideoBtn      = document.querySelector("#enableVideoBtn"),
    incomingcallBox     = document.querySelector("#incomingcallBox"),
    incomingCallFrom    = document.querySelector("#incomingCallFrom"),
    toNumberBtn         = document.querySelector("#toNumberBtn"),
    transferNumberInput = document.querySelector("#transferNumberInput"),
    toType              = document.querySelector("#toType"),
    transferType        = document.querySelector("#transferType"),
    txtStatus           = document.querySelector("#txtStatus"),
    audioSent           = document.querySelector("#audioSent"),
    videoSent           = document.querySelector("#videoSent"),
    audioReceived       = document.querySelector("#audioReceived"),
    videoReceived       = document.querySelector("#videoReceived"),
    transferBtn         = document.querySelector("#transferBtn"),
    answerBtn           = document.querySelector("#answerBtn"),
    rejectBtn           = document.querySelector("#rejectBtn"),
    leaveBtn            = document.querySelector("#leaveBtn"),
    holdBtn             = document.querySelector("#holdBtn"),
    sendInfo2           = document.querySelector("#sendInfo2"),
    sendInfo1           = document.querySelector("#sendInfo1"),

    STRINGEE_SERVER_ADDRS = ["wss://v1.stringee.com:6899/", "wss://v2.stringee.com:6899/"];


sdkVersion.innerHTML = StringeeUtil.version().version + "_build_" + StringeeUtil.version().build + "_sample_1";

switchCameraBtn.addEventListener("click", () => {
    call.switchCamera();
});

// eslint-disable-next-line no-unused-vars
function shareScreen() {
    call.startShareScreen();
}

// eslint-disable-next-line no-unused-vars
function sendInfo(msg) {
    call.sendInfo(msg, (res) => {
        console.log("sendInfo res", res);
    });
}

// eslint-disable-next-line no-unused-vars
loginBtn.addEventListener("click", () =>{
    stringeeClient = new StringeeClient(STRINGEE_SERVER_ADDRS);
    settingsClientEvents(stringeeClient);
    stringeeClient.connect(accessTokenArea.value);
});

function settingsClientEvents(client) {
    client.on("authen", (res) => {
        console.log("on authen: ", res);
        if (res.r === 0) {
            loggedUserId.innerHTML = res.userId;
            loggedUserId.style.color = "blue";
            loginBtn.setAttribute("disabled", "disabled");

            call2Btn.removeAttribute("disabled");
            call2HangupBtn.removeAttribute("disabled");
            muteBtn.removeAttribute("disabled");
            enableVideoBtn.removeAttribute("disabled");
        }
    });
    client.on("connect", () => {
        console.log("++++++++++++++ connected");
    });
    client.on("disconnect", () => {
        console.log("++++++++++++++ disconnected");
    });
    client.on("requestnewtoken", () => {
        console.log("++++++++++++++ requestnewtoken+++++++++");
    });
    client.on("incomingcall2", (call2) => {
        call = call2;
        settingCallEvent(call);

        incomingcallBox.style.display = "block";
        incomingCallFrom.innerHTML    = call2.fromNumber;
    });
}

call2Btn.addEventListener("click", () => {
    const fromNumber = loggedUserId.innerText,
        toNumber = toNumberBtn.value;

    call = new StringeeCall2(stringeeClient, fromNumber, toNumber, true);

    settingCallEvent(call);
    call.makeCall((res) => {
        console.log("makeCall", res);
        if (res.r == 0) {
            console.log("make call success");
            setCallStatus("Calling...");
        }
    });
});

function settingCallEvent(call1) {
    call1.on("addlocalstream", (stream) => {
        console.log("addlocalstream, khong xu ly event nay, xu ly o event: addlocaltrack");
    });

    call1.on("addlocaltrack", (localtrack1) => {
        console.log("addlocaltrack", localtrack1);

        const element = localtrack1.attach();
        document.getElementById("local_videos").appendChild(element);
        element.style.height = "150px";
        element.style.color = "red";
    });

    call1.on("addremotetrack", (track) => {
        const element = track.attach();
        document.getElementById("remote_videos").appendChild(element);
        element.style.height = "150px";
    });

    call1.on("removeremotetrack", (track) => {
        track.detachAndRemove();
    });

    call1.on("removelocaltrack", (track) => {
        track.detachAndRemove();
    });

    call1.on("signalingstate", (state) => {
        console.log("signalingstate ", state);

        switch (state.code) {
        case 3:
            // Answered
            setCallStatus("Answered");
            test_stats();
            break;
        case 5:
            // User busy
            setCallStatus("User busy");
            onstop();
            break;
        case 6:
            // Ended
            incomingcallBox.style.display = "none";
            setCallStatus("Ended");
            onstop();
            break;
        }
    });
    call1.on("mediastate", (state) => {
        console.log("mediastate ", state);
    });
    call1.on("otherdevice", (msg) => {
        console.log("otherdevice ", msg);
        if (msg.type == "CALL2_STATE") {
            if (msg.code == 200 || msg.code == 486) {
                incomingcallBox.style.display = "none";
            }
        }
    });
    call1.on("info", (info) => {
        console.log("++++info ", info);
    });
}

answerBtn.addEventListener("click", () => {
    call.answer((res) => {
        console.log("answer res", res);
        if (res.r === 0) {
            test_stats();
            setCallStatus("Answered");
        }
    });

    incomingcallBox.style.display = "none";
});

transferBtn.addEventListener("click", () => {
    console.log("testTransfer");
    const to            = transferNumberInput.value,
        toTypeValue     = toType.value,
        transferTypeValue = transferType.value;

    call.transferCall(to, toTypeValue, transferTypeValue, console.log);
});

holdBtn.addEventListener("click", () => {
    console.log("testHold");
    const hold = call.isOnHold;

    if (!hold) {
        call.sendHold(null, (h) => {
            const btn = document.getElementById("holdBtn");
            if (btn) {
                btn.innerHTML = h ? "Hold" : "Unhold";
            }
        });
    } else {
        call.sendUnHold((h) => {
            const btn = document.getElementById("holdBtn");
            if (btn) {
                btn.innerHTML = h ? "Hold" : "Unhold";
            }
        });
    }
});

leaveBtn.addEventListener("click", () => {
    console.log("testLeave");
    call.leaveRoom();
});

rejectBtn.addEventListener("click", () => {
    console.log("testReject");
    call.reject((res) => {
        console.log("reject res", res);
    });

    incomingcallBox.style.display = "none";
});

call2HangupBtn.addEventListener("click", () => {
    call.hangup((res) => {
        console.log("hangup res", res);
    });
    onstop();
});

function onstop() {
    console.log("=======onstop=====");

    if (timeoutStats) {
        clearTimeout(timeoutStats);
    }

    if (!call) {
        return;
    }

    call.subscribedTracks.forEach((track) => {
        track.detachAndRemove();
    });
}

function setCallStatus(status) {
    txtStatus.innerHTML = status;
}

muteBtn.addEventListener("click", () => {
    if (call.muted) {
        call.mute(false);
        console.log("unmuted");
    } else {
        call.mute(true);
        console.log("muted");
    }
});

enableVideoBtn.addEventListener("click", () => {
    if (call.localVideoEnabled) {
        call.enableLocalVideo(false);
        console.log("disable Local Video");
    } else {
        call.enableLocalVideo(true);
        console.log("enable Local Video");
    }
});

sendInfo2.addEventListener("click", () => {
    call.sendInfo({ a: "hello", b: 1 }, (res) => {
        console.log("sendInfo res", res);
    });
});
sendInfo1.addEventListener("click", () => {
    call.sendInfo("hello", (res) => {
        console.log("sendInfo res", res);
    });
});

// eslint-disable-next-line camelcase
function test_stats() {
    const time = 2000;// ms
    console.log("test_stats...");

    if (call && call.localTracks.length > 0) {
        call.localTracks[0].getBW().then((res) => {
            audioSent.innerHTML = res.audioSent + " kbits/s";
            videoSent.innerHTML = res.videoSent + " kbits/s";
        });
    }

    if (call && call.subscribedTracks.length > 0) {
        call.subscribedTracks[0].getBW().then((res) => {
            audioReceived.innerHTML = res.audioReceived + " kbits/s";
            videoReceived.innerHTML = res.videoReceived + " kbits/s";
        });
    }

    timeoutStats = setTimeout(function() {
        test_stats();
    }, time);
}
