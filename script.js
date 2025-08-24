let baseURL = "http://127.0.0.1:5500/songs/";

//returns song from our song directory(usually we would bring this from server when we would know backend but rn we dont know so now we bring from our directory only)
 let currentSong=new Audio();
 let songs;
 let currFolder;
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
async function loadSongs(folder) {
  try {
    currFolder=folder;
    let res = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await res.text();  // get HTML/text response from the URL
    
    let div = document.createElement("div");
    div.innerHTML = response;

    let links = div.querySelectorAll("ul#files a");
    songs = [];

    links.forEach(link => {
      let href = link.getAttribute("href");
      if (href && href.endsWith(".mp3")) {
        let fullURL = new URL(href, baseURL).href;
        songs.push(fullURL.split(`/${folder}/`)[1]);
      }
    });

    sessionStorage.setItem('songs', JSON.stringify(songs));
      
  } catch (err) {
    console.error("Failed to load songs:", err);
  }
  //show all the songs in the palylist
let songUl=document.querySelector(".songList").getElementsByTagName("ul")[0]
songUl.innerHTML="";
for (const song of songs) {
  songUl.innerHTML=songUl.innerHTML+`<li> <img class="invert" src="music.svg" alt="">
                    <div class="info">
                        <div>  ${song.replaceAll("%20"," ")}</div>
                        <div>Kashish</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="">
                    </div> </li>`;
  
}
//attach an event listener to each song
Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
  e.addEventListener("click",element=>{
   
    playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
  })
})
return songs
}
const playMusic=(track,pause=false)=>{
        currentSong.src = `${currFolder}/` + track;
        if(!pause){
            currentSong.play();
            play.src="pause.svg"
        }
        
        document.querySelector(".songinfo").innerHTML=decodeURI(track)
        document.querySelector(".songtime").innerHTML="00:00 / 00:00"
}

async function displayAlbums(){
 let res = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await res.text();  // get HTML/text response from the URL
    
    let div = document.createElement("div");
    div.innerHTML = response;
  let anchors=div.getElementsByTagName("a")
  let cardContainer=document.querySelector(".cardContainer")
  let array=Array.from(anchors)
 
      for(let index=0;index<array.length;index++){
        const e=array[index];
    if(e.href.includes("/songs") && e.href !== "http://127.0.0.1:5500/songs")
    {
      let folder=e.href.split("/").slice(-2)[1]
      //get metadata of the folder
      let res = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
    let response = await res.json();
    console.log(response)
    cardContainer.innerHTML=cardContainer.innerHTML+ `<div data-folder="${folder}" class="card ">
                    <div class="play">
                       <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                       </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`
      
    }
      }
  //load the playlist whenever card is clicked
Array.from(document.getElementsByClassName("card")).forEach(e=>{
  e.addEventListener("click",async item=>{

    songs=await loadSongs(`songs/${item.currentTarget.dataset.folder}`)
    //first song of playlist plays
    playMusic(songs[0])
  })
})
}

async function main(){
 
  //get lists of all the songs
await loadSongs("songs/cs");
playMusic(songs[0],true)

//display all albums on the page
displayAlbums()

//attach an event listener to play,next and previous
//play->if playing then pause,if pause then play
play.addEventListener("click",()=>{
  if(currentSong.paused)
  {
    currentSong.play()
    play.src="pause.svg"
  }
  else{
    currentSong.pause()
    play.src="play.svg"
  }
})

//listen for timeupdate event
currentSong.addEventListener("timeupdate",()=>{
  document.querySelector(".songtime").innerHTML= `${secondsToMinutesSeconds(currentSong.currentTime)}
    / ${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left=(currentSong.currentTime/currentSong.duration)*100 + "%" ;
})
//add event listener to seekbar
document.querySelector(".seekbar").addEventListener("click",e=>{
  let percent=(e.offsetX/e.target.getBoundingClientRect().width) *100
  document.querySelector(".circle").style.left=percent +"%";
  currentSong.currentTime=((currentSong.duration)*percent)/100
})

//add an event listener for hamburger
document.querySelector(".hamburger").addEventListener("click",()=>{
      document.querySelector(".left").style.left="0"
})

//add an event listener for close button
document.querySelector(".close").addEventListener("click",()=>{
      document.querySelector(".left").style.left="-120%"
})


previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");

    let currentTrack = decodeURI(currentSong.src.split("/").slice(-1)[0]);
    let index = songs.indexOf(currentTrack);

    if (index > 0) {
        playMusic(songs[index - 1]);
    }
});

next.addEventListener("click", () => {
    currentSong.pause();
    console.log("Next clicked");

    let currentTrack = decodeURI(currentSong.src.split("/").slice(-1)[0]);
    let index = songs.indexOf(currentTrack);

    if (index + 1 < songs.length) {
        playMusic(songs[index + 1]);
    }
});





//add an event to volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
console.log("Setting volume to:",e.target.value,"/ 100");
currentSong.volume=parseInt(e.target.value)/100;
if(currentSong.volume>0)
{
  document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
}
})
//add event listener to mute track
document.querySelector(".volume>img").addEventListener("click",e=>{
  if(e.target.src.includes("volume.svg"))
  {
    e.target.src=e.target.src.replace("volume.svg","mute.svg")
    currentSong.volume=0;
    document.querySelector(".range").getElementsByTagName("input")[0].value=0;
  }
  else{
    e.target.src=e.target.src.replace("mute.svg","volume.svg")
    currentSong.volume=.10;
    document.querySelector(".range").getElementsByTagName("input")[0].value=10;
  }
})


}
main()
