import { StringeeUtil, StringeeClient, StringeeCall } from "stringee";

let stringeeClient,
    call,
    authenticatedWithUserId = "";

const
    loginBtn         = document.querySelector("#loginBtn"),
    accessTokenArea  = document.querySelector("#accessTokenArea"),
    callTo           = document.querySelector("#callTo"),
    fromNumber       = document.querySelector("#fromNumber"),
    callStatus       = document.querySelector("#callStatus"),
    callType         = document.querySelector("#callType"),
    loggedUserId     = document.querySelector("#loggedUserId"),
    callBtn          = document.querySelector("#callBtn"),
    hangupBtn        = document.querySelector("#hangupBtn"),
    incomingCallDiv  = document.querySelector("#incomingCallDiv"),
    incomingCallFrom = document.querySelector("#incomingCallFrom");

console.log("StringeeUtil.isWebRTCSupported: " + StringeeUtil.isWebRTCSupported());

loginBtn.addEventListener("click", () => {
    loggedUserId.innerHTML = "Connecting...";

    const accessToken = accessTokenArea.value;
    console.log("accessToken...: " + accessToken);

    stringeeClient = new StringeeClient();
    settingClientEvents(stringeeClient);
    stringeeClient.connect(accessToken);
});

// eslint-disable-next-line no-unused-vars
callBtn.addEventListener("click", () => {
    const to = callTo.value;
    let from = fromNumber.value;

    if (to.length === 0) {
        return;
    }

    if (from.length === 0) {
        from = authenticatedWithUserId;
    }
    call = new StringeeCall(stringeeClient, from, to);

    settingCallEvents(call);

    call.makeCall((res) => {
        console.log("make call callback: " + JSON.stringify(res));
        if (res.r !== 0) {
            callStatus.innherHTML = res.message;
        } else {
            // call type
            if (res.toType === "internal") {
                callType.innerHTML = "App-to-App call";
            } else {
                callType.innerHTML = "App-to-Phone call";
            }
        }
    });
});

// eslint-disable-next-line no-unused-vars
answerBtn.addEventListener("click", () =>{
    call.answer((res) => {
        console.log("answer res", res);
        incomingCallDiv.style.display = "none";
    });
});

// eslint-disable-next-line no-unused-vars
rejectBtn.addEventListener("click", () =>{
    callStopped();
    call.reject((res) => {
        console.log("reject res", res);
        incomingCallDiv.style.display = "none";
    });
});

// eslint-disable-next-line no-unused-vars
hangupBtn.addEventListener("click", () =>{
    console.log("hangupBtn", remoteVideo);
    remoteVideo.srcObject = null;
    callStopped();

    call.hangup((res) => {
        console.log("hangup res", res);
    });
});

function callStopped() {
    hangupBtn.setAttribute("disabled", "disabled");

    setTimeout(() => {
        callStatus.innerHTML = "Call ended";
    }, 1500);
}


function settingClientEvents(client) {
    client.on("connect", () => {
        console.log("connected to StringeeServer");
    });

    client.on("authen", (res) => {
        console.log("on authen: ", res);
        if (res.r === 0) {
            callBtn.removeAttribute("disabled");
            authenticatedWithUserId  = res.userId;
            loggedUserId.innerHTML  = authenticatedWithUserId;
            loggedUserId.style.color =  "blue";
        } else {
            loggedUserId.innerHTML = res.message;
        }
    });

    client.on("disconnect", () => {
        console.log("disconnected");
        callBtn.setAttribute("disabled", "disabled");
    });

    client.on("incomingcall", (incomingcall) => {
        call = incomingcall;
        settingCallEvents(incomingcall);

        incomingCallDiv.style.display = "block";
        incomingCallFrom.innerHTML  = call.fromNumber;

        console.log("incomingcall: ", incomingcall);
        // fromInternal: false
        if (incomingcall.fromInternal) {
            callType.innerHTML = "App-to-App call";
        } else {
            callType.innerHTML = "Phone-to-App call";
        }
    });

    client.on("requestnewtoken", () => {
        console.log(`request new token;
            please get new access_token from YourServer
            and call client.connect(new_access_token)`);
        // please get new access_token from YourServer and call:
        // client.connect(new_access_token);
    });

    client.on("otherdeviceauthen", (data) => {
        console.log("otherdeviceauthen: ", data);
    });
}

function settingCallEvents(call1) {
    hangupBtn.removeAttribute("disabled");

    call1.on("error", (info) => {
        console.log("on error: " + JSON.stringify(info));
    });

    call1.on("addlocalstream", (stream) => {
        console.log("on addlocalstream", stream);
    });

    call1.on("addremotestream", (stream) => {
        console.log("on addremotestream", stream);
        // reset srcObject to work around minor bugs in Chrome and Edge.
        remoteVideo.srcObject = null;
        remoteVideo.srcObject = stream;
    });

    call1.on("signalingstate", (state) => {
        console.log("signalingstate", state);

        if (state.code == 6) {// call ended
            incomingCallDiv.style.display = "none";
            callStopped();
        }

        if (state.code == 5) {// busy here
            callStopped();
        }

        const reason = state.reason;
        callStatus.innerHTML = reason;
    });

    call1.on("mediastate", (state) => {
        console.log("mediastate ", state);
    });

    call1.on("info", (info) => {
        console.log("on info", info);
    });

    call1.on("otherdevice", (data) => {
        console.log("on otherdevice:" + JSON.stringify(data));

        if ((data.type === "CALL_STATE" && data.code >= 200) || data.type === "CALL_END") {
            incomingCallDiv.style.display = "none";
        }
    });
}
