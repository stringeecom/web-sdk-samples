var stringeeClient;
var stringeeChat;
var userIds = [];
var myUserId = '';
var accessToken = '';
var isLogin = false;
var userInfo = {};
var convList = [];
var currentConv = {};
var currentMessages = [];
var myUserInfo = {};
var userList = [];

$(document).ready(function () {
    console.log("document ready");

    if (localStorage.getItem("accessToken")) {
        accessToken = localStorage.getItem("accessToken");
    }

    // Init
    stringeeClient = new StringeeClient();

    settingClientEvents(stringeeClient);

    $('#btnConnect').click(()=>{
        let userId = $('#newUserID').val().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        userId = userId.replaceAll(" ", '_');
        userId = userId.replace(/[^\w\s]/gi, '');
        if (userId.length == 0) {
            toast("User Id không được để trống!");
            return;
        }

        $.get('php/token_pro.php?userId=' + userId).then(res => {
            res = JSON.parse(res);

            if (res.err && res.code == 1) {
                toast("$apiKeySid và $apiKeySecret chưa được set trong live-chat-sample/php/token_pro.php", 'Lỗi');
            } else if (res.access_token) {
                accessToken = res.access_token;
                stringeeClient.connect(accessToken);

                $("#btnConnect").attr("disabled", true);
            }
        })
    })

    $('#btnStart').click(()=>{
        const strUserIds = $('#userIds').val().trim();
        if (strUserIds.length == 0) {
            toast("User Id không được để trống!", 'Lỗi');
        } else {
            userIds = strUserIds.split(',');
            userIds = userIds.map(e => {
                return e.trim();
            })

            createConv();
            console.log(userIds);
        }
    })

    $('#btnSend').click(()=>{
        const content = $('#messageContent').val();
        sendMessage(content);
    })

    $(document).on('click', '.chat-item', function(event) {
        const convId = $(this).attr('convId');
        $('.chat-item').removeClass('active');
        $(this).addClass('active');
        if (convId) {
            showChat(convId);
        }
    });

    $(document).on('keypress', '#messageContent',function(e) {
        if(e.which == 13) {
            const content = $('#messageContent').val();
            sendMessage(content);
        }
    });

    $('#logoutBtn').click(()=>{
        logOut()
    })

    if (accessToken.length > 0) {
        stringeeClient.connect(accessToken);
        $("#btnConnect").attr("disabled", true);
    }

    $('#inputSearch').change(()=>{
        let name = $('#inputSearch').val().toLowerCase();

        if (name.length == 0){
            updateViewChatList(convList);
        } else {
            const result = convList.filter(e => {
                const convName = getConvName(e).toLowerCase();
                return convName.includes(name);
            });
            updateViewChatList(result);
        }
    })
})

function logOut(){
    localStorage.removeItem("accessToken");
    stringeeClient.disconnect();
    location.reload();
}

function toast(message, title = 'Thông báo'){
    $('.toast-content').html(message);
    $('.toast-title').html(title);

    const toastLiveExample = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastLiveExample)
    toast.show()
}

function createConv() {
    return new Promise(function (resolve, reject) {
        let options = {
            name: "New conversation",
            isDistinct: false,
            isGroup: true
        };
        stringeeChat.createConversation(userIds, options, (status, code, message, conv) => {
            console.log('createConversation conv:', conv);
            resolve(conv);
            $('#userIds').val('');
        })
    })
}

function sendMessage(message) {
    const type = 1;
    let body = {
        convId: currentConv.id,
        message: {
            content: message
        },
        type: type,
    };
    stringeeChat.sendMessage(body, function(res){
        if (res) {
            resetChat();
        }
    })
}

function resetChat(){
    $('#messageContent').val('');
    $('#messageContent').focus();
}

function settingClientChat() {
    stringeeChat.on('onObjectChange', function (info) {

        if (info.objectType === 0) {
            handleUpdateChatList(info.objectChanges);
        } else {
            handleUpdateMessage(info.objectChanges);
        }
        console.log('RECEIVED ONOBJECTCHANGE EVENT', info);
    });
}

function handleUpdateMessage(messages){
    messages.forEach(element => {
        const indexConv = convList.findIndex(e => e.id == element.convId);
        if (indexConv !== -1) {
            convList[indexConv].lastMessage = element;
            updateViewChatList(convList);

            if (element.convId == currentConv.id) {
                const indexMsg = currentMessages.findIndex(e => e.id == element.id);
                console.log("currentMessages", currentMessages);
                console.log("element.id", element.id);
                console.log("indexMsg", indexMsg);
                if (indexMsg >= 0) {
                    currentMessages[indexMsg] = {...element};
                } else {
                    currentMessages.push(element);
                }
                updateViewChatContent(currentMessages);
            }
        }
    });
}

