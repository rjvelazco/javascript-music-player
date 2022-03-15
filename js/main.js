const $musicContainer = document.getElementById("music-container");
const $trackList = document.getElementById("track-list");

const $playBtn = document.getElementById("play");
const $prevBtn = document.getElementById("prev");
const $nextBtn = document.getElementById("next");
const $detailBtn = document.getElementById("detail-btn");
const $progressContainer = document.getElementById("progress-container");
const $progressBar = document.getElementById("progress-bar");

// Details
const $title = document.getElementById("title");
const $artist = document.getElementById("artist");
const $cover = document.getElementById("cover");
const $currentTime = document.getElementById("current-time");
const $durationTime = document.getElementById("duration-time");

let songs = [];
let songIndex;
let currentSong;
let repeat = false;
const audio = new Audio();

fetch("../db/data.json")
  .then((data) => data.json())
  .then((data) => {
    songs = data;
    songIndex = 0;
    setSong(songs[0]);
    fillTrackList(songs);
  });

// Update song details
function setSong(song) {
  currentSong = song;
  $title.innerText = song.title;
  $artist.innerText = song.artist;
  $cover.src = `${song.img}`;
  audio.src = `${song.source}`;
  updateComments(song);
  updateAmountSong();
}

// Get Song data base on the id
function getSongData(id) {
  let song;
  for (let i = 0; i < songs.length; i++) {
    if (songs[i].id == id) {
      song = songs[i];
      songIndex = i;
      break;
    }
  }

  setSong(song);

  playSong();
}

// Play song
function playSong() {
  $musicContainer.classList.add("play");
  $playBtn.querySelector("i.fas").classList.remove("fa-play");
  $playBtn.querySelector("i.fas").classList.add("fa-pause");

  audio.play();
}

// Pause song
function pauseSong() {
  $musicContainer.classList.remove("play");
  $playBtn.querySelector("i.fas").classList.add("fa-play");
  $playBtn.querySelector("i.fas").classList.remove("fa-pause");

  audio.pause();
}

// Previous song
function prevSong() {
  songIndex--;

  if (songIndex < 0) {
    songIndex = songs.length - 1;
  }

  setSong(songs[songIndex]);

  playSong();
}

// Next song
function nextSong(songEnd = true) {
  if (repeat && songEnd) {
    setSong(currentSong);
    playSong();
    return;
  }

  songIndex++;

  if (songIndex > songs.length - 1) {
    songIndex = 0;
  }

  setSong(songs[songIndex]);
  playSong();
}

// Update progress bar
function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  $progressBar.style.width = `${progressPercent}%`;
}

// Set progress bar
function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;

  audio.currentTime = (clickX / width) * duration;
}

// FILLS
const fillTrackList = (songs) => {
  let html = "";

  songs.forEach((song, index) => {
    html += `
      <div class="track-list-item" onclick="getSongData(${song.id})">
          <span class="px-2">${index + 1}</span>
          <img src="./${song.img}" class="img-fluid rounded mx-auto d-block"
              alt="song.title" />
          <div class="info d-flex flex-column justify-content-between">
              <h4>${song.title}</h4>
              <span>${song.artist}</span>
          </div>
      </div>
      `;
  });

  $trackList.innerHTML = html;
};

const formSubmit = (e) => {
  e.preventDefault();
  const $userNameInput = document.getElementById("user");
  const $commentInput = document.getElementById("comment");
  currentSong.comments.push({
    user: $userNameInput.value,
    comment: $commentInput.value,
  });

  $userNameInput.value = "";
  $commentInput.value = "";

  updateSong(currentSong);
  updateComments(currentSong);
};

const updateSong = (updatedSong) => {
  songs.map((song) => {
    if (song.id == updatedSong.id) {
      return updatedSong;
    }
    return song;
  });
};

const changeVolume = ({ target }) => {
  const $volume = document.getElementById("volume");
  const currentVolume = target.value;
  audio.volume = currentVolume;
  $volume.innerHTML = `${Math.round(currentVolume * 100)}%`;
};

// Event listeners
$playBtn.addEventListener("click", () => {
  const isPlaying = $musicContainer.classList.contains("play");

  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
});

