(() => {
    const startBox = document.querySelector(".start");
    const infoBox = document.querySelector(".info");
    const settingBox = document.querySelector(".settings");
    const sectionArea = document.querySelector(".sections");

    const startBtn = startBox.querySelector("button");
    const resetBtn = settingBox.querySelector("button");

    const strictCheckBox = settingBox.querySelector("input[type='checkbox']");
    const stepCountText = infoBox.querySelector("#step-count");
    const infoText = infoBox.querySelector("h3");

    const maxStep = 5;
    const audios = [];
    const audioSequence = [];
    const userInput = [];
    const mistakeAudioPosition = 4;

    let stepCount = 1;
    let isSystemPlaying = false;
    let isUserPlaying = false;
    let currentStepAudio;
    let subStep = 0;

    const reset = () => {
        startBox.classList.remove("hidden");
        infoBox.classList.add("hidden");

        strictCheckBox.checked = false;

        stepCount = 1;
        isSystemPlaying = false;
        isUserPlaying = false;
        stepCountText.innerText = stepCount;
        infoText.innerText = "Good luck!";

        subStep = 0;
        currentStepAudio = undefined;

        userInput.length = 0; // --- reseting array

        // --- disabling all playing buttons
        [...sectionArea.children].forEach(elm => elm.classList.add("disabled"));
    };

    const addAllEvents = () => {
        startBtn.addEventListener("click", startGame, false);
        resetBtn.addEventListener("click", reset, false);
        sectionArea.addEventListener("click", tileClickHandler, false);
    };

    const startGame = () => {
        startBox.classList.add("hidden");
        infoBox.classList.remove("hidden");

        // --- enabling the play buttons
        [...sectionArea.children].forEach(elm => elm.classList.remove("disabled"));

        isSystemPlaying = true;
        startLoop();
    };

    const tileClickHandler = (e) => {
        const { target: { dataset: { id } } } = e;

        if (!isSystemPlaying && !isUserPlaying) {
            highlighTile(Number(id));
            audios[Number(id) - 1].play();

            isUserPlaying = true;
            userInput.push(id);
        }

    };

    const preloadAudio = () => {
        const allAudios = ["btn-1.mp3", "btn-2.mp3", "btn-3.mp3", "btn-4.mp3", "mistake.mp3"];
        const AUDIO_BASE_PATH = "./audio/";
        let loadedAudioCount = 1;

        const init = () => {
            let audio = new Audio();

            audio.addEventListener("canplaythrough", loadedAudio, false);
            audio.addEventListener("ended", onAudioEnd, false);

            audio.src = `${AUDIO_BASE_PATH}${allAudios[loadedAudioCount - 1]}`;
            loadedAudioCount++;
            audios.push(audio);
        }

        const loadedAudio = () => {
            if (loadedAudioCount <= allAudios.length) {
                init();
            }
        }

        init();
    };

    const createAudioSequences = () => {
        let i = 0;

        while (i <= maxStep) {
            audioSequence[i] = [];
            for (let j = 0; j < (i + 1); j++) {
                audioSequence[i].push(getRandom(1, 5));
            }

            i++;
        }

        console.log(audioSequence);
    };

    const getRandom = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    const startLoop = () => {

        currentStepAudio = audioSequence[stepCount - 1];
        console.log(currentStepAudio);
        highlighTile(currentStepAudio[subStep]);

        audios[currentStepAudio[subStep] - 1].play();
        subStep++;
    };

    const onAudioEnd = (e) => {

        if (isSystemPlaying) {
            removeHighlight();

            if (subStep < currentStepAudio.length) {
                audios[currentStepAudio[subStep] - 1].play();

                /**
                 * forced to use 0 setTimeout as, if same tile highlighted in sequence
                 * It is not happening at all
                 * added 0 timer and issue solved :)
                */
                setTimeout(() => {
                    highlighTile(currentStepAudio[subStep]);
                    subStep++;
                }, 0);
            } else {
                isSystemPlaying = false;
            }
        }

        if (isUserPlaying) {
            removeHighlight();
            isUserPlaying = false;
            checkUserInput();
        }

    };

    const highlighTile = (tileNumber) => {
        [...sectionArea.children].forEach(elm => {
            elm.classList.remove("active");
            if (Number(elm.dataset.id) === tileNumber) {
                elm.classList.add("active");
            }
        });
    };

    const removeHighlight = () => {
        [...sectionArea.children].forEach(elm => {
            elm.classList.remove("active");
        });
    };

    const checkUserInput = () => {
        const lastUserInput = userInput[userInput.length - 1];
        const currentStepAudio = audioSequence[stepCount - 1];

        if (Number(lastUserInput) !== currentStepAudio[userInput.length - 1]) {
            // --- user made mistake 

            audios[mistakeAudioPosition].play();
            infoText.innerText = "Upss .. 😞";


            setTimeout(() => {
                if (strictCheckBox.checked) {
                    reset();
                    startGame();
                } else {
                    infoText.innerText = "This sound. 🤔";
                    subStep = 0;
                    userInput.length = 0;
                    setTimeout(() => {
                        infoText.innerText = "Good luck!";
                        startGame();
                    }, 500);
                }
            }, 500);
        } else if (userInput.length === currentStepAudio.length) {
            // --- correctly played the audio sequnce 

            // update step
            stepCount++;
            userInput.length = 0;
            subStep = 0;

            // show message
            stepCountText.innerText = stepCount;
            infoText.innerText = "Great, listen now! 😎";

            setTimeout(() => {
                if (stepCount < maxStep) {
                    infoText.innerText = "Good luck!";
                    startGame();
                } else {
                    // --- user won the game i.e. user completed all the steps
                    infoText.innerText = "Congratulations ✌️ ... You won! ";
                }
            }, 1000);

        }
    };

    window.addEventListener("DOMContentLoaded", () => {
        reset();
        addAllEvents();
        preloadAudio();
        createAudioSequences();
    });
})();