function scrollToLastMessage(){
    const itemElement = document.getElementsByClassName('item-message');
    if (itemElement && itemElement.length > 0) {
        itemElement[itemElement.length - 1].scrollIntoView({behavior: "smooth", block: "end"});
    }
}

function handleUpdateChatList(convs){
    convs.forEach(element => {
        const index = convList.findIndex(e => e.id == element.id);
        if (index === -1) {
            convList.unshift(element);
        } else {
            convList[index] = {...element};
            if (convList[index].id != currentConv.id) {
                convList[index].hasNewMsg = true;
            }
        }

        console.log("handleUpdateChatList", convList);

        updateViewChatList(convList);
    });
}

function settingClientEvents(client) {
    client.on('connect', function (res) {
        console.log('Connected to StringeeServer');
    });

    client.on('authen', function (res) {
        console.log('authen', res);
        if (res.r === 0) {
            myUserId = res.userId;
            localStorage.setItem("accessToken", accessToken);

            $('#userId').html(myUserId);
            $('#userId').show();
            $('#login-form').hide('fast');
            $('#chat-box').show('fast');
            $('#newChat').attr('disabled', false);
            stringeeChat = new StringeeChat(stringeeClient);
            settingClientChat();
            getConversation();
            
            getUsersInfo([myUserId]).then(res => {
                if (res && res[0] && res[0].avatar) {
                    myUserInfo = res[0];
                } else {
                    updateUserInfo().then(res => {
                        getUsersInfo([myUserId]).then(res => {
                            myUserInfo = res[0];
                        });
                    });
                }
            });
        } else {
            localStorage.removeItem("accessToken");
            toast("Token hết hạn! Cần đăng nhập lại", "Thông báo");
            $("#btnConnect").attr("disabled", false);
        }
    });

    client.on('disconnect', function () {
        $('#callBtn').attr('disabled', 'disabled');
        $('#videoCallBtn').attr('disabled', 'disabled');
        console.log('Disconnected');
    });

    client.on('requestnewtoken', function () {
        console.log('Requestnewtoken; please get new access_token from YourServer and call client.connect(new_access_token)');
        //please get new access_token from YourServer and call: 
        //client.connect(new_access_token);
    });
}

function getConversation(){
    stringeeChat.getLastConversations(50, false, function (status, code, message, convs) {
        console.log(status + code + message + ' convs:', convs);
        convs.forEach(element => {
            let arr = element.participants.filter(e => e.userId != myUserId && !userList.find(e1 => e1.userId == e.userId));
            if (arr) {
                arr.forEach(e => {
                    userList.push({...e});
                });
            }
        });

        console.log("userList", userList);
        updateViewChatList(convs);
        convList = convs;
    });
}

function getLastMessages(convId){
    stringeeChat.getLastMessages(convId, 50, true, function (status, code, message, msgs) {
        console.log('status:' + status + ' code:' + code + ' message:' + message + ' conv:', msgs);
        currentMessages = msgs;
        updateViewChatContent(msgs);
    });
}

function getConvName(convInfo){
    let arr = convInfo.participants.filter(e => e.userId != myUserId);
    arr = arr.map(e => e.userId);
    convsName = arr.join(', ');

    return convsName;
}

function showChat(convId){
    getLastMessages(convId);
    $('#noChat').hide('fast');
    $('#chatContent').show('fast');
    currentConv = convList.find(e => e.id == convId);
    console.log("currentConv: ", currentConv);
    currentConv.hasNewMsg = false;
    if (currentConv) {
        $('#convName').html(getConvName(currentConv));
        const avatarUrl = getAvatarConv(currentConv);
        $('#convAvatar').attr('src', avatarUrl);
        $('#convAvatar').show();

        $('#btnSend').attr('disabled', false);
        $('#messageContent').attr('disabled', false);
    }
}

function updateUserInfo(){

    var data = {
        avatar_url: './img/' + getRandomInt() + '.jfif',
        display_name: myUserId,
        useragent: window.navigator.userAgent,
    };

    return new Promise(function(resolve, reject) {
        stringeeChat.updateUserInfo(data, function (res) {
            console.log(res);
            resolve(res);
        })
    })
}

