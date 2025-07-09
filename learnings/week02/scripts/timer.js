const countdownDisplay = document.getElementById('countdown');
const startButton = document.getElementById('startButton');
const pasueResumeButton = document.getElementById('pauseandresumeButton');

let timeLeft = 10;
let isPaused = false;
let intervalId;

function updateDisplay() {
   countdownDisplay.textContent = formatTime(timeLeft);
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

startButton.addEventListener('click', () => {
    if(intervalId){
        return
    }
  intervalId = setInterval(() => {
    if (timeLeft >= 0) {
      countdownDisplay.textContent = timeLeft;
      timeLeft--;
    } else {
      clearInterval(intervalId);
      intervalId = null;
      countdownDisplay.textContent = "The timer has ran out sadly.";
    }
  }, 1000); 
});

pasueResumeButton.addEventListener('click', () => {
    if(isPaused){
        isPaused = false
        intervalId = setInterval(() => {
            if(timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                clearInterval(intervalId);
                intervalId = null;
                countdownDisplay.textContent = "The timer has ran out sadly.";
            }
        }, 1000);
    } else {
        isPaused = true;
        clearInterval(intervalId)
        intervalId = null
    }
});


