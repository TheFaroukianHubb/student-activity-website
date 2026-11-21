/* OUR SPACE: interactive photo gallery with the imported collection. */
/* Imported photo collection. The original filenames are retained. */
const galleryPhotos = window.galleryPhotos;

const galleryGrid = document.querySelector("#gallery-grid");
const galleryEmpty = document.querySelector("#gallery-empty");
const galleryFilters = document.querySelectorAll(".gallery-filter");
const photoViewer = document.querySelector("#photo-viewer");
const viewerImage = document.querySelector("#viewer-image");
const viewerArt = document.querySelector("#viewer-art");
const viewerCounter = document.querySelector("#viewer-counter");
const viewerCategory = document.querySelector("#viewer-category");
const viewerTitle = document.querySelector("#viewer-title");
const viewerCaption = document.querySelector("#viewer-caption");
const viewerClose = document.querySelector("#viewer-close");
const viewerPrevious = document.querySelector("#viewer-prev");
const viewerNext = document.querySelector("#viewer-next");
const viewerZoomIn = document.querySelector("#viewer-zoom-in");
const viewerZoomOut = document.querySelector("#viewer-zoom-out");

let viewerZoom = 1;

function applyViewerZoom() {
    viewerImage.style.transform =
        `translate(${imageOffsetX}px, ${imageOffsetY}px) scale(${viewerZoom})`;

    viewerImage.style.cursor = viewerZoom > 1 ? "grab" : "default";

    if (viewerZoomOut) viewerZoomOut.disabled = viewerZoom <= 1;
if (viewerZoomIn) viewerZoomIn.disabled = viewerZoom >= 3;
}

function changeViewerZoom(amount) {
    viewerZoom = Math.min(3, Math.max(1, viewerZoom + amount));
    applyViewerZoom();
}

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let imageOffsetX = 0;
let imageOffsetY = 0;

function updateImagePosition() {
    viewerImage.style.transform =
        `translate(${imageOffsetX}px, ${imageOffsetY}px) scale(${viewerZoom})`;
}

viewerImage.addEventListener("pointerdown", event => {
    if (viewerZoom <= 1) return;

    isDragging = true;
    dragStartX = event.clientX - imageOffsetX;
    dragStartY = event.clientY - imageOffsetY;

    viewerImage.classList.add("is-dragging");
    viewerImage.setPointerCapture(event.pointerId);
});

viewerImage.addEventListener("pointermove", event => {
    if (!isDragging) return;

    imageOffsetX = event.clientX - dragStartX;
    imageOffsetY = event.clientY - dragStartY;

    updateImagePosition();
});

function stopDragging() {
    isDragging = false;
    viewerImage.classList.remove("is-dragging");
}

viewerImage.addEventListener("pointerup", stopDragging);
viewerImage.addEventListener("pointercancel", stopDragging);
let activeFilter = "all";
let visiblePhotos = [];
let activePhotoIndex = 0;
let lastFocusedElement = null;

function createArtwork(photo, large = false) {
	const artwork = document.createElement("div");
	artwork.className = `gallery-art ${photo.artClass}${large ? " gallery-art-large" : ""}`;

	const top = document.createElement("span");
	top.textContent = photo.artTop;
	if (photo.artClass === "gallery-art-three") top.className = "gallery-big";
	if (photo.artClass === "gallery-art-two") top.className = "gallery-art-message";

	const main = document.createElement("p");
	main.textContent = photo.artMain;
	if (photo.artClass === "gallery-art-two") main.className = "gallery-star";

	artwork.append(top, main);
	return artwork;
}

