// ── DOM References (same as original) ────────────────────────────────
const prevBtn = document.querySelector('#prev-btn');
const nextBtn = document.querySelector('#next-btn');
const book    = document.querySelector('#book');
const paper1  = document.querySelector('#p1');
const paper2  = document.querySelector('#p2');
const paper3  = document.querySelector('#p3');

// ── State (same as original) ──────────────────────────────────────────
let currentState = 1;
const numOfPapers = 3;
const maxState    = numOfPapers + 1;

// ── Book open/close (same logic as original) ──────────────────────────
function openBook() {
    book.style.transform = "translateX(50%)";
    prevBtn.style.transform = "translateX(-180px)";
    nextBtn.style.transform = "translateX(180px)";
}

function closeBook(isFirstPage) {
    if (isFirstPage) {
        book.style.transform = "translateX(0%)";
    } else {
        book.style.transform = "translateX(100%)";
    }
    prevBtn.style.transform = "translateX(0px)";
    nextBtn.style.transform = "translateX(0px)";
}

// ── Page navigation (same as original) ───────────────────────────────
function goNext() {
    if (currentState < maxState) {
        switch (currentState) {
            case 1:
                openBook();
                paper1.classList.add("flipped");
                paper1.style.zIndex = 1;
                break;
            case 2:
                paper2.classList.add("flipped");
                paper2.style.zIndex = 2;
                break;
            case 3:
                closeBook(false);
                paper3.classList.add("flipped");
                paper3.style.zIndex = 3;
                break;
            default:
                throw new Error("unknown state");
        }
        currentState++;
        refreshButtons();
    }
}

function goPrevious() {
    if (currentState > 1) {
        switch (currentState) {
            case 2:
                closeBook(true);
                paper1.classList.remove("flipped");
                paper1.style.zIndex = 3;
                break;
            case 3:
                paper2.classList.remove("flipped");
                paper2.style.zIndex = 2;
                break;
            case 4:
                openBook();
                paper3.classList.remove("flipped");
                paper3.style.zIndex = 1;
                break;
        }
        currentState--;
        refreshButtons();
    }
}

// ── Button state ──────────────────────────────────────────────────────
function refreshButtons() {
    prevBtn.disabled = (currentState === 1);
    nextBtn.disabled = (currentState === maxState);
}

prevBtn.addEventListener("click", goPrevious);
nextBtn.addEventListener("click", goNext);

// Keyboard
document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft")  goPrevious();
});

// ── Swipe / drag support ──────────────────────────────────────────────
// Uses the same book element from original. Works on both mouse and touch.

let startX     = null;
let startY     = null;
let dragging   = false;
let axisLocked = false;   // set true once we confirm horizontal gesture

const SWIPE_THRESHOLD = 50; // px needed to trigger a page turn

function getXY(e) {
    var src = e.touches ? e.touches[0] : e;
    return { x: src.clientX, y: src.clientY };
}

function onDragStart(e) {
    // Don't intercept clicks on the buttons
    if (e.target.closest('button')) return;
    var pt = getXY(e);
    startX     = pt.x;
    startY     = pt.y;
    dragging   = true;
    axisLocked = false;
}

function onDragMove(e) {
    if (!dragging || startX === null) return;

    var pt = getXY(e);
    var dx = pt.x - startX;
    var dy = pt.y - startY;

    // Wait for enough movement before deciding axis
    if (!axisLocked) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        if (Math.abs(dy) > Math.abs(dx) * 1.1) {
            // Vertical — release the gesture back to browser
            dragging = false;
            return;
        }
        axisLocked = true;
    }

    // We own this gesture now — prevent scroll
    e.preventDefault();
}

function onDragEnd(e) {
    if (!dragging) return;
    dragging   = false;
    axisLocked = false;

    if (startX === null) return;

    var pt = e.changedTouches ? e.changedTouches[0] : e;
    var dx = pt.clientX - startX;
    startX = null;

    if (dx < -SWIPE_THRESHOLD) {
        goNext();       // swiped left  → next page
    } else if (dx > SWIPE_THRESHOLD) {
        goPrevious();   // swiped right → previous page
    }
}

// Attach to the whole document so fast swipes that leave the book area still register
document.addEventListener("mousedown",   onDragStart);
document.addEventListener("mousemove",   onDragMove);
document.addEventListener("mouseup",     onDragEnd);

// Touch: passive:false on move so we can call preventDefault
document.addEventListener("touchstart",  onDragStart,  { passive: true });
document.addEventListener("touchmove",   onDragMove,   { passive: false });
document.addEventListener("touchend",    onDragEnd,    { passive: true });
document.addEventListener("touchcancel", onDragEnd,    { passive: true });

// ── Init ──────────────────────────────────────────────────────────────
refreshButtons();
