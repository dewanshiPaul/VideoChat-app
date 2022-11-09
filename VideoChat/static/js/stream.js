const APP_ID = '35fb83f1b23b4ee3b3caa491ba174658';
const CHANNEL = sessionStorage.getItem('room');
const TOKEN = sessionStorage.getItem('token');
let userID = Number(sessionStorage.getItem('userID'));

const client = AgoraRTC.createClient({
    mode: 'rtc',
    codec: 'vp8',
})

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
    //setting room name
    document.getElementById('room-name').innerText = CHANNEL;

    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    try {
        userID = await client.join(APP_ID, CHANNEL, TOKEN, userID) //join channel
    } catch(error) {
        console.error(error);
        window.open('/', '_self')
    }
    //audio and video tracks
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    //create video player
    let player= 
            `<div class="video-container" id="user-container-${userID}">
                <div class="username-wrapper">
                    <span class="user-name">
                        ${userID}
                    </span>
                </div>
                <div class="video-player" id="user-${userID}">

                </div>
            </div>`
    
    //add into the dom
    document.getElementById('video-stream').insertAdjacentHTML('beforeend', player)
    //create video tag and put it for playing video-frames
    localTracks[1].play(`user-${userID}`) 
    //allow other users to see the frames 
    await client.publish([localTracks[0], localTracks[1]])//first audio then video channels
}

let handleUserJoined = async (user, mediaType) => {
    console.log('User has joined the stream');
    //add user to remote user
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)
    //get video source and append it to remote user video frame
    if(mediaType === 'video') {
        let player = document.getElementById(`user-container-${user.uid}`)
        if(player != null) 
            player.remove()
        //remote user display
        player= 
            `<div class="video-container" id="user-container-${user.uid}">
                <div class="username-wrapper">
                    <span class="user-name">
                        ${user.uid}
                    </span>
                </div>
                <div class="video-player" id="user-${user.uid}">
                </div>
            </div>`
    
        //add into the dom
        document.getElementById('video-stream').insertAdjacentHTML('beforeend', player)
        user.videoTrack.play(`user-${user.uid}`)
    }
    //add audio tracks also
    if(mediaType === 'audio') {
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid];

    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveUserFromStream = async () => {
    //stop and close tracks, unsubscribe from channel and remove
    for(let i=0;i<localTracks.length;i++) {
        localTracks[i].stop();
        localTracks[i].close()
    }

    await client.leave()
    window.open('/', '_self')
}

let toggleMicrophone = async (event) => {
    if(localTracks[0].muted) {
        await localTracks[0].setMuted(false)
        event.target.style.backgroundColor = 'rgb(249, 230, 230)';
    } else {
        await localTracks[0].setMuted(true);
        event.target.style.backgroundColor = 'rgb(255,80,80,1)'
    }
}

let toggleVideoCamera = async (event) => {
    if(localTracks[1].muted) {
        await localTracks[1].setMuted(false)
        event.target.style.backgroundColor = 'rgb(249, 230, 230)';
    } else {
        await localTracks[1].setMuted(true);
        event.target.style.backgroundColor = 'rgb(255,80,80,1)'
    }
}

joinAndDisplayLocalStream()

document.getElementById('exit-btn').addEventListener('click', leaveUserFromStream)
document.getElementById('mic-btn').addEventListener('click', toggleMicrophone)
document.getElementById('video-btn').addEventListener('click', toggleVideoCamera)