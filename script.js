let currentSong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let file = element.href.split(`/${folder}/`)[1];
            let decoded = decodeURIComponent(file);
            let prettyName = decoded.replace(".mp3", "").replace(/ *\([^)]*\) */g, "").trim();

            songs.push({
                file: file,
                name: prettyName
            });
        }
    }

    let songUl = document.querySelector(".songList ul");
    songUl.innerHTML = "";

    for (const song of songs) {
        songUl.innerHTML += `<li data-file="${song.file}">
            <img class="invert" src="/img/music.svg" alt="">
            <div class="info">
                <div>${song.name}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div> 
        </li>`;
    }

    Array.from(document.querySelectorAll(".songList li")).forEach(e => {
        e.addEventListener("click", () => {
            let file = e.getAttribute("data-file");
            playMusic(file);
        });
    });
}

const playMusic = (track, pause = false) => {
    if (!track) {
        document.querySelector(".songinfo").innerText = "No song playing";
        return;
    }

    currentSong.src = `/${currfolder}/` + track;
    
    if (!pause) {
        currentSong.play();
        play.src = "/img/pause.svg";
    }

    const songName = decodeURIComponent(track).replace(".mp3", "").replace(/ *\([^)]*\) */g, "").trim();
    document.querySelector(".songinfo").innerText = songName;
    document.querySelector(".songtime").innerText = "00:00/00:00";
};


async function main() {
    await getSongs("songs/English");
    if (songs.length > 0) {
        playMusic(songs[0].file, true);
    } else {
        document.querySelector(".songinfo").innerText = "No song playing";
    }
    
    
    

    const playBtn = document.getElementById("play");

    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "/img/pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "/img/play.svg";
        }
    });

    document.body.addEventListener("keydown",(e)=>{
        if (e.code === 'Space'){
            if(currentSong.paused){
                currentSong.play();
                playBtn.src = "img/pause.svg"
            }
            else{
                currentSong.pause();
                playBtn.src = "img/play.svg"
            }
        }
        
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/
        ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.getElementById("previous").addEventListener("click", () => {
        let currentFile = currentSong.src.split("/").pop();
        let index = songs.findIndex(song => song.file === currentFile);
        if (index > 0) {
            playMusic(songs[index - 1].file);
        }
    });

    document.getElementById("nextsong").addEventListener("click", () => {
        let currentFile = currentSong.src.split("/").pop();
        let index = songs.findIndex(song => song.file === currentFile);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1].file);
        }
    });
    
    document.body.addEventListener("keydown",(e)=>{
        if(e.code === 'ArrowLeft'){
            let currentFile = currentSong.src.split("/").pop();
            let index = songs.findIndex(song => song.file === currentFile);
            if (index > 0) {
                playMusic(songs[index - 1].file);
            }
        }
    });

    document.body.addEventListener("keydown",(e)=>{
        if(e.code === 'ArrowRight'){
            let currentFile = currentSong.src.split("/").pop();
            let index = songs.findIndex(song => song.file === currentFile );
            if(index < songs.length -1){
                playMusic(songs[index+1].file)
            }
        }
    })

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if(currentSong.volume>0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg");
        }
    });

    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.dataset.folder;
            await getSongs(`songs/${folder}`);
        });
    });

    
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}

main();