function getUsersInfo(userIds){
    return new Promise(function(resolve, reject) {
        stringeeChat.getUsersInfo(userIds, function (status, code, message, users) {
            console.log('users info:', users);
            resolve(users);
        });
    });
}

function getRandomInt(min = 0, max = 10) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getAvatarConv(convs){
    let arr = convs.participants.filter(e => e.userId != myUserId);
    arr = arr.map(e => e.userId);
    convsName = arr.join(', ');

    const ortherUser = convs.participants.find(e => e.userId != myUserId);

    if (arr.length > 1) {
        return './img/group.jpg'
    } else {
        return ortherUser && ortherUser.avatar ? ortherUser.avatar : './img/0.jfif';
    }
}

function updateViewChatList(convs){
    let html = '';
    console.log("updateViewChatList", convs);
    convs.forEach((element, index) => {
        let chatItemTemp = chatItem;
        let convsName = '';

        const lastMessage = element.lastMessage && element.lastMessage.content && element.lastMessage.content.content ? element.lastMessage.content.content : '...';
        if (element.id == currentConv.id) {
            chatItemTemp = chatItemTemp.replaceAll('{{active}}', 'active');
        } else {
            chatItemTemp = chatItemTemp.replaceAll('{{active}}', '');
        }

        let arr = element.participants.filter(e => e.userId != myUserId);
        arr = arr.map(e => e.userId);
        convsName = arr.join(', ');

        const ortherUser = element.participants.find(e => e.userId != myUserId);

        chatItemTemp = chatItemTemp.replaceAll('{{name}}', convsName);
        chatItemTemp = chatItemTemp.replaceAll('{{convId}}', element.id);
        chatItemTemp = chatItemTemp.replaceAll('{{lastMessage}}', lastMessage);
        
        if (arr.length > 1) {
            chatItemTemp = chatItemTemp.replaceAll('{{avatarUrl}}', './img/group.jpg');   
        } else {
            chatItemTemp = chatItemTemp.replaceAll('{{avatarUrl}}', ortherUser && ortherUser.avatar ? ortherUser.avatar : './img/' + index + '.jfif');
        }

        if (element.hasNewMsg) {
            chatItemTemp = chatItemTemp.replaceAll('{{badgeNewMsg}}', badgeNewMsg);
        } else {
            chatItemTemp = chatItemTemp.replaceAll('{{badgeNewMsg}}', '');
        }

        userInfo[arr[0]] = './img/' + index + '.jfif';

        html += chatItemTemp;
    });
    $('#chatList').html(html);
}

function updateViewChatContent(messages){
    let html = '';
    let sender = '';
    let htmlItem = '';

    console.log("updateViewChatContent", messages);

    messages.forEach((element, index) => {
        let htmlMessageItem = messageItem;
        if (!sender) {
            sender = element.sender;
        } else if (sender != element.sender) {
            if (sender != myUserId) {
    
                let user = userList.find( e => e.userId == sender);
                let htmlOrtherMessage = ortherMessage.replaceAll('{{avatarUrl}}', user && user.avatar ? user.avatar : './img/0.jfif');

                htmlOrtherMessage = htmlOrtherMessage.replaceAll('{{messageItem}}', htmlItem.substring(0, htmlItem.length - 5));
                html += htmlOrtherMessage;
                htmlItem = '';
            } else {
                let htmlMyMessage = myMessage.replaceAll('{{messageItem}}', htmlItem.substring(0, htmlItem.length - 5));
                html += htmlMyMessage;
                htmlItem = '';
            }
            sender = element.sender;
        }
        const content = element.content ? element.content.content : '';
        if (content) {
            htmlItem += htmlMessageItem.replaceAll('{{contentMessage}}', content);
        }

        if (index >= messages.length - 1) {
            if (sender != myUserId) {
                let user = userList.find( e => e.userId == sender);
                let htmlOrtherMessage = ortherMessage.replaceAll('{{avatarUrl}}', user && user.avatar ? user.avatar : './img/0.jfif');

                htmlOrtherMessage = htmlOrtherMessage.replaceAll('{{messageItem}}', htmlItem.substring(0, htmlItem.length - 5));
                html += htmlOrtherMessage;
            } else {
                let htmlMyMessage = myMessage.replaceAll('{{messageItem}}', htmlItem.substring(0, htmlItem.length - 5));
                html += htmlMyMessage;
                htmlItem = '';
            }
        }
    });

    $('#chatContent').html(html);
    scrollToLastMessage();
}