// // Change song
$prevBtn.addEventListener("click", prevSong);
$nextBtn.addEventListener("click", () => {
  nextSong(false);
});

// Time/song update
audio.addEventListener("timeupdate", updateProgress);

// // Click on progress bar
$progressContainer.addEventListener("click", setProgress);

// // Song ends
audio.addEventListener("ended", nextSong);

// Display details
$detailBtn.addEventListener("click", () => displayModal(currentSong));

// Update Time
function updateCurrentTime(e) {
  const { currentTime } = e.srcElement;

  // Obtenemos los minutos del tiempo actual
  let min = currentTime == null ? 0 : Math.floor(currentTime / 60);
  min = min < 10 ? "0" + min : min;

  // Obtenemos los segundos del tiempo actual
  const sec = get_sec(currentTime);

  // Cambiamos el currentTime en el DOM
  $currentTime.innerHTML = min + ":" + sec;
}

function updateDurationTime(e) {
  const { duration } = e.srcElement;

  // Obtenemos los minutos del tiempo Totale
  let min = isNaN(duration) === true ? "0" : Math.floor(duration / 60);
  min = min < 10 ? "0" + min : min;

  // Obtenemos los segundos del tiempo Total
  const sec = get_sec(duration);

  // Cambiamos el duration en el DOM
  $durationTime.innerHTML = min + ":" + sec;
}

function get_sec(x) {
  let sec;
  if (!isNaN(x) && Math.floor(x) >= 60) {
    for (var i = 1; i <= 60; i++) {
      if (Math.floor(x) >= 60 * i && Math.floor(x) < 60 * (i + 1)) {
        sec = Math.floor(x) - 60 * i;
        sec = sec < 10 ? "0" + sec : sec;
      }
    }
  } else {
    if (isNaN(x)) {
      sec = 0;
    } else {
      sec = Math.floor(x);
    }
    sec = sec < 10 ? "0" + sec : sec;
  }

  return sec;
}

audio.addEventListener("timeupdate", updateCurrentTime);
audio.addEventListener("loadedmetadata", updateDurationTime);

// Utils
const toggleRepeatSong = ({ target }) => {
  repeat = !repeat;
  if (repeat) {
    target.classList.add("active");
  } else {
    target.classList.remove("active");
  }
};

const updateComments = (song) => {
  const $comments = document.getElementById("comments");

  let str = "";

  if (song.comments.length > 0) {
    str += `<h4>${song.comments.length} Comentarios</h4>`;
    song.comments.forEach((comment) => {
      str += `
        <div class="comment">
          <strong class="mb-4">${comment.user}</strong>
          <p>${comment.comment}</p>
        </div>
      `;
    });
  } else {
    str += `<div class="alert alert-secondary" role="alert">No hay comentarios</div>`;
  }

  $comments.innerHTML = str;
};

const displayModal = (song) => {
  const $overlay = document.getElementById("overlay");

  $overlay.innerHTML = `
    <div class="modal" id="modal">
        <div class="row">
            <div class="col h2 d-flex justify-content-end align-items-end">
                <button class="btn btn-light" onclick="hideModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="card-details">
                <div class="modal-cover m-auto mb-4">
                    <img src="./${
                      song.img
                    }" class="img-fluid rounded mx-auto d-block" />
                </div>
                <div class="fild-desc">
                    <strong>Title: </strong><span>${song.title}</span>
                </div>
                <div class="fild-desc">
                    <strong>Artist: </strong><span>${song.artist}</span>
                </div>
                <div class="fild-desc">
                    <strong>Duration: </strong><span>${song.duration}</span>
                </div>
                <div class="fild-desc">
                    <strong>Comments (#): </strong><span>${
                      song.comments?.length || 0
                    } </span>
                </div>
            </div>
        </div>
    </div>
    `;

  $overlay.classList.remove("hidden");
};

const hideModal = () => {
  const $overlay = document.getElementById("overlay");
  $overlay.classList.add("hidden");
};

const updateAmountSong = () => {
  const $label = document.getElementById("amount-songs");
  $label.innerHTML = `#${songIndex + 1}/${songs.length}`;
};