function createGalleryCard(photo, index) {
	const card = document.createElement("article");
	card.className = `gallery-card${photo.tall ? " gallery-tall" : ""}`;

	const openButton = document.createElement("button");
	openButton.className = "gallery-open";
	openButton.type = "button";
	openButton.setAttribute("aria-label", `Open gallery item: ${photo.title}`);
	openButton.addEventListener("click", () => openPhoto(index));

	if (photo.src) {
		const image = document.createElement("img");
		image.className = "gallery-photo";
		image.src = photo.src;
		image.alt = photo.title;
		image.loading = "lazy";
		image.addEventListener("error", () => image.replaceWith(createArtwork(photo)), { once: true });
		openButton.append(image);
	} else {
		openButton.append(createArtwork(photo));
	}

	const caption = document.createElement("div");
	caption.className = "gallery-caption";
	const label = document.createElement("span");
	label.textContent = `${String(index + 1).padStart(2, "0")} / ${photo.title.toUpperCase()}`;
	caption.append(label);
	card.append(openButton, caption);
	return card;
}

function renderGallery() {
	if (!galleryGrid) return;
	visiblePhotos = galleryPhotos.filter(photo => activeFilter === "all" || photo.category === activeFilter);
	galleryGrid.replaceChildren();
	visiblePhotos.forEach((photo, index) => galleryGrid.append(createGalleryCard(photo, index)));
	if (galleryEmpty) galleryEmpty.hidden = visiblePhotos.length !== 0;
}

function updateViewer() {
	const photo = visiblePhotos[activePhotoIndex];
	if (!photo) return;
viewerZoom = 1;
imageOffsetX = 0;
imageOffsetY = 0;
	viewerCounter.textContent = `${String(activePhotoIndex + 1).padStart(2, "0")} / ${String(visiblePhotos.length).padStart(2, "0")}`;
	viewerCategory.textContent = photo.categoryLabel.toUpperCase();
	viewerTitle.textContent = photo.title;
	viewerCaption.textContent = "";
viewerCaption.hidden = true;

	if (photo.src) {
		viewerImage.hidden = false;
		viewerImage.src = photo.src;
	viewerImage.alt = photo.title;
		applyViewerZoom();
		viewerArt.hidden = true;
		viewerArt.replaceChildren();
		viewerImage.onerror = () => {
			viewerImage.hidden = true;
			viewerZoomIn.disabled = true;
viewerZoomOut.disabled = true;
			viewerImage.removeAttribute("src");
			viewerArt.hidden = false;
			viewerArt.replaceChildren(createArtwork(photo, true));
		};
	} else {
		viewerImage.hidden = true;
		viewerZoomIn.disabled = true;
viewerZoomOut.disabled = true;
		viewerImage.removeAttribute("src");
		viewerArt.hidden = false;
		viewerArt.replaceChildren(createArtwork(photo, true));
	}

	const onlyOne = visiblePhotos.length < 2;
	viewerPrevious.disabled = onlyOne;
	viewerNext.disabled = onlyOne;
}

function openPhoto(index) {
	if (!photoViewer || !visiblePhotos[index]) return;
	activePhotoIndex = index;
	lastFocusedElement = document.activeElement;
	updateViewer();
	if (typeof photoViewer.showModal === "function") photoViewer.showModal();
	else photoViewer.setAttribute("open", "");
	viewerClose.focus();
}

function closePhotoViewer() {
	if (!photoViewer) return;
	if (typeof photoViewer.close === "function" && photoViewer.open) photoViewer.close();
	else photoViewer.removeAttribute("open");
	if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
}

function moveViewer(direction) {
	if (!visiblePhotos.length) return;
	activePhotoIndex = (activePhotoIndex + direction + visiblePhotos.length) % visiblePhotos.length;
	updateViewer();
}

galleryFilters.forEach(button => {
	button.addEventListener("click", () => {
		activeFilter = button.dataset.filter || "all";
		galleryFilters.forEach(filterButton => {
			const active = filterButton === button;
			filterButton.classList.toggle("is-active", active);
			filterButton.setAttribute("aria-pressed", String(active));
		});
		renderGallery();
	});
});

viewerClose?.addEventListener("click", closePhotoViewer);
viewerPrevious?.addEventListener("click", () => moveViewer(-1));
viewerNext?.addEventListener("click", () => moveViewer(1));
viewerZoomIn?.addEventListener("click", () => changeViewerZoom(0.25));
viewerZoomOut?.addEventListener("click", () => changeViewerZoom(-0.25));
photoViewer?.addEventListener("click", event => {
	if (event.target === photoViewer) closePhotoViewer();
});
document.addEventListener("keydown", event => {
	if (!photoViewer?.open) return;
	if (event.key === "ArrowLeft") moveViewer(-1);
	if (event.key === "ArrowRight") moveViewer(1);
});
renderGallery();

