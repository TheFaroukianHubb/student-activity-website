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
		image.alt = photo.caption;
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

	viewerCounter.textContent = `${String(activePhotoIndex + 1).padStart(2, "0")} / ${String(visiblePhotos.length).padStart(2, "0")}`;
	viewerCategory.textContent = photo.categoryLabel.toUpperCase();
	viewerTitle.textContent = photo.title;
	viewerCaption.textContent = photo.caption;

	if (photo.src) {
		viewerImage.hidden = false;
		viewerImage.src = photo.src;
		viewerImage.alt = photo.caption;
		viewerArt.hidden = true;
		viewerArt.replaceChildren();
		viewerImage.onerror = () => {
			viewerImage.hidden = true;
			viewerImage.removeAttribute("src");
			viewerArt.hidden = false;
			viewerArt.replaceChildren(createArtwork(photo, true));
		};
	} else {
		viewerImage.hidden = true;
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
backToTop.textContent = "↑";
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
    paymentNotificationMessage.textContent = `TEST PAYMENT VERIFIED · EGP ${amount.toFixed(2)} · Reference ${reference}. This is a simulated event, not a real bank confirmation.`;
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