const menuToggle = document.querySelector("#menu-toggle");
const menuClose = document.querySelector("#menu-close");
const drawer = document.querySelector("#site-drawer");
const backdrop = document.querySelector("#drawer-backdrop");
const drawerLinks = drawer.querySelectorAll(".drawer-nav a");

function setMenuOpen(isOpen) {
	document.body.classList.toggle("menu-open", isOpen);
	menuToggle.setAttribute("aria-expanded", String(isOpen));
	menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
	drawer.setAttribute("aria-hidden", String(!isOpen));
	drawer.toggleAttribute("inert", !isOpen);

	if (isOpen) {
		menuClose.focus();
	} else {
		menuToggle.focus();
	}
}

menuToggle.addEventListener("click", () => {
	setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});
menuClose.addEventListener("click", () => setMenuOpen(false));
backdrop.addEventListener("click", () => setMenuOpen(false));
drawerLinks.forEach((link) => {
	link.addEventListener("click", () => {
		drawerLinks.forEach((item) => item.removeAttribute("aria-current"));
		link.setAttribute("aria-current", "page");
		setMenuOpen(false);
	});
});
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
		setMenuOpen(false);
	}
});

const date = new Date();
document.querySelector("#top-date").textContent = new Intl.DateTimeFormat("en", {
	weekday: "short",
	month: "short",
	day: "numeric"
}).format(date);
document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("en", {
	weekday: "long",
	month: "long",
	day: "numeric"
}).format(date).toUpperCase();

const activityForm = document.querySelector("#activity-form");
const activityList = document.querySelector("#activity-list");
const burnTotal = document.querySelector("#burn-total");
const goalFill = document.querySelector("#goal-fill");
const goalRing = document.querySelector("#goal-ring");
const goalPercent = document.querySelector("#goal-percent");
const goalRemaining = document.querySelector("#goal-remaining");
const goalProgress = document.querySelector(".goal-track");
let totalCalories = 684;

activityForm.addEventListener("submit", (event) => {
	event.preventDefault();
	if (!activityForm.reportValidity()) return;

	const selectedActivity = document.querySelector("#activity-type").selectedOptions[0];
	const activityName = selectedActivity.value;
	const met = Number(selectedActivity.dataset.met);
	const duration = Number(document.querySelector("#activity-duration").value);
	const weight = Number(document.querySelector("#body-weight").value);
	const calories = Math.round((met * 3.5 * weight / 200) * duration);
	const activityItem = document.createElement("li");
	const activityInitials = activityName.split(/\s+/).map((word) => word[0]).join("").slice(0, 3).toUpperCase();

	activityItem.className = "activity-item";
	activityItem.innerHTML = `<span class="activity-mark" aria-hidden="true">${activityInitials}</span><div><p class="activity-name"></p><p class="activity-meta"></p></div><span class="activity-calories"></span>`;
	activityItem.querySelector(".activity-name").textContent = activityName;
	activityItem.querySelector(".activity-meta").textContent = `${duration} min · just now`;
	activityItem.querySelector(".activity-calories").textContent = `${calories} kcal`;
	activityList.prepend(activityItem);

	totalCalories += calories;
	burnTotal.textContent = totalCalories.toLocaleString("en");

	const progress = Math.min(totalCalories / 950 * 100, 100);
	goalFill.style.width = `${progress}%`;
	goalRing.style.background = `conic-gradient(var(--lime) 0 ${progress}%, rgba(255, 255, 255, 0.17) ${progress}% 100%)`;
	goalPercent.textContent = `${Math.round(progress)}%`;
	goalRing.setAttribute("aria-label", `${Math.round(progress)} percent of daily goal`);
	goalRemaining.textContent = Math.max(950 - totalCalories, 0).toLocaleString("en");
	goalProgress.setAttribute("aria-valuenow", String(Math.min(totalCalories, 950)));
	activityForm.reset();
	document.querySelector("#body-weight").value = String(weight);
});