// Merchandise is marked as pending in the HTML. Ordering is intentionally disabled until launch.

/* Back to Top button */
const backToTop = document.createElement("button");
backToTop.textContent = "\u2191";
backToTop.className = "back-to-top";
backToTop.setAttribute("aria-label", "Back to top");
backToTop.type = "button";
document.body.appendChild(backToTop);

window.addEventListener("scroll", () => {
    backToTop.classList.toggle("visible", window.scrollY > 400);
});

backToTop.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


// Payment integration preview: deliberately simulated; it never initiates a payment or sends notifications.
const simulatePaymentButton = document.querySelector("#simulate-payment");
const testAmountInput = document.querySelector("#payment-test-amount");
const paymentTestStatus = document.querySelector("#payment-test-status");
const paymentNotificationPreview = document.querySelector("#payment-notification-preview");
const paymentNotificationMessage = document.querySelector("#payment-notification-message");

simulatePaymentButton?.addEventListener("click", () => {
    const amount = Number(testAmountInput?.value);
    if (!Number.isFinite(amount) || amount <= 0) {
        paymentTestStatus.textContent = "Enter a valid amount greater than zero.";
        paymentNotificationPreview.hidden = true;
        return;
    }

    const reference = `DEMO-${Date.now().toString().slice(-8)}`;
    paymentTestStatus.textContent = "Demo event: payment marked as verified by the test simulator.";
    paymentNotificationMessage.textContent = `TEST PAYMENT VERIFIED Â· EGP ${amount.toFixed(2)} Â· Reference ${reference}. This is a simulated event, not a real bank confirmation.`;
    paymentNotificationPreview.hidden = false;
});
// Committee member carousels
document.querySelectorAll(".member-carousel").forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const cards = Array.from(track.children);
    const prev = carousel.querySelector(".carousel-prev");
    const next = carousel.querySelector(".carousel-next");

    let index = 0;
    let timer;
    let paused = false;

    function visibleCards() {
        if (window.innerWidth <= 520) return 1;
        if (window.innerWidth <= 800) return 2;
        return 4;
    }

    function updateCarousel() {
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        const cardWidth = cards[0].getBoundingClientRect().width;
        const maxIndex = Math.max(0, cards.length - visibleCards());

        index = Math.min(index, maxIndex);

        track.style.transform =
            `translateX(-${index * (cardWidth + gap)}px)`;

        prev.disabled = index === 0;
        next.disabled = index === maxIndex;
    }

    function moveNext() {
        const maxIndex = Math.max(0, cards.length - visibleCards());
        index = index >= maxIndex ? 0 : index + 1;
        updateCarousel();
    }

    function movePrev() {
        const maxIndex = Math.max(0, cards.length - visibleCards());
        index = index <= 0 ? maxIndex : index - 1;
        updateCarousel();
    }

    function startTimer() {
        clearInterval(timer);
        if (!paused && cards.length > visibleCards()) {
            timer = setInterval(moveNext, 1000);
        }
    }

    next.addEventListener("click", () => {
        moveNext();
        startTimer();
    });

    prev.addEventListener("click", () => {
        movePrev();
        startTimer();
    });

    carousel.addEventListener("mouseenter", () => {
        paused = true;
        clearInterval(timer);
    });

    carousel.addEventListener("mouseleave", () => {
        paused = false;
        startTimer();
    });

    carousel.addEventListener("focusin", () => {
        paused = true;
        clearInterval(timer);
    });

    carousel.addEventListener("focusout", () => {
        paused = false;
        startTimer();
    });

    window.addEventListener("resize", () => {
        updateCarousel();
        startTimer();
    });

    updateCarousel();
    startTimer();
});



/* Memory Wall â€” public submissions are held for team approval in Supabase. */
(() => {
    const SUPABASE_URL = "https://ymluiuaaayuaupyllymh.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Zou-9TG9OUE0al6xqQw6Sg_BuiHU8f_";
    const MEMORY_ENDPOINT = `${SUPABASE_URL}/rest/v1/memory_messages`;

    const form = document.querySelector("#memory-form");
    const nameInput = document.querySelector("#memory-name");
    const messageInput = document.querySelector("#memory-message");
    const colorInputs = document.querySelectorAll('input[name="color"]');
    const submitButton = document.querySelector("#memory-submit");
    const formStatus = document.querySelector("#memory-form-status");
    const cardsContainer = document.querySelector("#memory-cards");

    if (!form || !nameInput || !messageInput || !submitButton || !formStatus || !cardsContainer) {
        return;
    }

    const requestHeaders = {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
    };

    function showFormStatus(message, state = "") {
        formStatus.textContent = message;
        formStatus.dataset.state = state;
    }

    function renderMemories(memories) {
        cardsContainer.replaceChildren();

        if (!memories.length) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "memory-empty";
            emptyMessage.textContent = "The wall is waiting for its first approved memories.";
            cardsContainer.appendChild(emptyMessage);
            return;
        }

        memories.forEach((memory) => {
            const card = document.createElement("article");
            card.className = "memory-card";
            const allowedColors = ["yellow", "pink", "blue", "green", "lavender", "peach"];
            const color = allowedColors.includes(memory.color) ? memory.color : "yellow";
            card.dataset.color = color;

            // Small per-card variations create a casual, pinboard-like arrangement.
            const rotation = (Math.random() * 7 - 3.5).toFixed(2);
            const offset = (Math.random() * 12 - 6).toFixed(1);
            card.style.setProperty("--note-rotation", `${rotation}deg`);
            card.style.setProperty("--note-offset", `${offset}px`);

            const message = document.createElement("p");
            message.textContent = memory.message;

            const author = document.createElement("p");
            author.className = "memory-card-author";
           author.textContent = `\u2014 ${memory.name || "Anonymous"}`;

            card.append(message, author);
            cardsContainer.appendChild(card);
        });
    }

    async function loadMemories() {
        try {
            const response = await fetch(
                `${MEMORY_ENDPOINT}?select=id,name,message,color,created_at&order=created_at.desc`,
                { headers: requestHeaders }
            );

            if (!response.ok) {
                throw new Error(`Request failed (${response.status})`);
            }

            const memories = await response.json();
            renderMemories(Array.isArray(memories) ? memories : []);
        } catch (error) {
            console.error("Could not load Memory Wall messages:", error);
            cardsContainer.replaceChildren();
            const errorMessage = document.createElement("p");
            errorMessage.className = "memory-empty";
            errorMessage.textContent = "The Memory Wall couldn't load right now. Please try again later.";
            cardsContainer.appendChild(errorMessage);
        }
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = nameInput.value.trim() || "Anonymous";
        const message = messageInput.value.trim();
        const selectedColor = form.querySelector('input[name="color"]:checked')?.value || "yellow";
        const allowedColors = ["yellow", "pink", "blue", "green", "lavender", "peach"];
        const color = allowedColors.includes(selectedColor) ? selectedColor : "yellow";

        if (!message) {
            showFormStatus("Please write a message before submitting.", "error");
            messageInput.focus();
            return;
        }

        if (name.length > 40 || message.length > 500) {
            showFormStatus("Your name must be 40 characters or fewer, and your message 500 or fewer.", "error");
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        showFormStatus("");

        try {
            const response = await fetch(MEMORY_ENDPOINT, {
                method: "POST",
                headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({ name, message, color })
            });

            if (!response.ok) {
                const details = await response.text();
                console.error("Memory Wall submission failed:", response.status, details);
                throw new Error(`Request failed (${response.status})`);
            }

            form.reset();
            showFormStatus("Thank you! Your memory has been sent for review and will appear after the team approves it.", "success");
        } catch (error) {
            console.error("Could not submit Memory Wall message:", error);
            showFormStatus("We couldn't send your message. Please check your connection and try again.", "error");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Send your memory";
        }
    });

    loadMemories();
})();
