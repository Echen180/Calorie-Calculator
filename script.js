const menuToggle = document.querySelector("#menu-toggle");
const menuClose = document.querySelector("#menu-close");
const drawer = document.querySelector("#site-drawer");
const backdrop = document.querySelector("#drawer-backdrop");
const drawerLinks = drawer.querySelectorAll(".drawer-nav a");
const overviewSections = document.querySelectorAll(
  "#overview > .page-heading, #overview > .overview-grid, #overview > .content-grid",
);
const mealsView = document.querySelector("#meals");
const longTermView = document.querySelector("#long-term-goal");
const profileView = document.querySelector("#profile");
const profileSetup = document.querySelector("#profile-setup");
const profileSetupForm = document.querySelector("#profile-setup-form");
const profileSetupNameInput = document.querySelector("#profile-setup-name");
const profileSetupCurrentWeightInput = document.querySelector("#profile-setup-current-weight");
const profileSetupGoalWeightInput = document.querySelector("#profile-setup-goal-weight");
const profileSetupTargetDateInput = document.querySelector("#profile-setup-target-date");
const profileSetupStatus = document.querySelector("#profile-setup-status");

function setWorkspaceView(view) {
  const showMeals = view === "meals";
  const showLongTermGoal = view === "long-term-goal";
  const showProfile = view === "profile";

  overviewSections.forEach((section) => {
    section.hidden = showMeals || showLongTermGoal || showProfile;
  });

  mealsView.hidden = !showMeals;
  longTermView.hidden = !showLongTermGoal;
  profileView.hidden = !showProfile;
}

const initialHash = window.location.hash;
const initialView =
  initialHash === "#meals"
    ? "meals"
    : initialHash === "#long-term-goal"
      ? "long-term-goal"
      : initialHash === "#profile"
        ? "profile"
        : "overview";

setWorkspaceView(initialView);

const initialNavLink = Array.from(drawerLinks).find(
  (link) => link.getAttribute("href") === initialHash,
);

if (initialNavLink) {
  drawerLinks.forEach((link) => link.removeAttribute("aria-current"));
  initialNavLink.setAttribute("aria-current", "page");
}

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
    const destination = link.getAttribute("href");
    const view =
      destination === "#meals"
        ? "meals"
        : destination === "#long-term-goal"
          ? "long-term-goal"
          : destination === "#profile"
            ? "profile"
            : "overview";

    setWorkspaceView(view);
    drawerLinks.forEach((item) => item.removeAttribute("aria-current"));
    link.setAttribute("aria-current", "page");
    setMenuOpen(false);
  });
});

document.querySelector("#profile-shortcut").addEventListener("click", () => {
  setWorkspaceView("profile");
  drawerLinks.forEach((link) => {
    link.toggleAttribute("aria-current", link.getAttribute("href") === "#profile");
  });
  window.location.hash = "profile";
});

document.querySelectorAll('a[href="#overview"]').forEach((link) => {
  link.addEventListener("click", () => setWorkspaceView("overview"));
});

const profileForm = document.querySelector("#profile-form");
const profileNameInput = document.querySelector("#profile-name");
const profileAvatar = document.querySelector("#profile-shortcut");
const profileSavedName = document.querySelector("#profile-saved-name");
const profileSaveStatus = document.querySelector("#profile-save-status");

function updateProfileName(name) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase();

  profileAvatar.textContent = initials || "?";
  profileAvatar.setAttribute("aria-label", name ? `Open ${name}'s profile` : "Open profile");
  profileSavedName.textContent = name;
  profileSavedName.hidden = !name;
}

const savedProfileName = localStorage.getItem("stride-profile-name")?.trim() ?? "";
const profileNameIsMissing = !savedProfileName;
profileSetup.hidden = !profileNameIsMissing;

if (profileNameIsMissing) {
  document.querySelector(".topbar").inert = true;
  drawer.inert = true;
  document.querySelector("#drawer-backdrop").inert = true;
  document.querySelector("#overview").inert = true;
  profileSetupNameInput.focus();
}

const todayForSetup = new Date();
profileSetupTargetDateInput.min = `${todayForSetup.getFullYear()}-${String(todayForSetup.getMonth() + 1).padStart(2, "0")}-${String(todayForSetup.getDate()).padStart(2, "0")}`;

if (savedProfileName) {
  profileNameInput.value = savedProfileName;
  updateProfileName(savedProfileName);
}

profileSetupGoalWeightInput.addEventListener("input", () => {
  profileSetupGoalWeightInput.setCustomValidity("");
});

profileSetupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  profileSetupNameInput.setCustomValidity("");
  profileSetupGoalWeightInput.setCustomValidity("");

  if (!profileSetupForm.reportValidity()) return;

  const name = profileSetupNameInput.value.trim();
  const currentWeight = Number(profileSetupCurrentWeightInput.value);
  const goalWeight = Number(profileSetupGoalWeightInput.value);

  if (!name) {
    profileSetupNameInput.setCustomValidity("Enter your name to start using the app.");
    profileSetupNameInput.reportValidity();
    return;
  }

  if (currentWeight === goalWeight) {
    profileSetupGoalWeightInput.setCustomValidity("Goal weight must be different from current weight.");
    profileSetupGoalWeightInput.reportValidity();
    return;
  }

  localStorage.setItem("stride-profile-name", name);
  longTermGoal = {
    startingWeight: currentWeight,
    currentWeight,
    goalWeight,
    targetDate: profileSetupTargetDateInput.value,
    weightChanges: [],
  };
  localStorage.setItem("stride-long-term-goal", JSON.stringify(longTermGoal));

  profileNameInput.value = name;
  updateProfileName(name);
  longTermCurrentWeightInput.value = String(currentWeight);
  longTermGoalWeightInput.value = String(goalWeight);
  longTermDateInput.value = profileSetupTargetDateInput.value;
  syncActivityWeight();
  updateLongTermGoal();

  profileSetup.hidden = true;
  document.querySelector(".topbar").inert = false;
  drawer.inert = true;
  document.querySelector("#drawer-backdrop").inert = false;
  document.querySelector("#overview").inert = false;
  profileSetupStatus.textContent = "";
  menuToggle.focus();
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  profileNameInput.setCustomValidity("");

  if (!profileForm.reportValidity()) return;

  const name = profileNameInput.value.trim();

  if (!name) {
    profileNameInput.setCustomValidity("Enter your name to save your profile.");
    profileNameInput.reportValidity();
    return;
  }

  localStorage.setItem("stride-profile-name", name);
  updateProfileName(name);
  profileSaveStatus.textContent = "Name saved on this device.";
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
  day: "numeric",
}).format(date);

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(date).toUpperCase();

const weekSelection = document.querySelector("#week-selection");
document.querySelectorAll(".chart-day").forEach((dayButton) => {
  dayButton.addEventListener("click", () => {
    document.querySelectorAll(".chart-day").forEach((button) => {
      button.setAttribute("aria-pressed", String(button === dayButton));
    });

    weekSelection.innerHTML = `<strong>${dayButton.dataset.day}</strong> · ${Number(dayButton.dataset.calories).toLocaleString("en")} kcal`;
  });
});

const activityForm = document.querySelector("#activity-form");
const activityList = document.querySelector("#activity-list");
const activityBodyWeightInput = document.querySelector("#body-weight");
const burnTotal = document.querySelector("#burn-total");
const goalFill = document.querySelector("#goal-fill");
const goalRing = document.querySelector("#goal-ring");
const goalPercent = document.querySelector("#goal-percent");
const goalRemaining = document.querySelector("#goal-remaining");
const goalMessage = document.querySelector("#goal-message");
const goalCaption = document.querySelector(".goal-caption");
const goalProgress = document.querySelector(".goal-track");
const goalForm = document.querySelector("#goal-form");
const goalInput = document.querySelector("#goal-input");
const goalTarget = document.querySelector("#goal-target");
const savedGoal = Number(localStorage.getItem("stride-daily-calorie-goal"));
let dailyGoal = savedGoal >= 100 && savedGoal <= 10000 ? savedGoal : 950;
let totalCalories = 684;

goalInput.value = String(dailyGoal);

function updateGoalProgress() {
  const progress = Math.min((totalCalories / dailyGoal) * 100, 100);
  const overGoal = totalCalories > dailyGoal;
  const goalDifference = overGoal ? totalCalories - dailyGoal : dailyGoal - totalCalories;
  const progressColor = overGoal ? "var(--over-goal)" : "var(--lime)";

  goalFill.style.width = `${progress}%`;
  goalFill.style.background = progressColor;
  goalRing.style.background = `conic-gradient(${progressColor} 0 ${progress}%, rgba(255, 255, 255, 0.17) ${progress}% 100%)`;
  goalRing.classList.toggle("over-goal", overGoal);
  burnTotal.classList.toggle("over-goal", overGoal);
  goalCaption.classList.toggle("over-goal", overGoal);
  goalPercent.textContent = `${Math.round(progress)}%`;
  goalRing.setAttribute("aria-label", `${Math.round(progress)} percent of daily goal`);
  goalRemaining.textContent = goalDifference.toLocaleString("en");
  goalMessage.textContent = overGoal ? "kcal over your" : "kcal to your";
  goalTarget.textContent = dailyGoal.toLocaleString("en");
  goalProgress.setAttribute("aria-valuemax", String(dailyGoal));
  goalProgress.setAttribute("aria-valuenow", String(Math.min(totalCalories, dailyGoal)));
}

updateGoalProgress();

goalForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!goalForm.reportValidity()) return;

  dailyGoal = Number(goalInput.value);
  localStorage.setItem("stride-daily-calorie-goal", String(dailyGoal));
  updateGoalProgress();
});

activityList.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".activity-remove");

  if (!removeButton) return;

  const activityItem = removeButton.closest(".activity-item");
  const nextFocusTarget =
    activityItem.nextElementSibling?.querySelector(".activity-remove") ??
    activityItem.previousElementSibling?.querySelector(".activity-remove");

  totalCalories = Math.max(totalCalories - Number(activityItem.dataset.calories), 0);
  activityItem.remove();
  burnTotal.textContent = totalCalories.toLocaleString("en");
  updateGoalProgress();
  (nextFocusTarget ?? activityList).focus();
});

const longTermForm = document.querySelector("#long-term-form");
const longTermCurrentWeightInput = document.querySelector("#long-term-current-weight");
const longTermGoalWeightInput = document.querySelector("#long-term-goal-weight");
const longTermDateInput = document.querySelector("#long-term-date");
const longTermEmpty = document.querySelector("#long-term-empty");
const longTermSummary = document.querySelector("#long-term-summary");
const longTermDescription = document.querySelector("#long-term-description");
const longTermPercent = document.querySelector("#long-term-percent");
const longTermTrack = document.querySelector("#long-term-track");
const longTermFill = document.querySelector("#long-term-fill");
const longTermProgressLabel = document.querySelector("#long-term-progress-label");
const longTermPace = document.querySelector("#long-term-pace");
const paceWarning = document.querySelector("#pace-warning");
const weightLogSection = document.querySelector("#weight-log-section");
const weightChangeForm = document.querySelector("#weight-log-form");
const weightChangeDirection = document.querySelector("#weight-change-direction");
const weightChangeAmount = document.querySelector("#weight-change-amount");
const weightLogList = document.querySelector("#weight-log-list");
let longTermGoal = null;

function syncActivityWeight() {
  if (!longTermGoal) return;

  const weightLb = longTermGoal.currentWeight;

  if (weightLb >= Number(activityBodyWeightInput.min) && weightLb <= Number(activityBodyWeightInput.max)) {
    activityBodyWeightInput.value = weightLb.toFixed(1);
  }
}

try {
  const savedLongTermGoal = JSON.parse(localStorage.getItem("stride-long-term-goal"));

  if (
    savedLongTermGoal &&
    savedLongTermGoal.startingWeight > 0 &&
    savedLongTermGoal.currentWeight > 0 &&
    savedLongTermGoal.goalWeight > 0 &&
    savedLongTermGoal.targetDate
  ) {
    longTermGoal = {
      ...savedLongTermGoal,
      weightChanges: Array.isArray(savedLongTermGoal.weightChanges)
        ? savedLongTermGoal.weightChanges
        : [],
    };
  }
} catch {
  localStorage.removeItem("stride-long-term-goal");
}

function updateLongTermGoal() {
  if (!longTermGoal) {
    longTermEmpty.hidden = false;
    longTermSummary.hidden = true;
    weightLogSection.hidden = true;
    return;
  }

  const targetChange = longTermGoal.goalWeight - longTermGoal.startingWeight;
  const currentChange = longTermGoal.currentWeight - longTermGoal.startingWeight;
  const completion = Math.min(Math.max((currentChange / targetChange) * 100, 0), 100);
  const targetDate = new Date(`${longTermGoal.targetDate}T00:00:00`);
  const targetDateLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / 86400000);
  const weeklyPace =
    Math.abs(longTermGoal.goalWeight - longTermGoal.currentWeight) /
    Math.max(daysRemaining / 7, 1 / 7);
  const currentWeight = longTermGoal.currentWeight.toLocaleString("en");
  const goalWeight = longTermGoal.goalWeight.toLocaleString("en");
  const movedTowardGoal = currentChange * Math.sign(targetChange) >= 0;
  const changeSinceStart = Math.abs(currentChange).toLocaleString("en");
  const weightDirection = longTermGoal.currentWeight > longTermGoal.goalWeight ? "lose" : "gain";
  const goalReached = completion >= 100;

  longTermEmpty.hidden = true;
  longTermSummary.hidden = false;
  weightLogSection.hidden = false;
  longTermDescription.textContent = `From ${longTermGoal.startingWeight.toLocaleString("en")} lb to ${goalWeight} lb by ${targetDateLabel}`;
  longTermPercent.textContent = `${Math.round(completion)}%`;
  longTermFill.style.width = `${completion}%`;
  longTermProgressLabel.textContent = goalReached
    ? `Goal reached · Current weight ${currentWeight} lb · Goal ${goalWeight} lb`
    : `Current weight ${currentWeight} lb · Goal ${goalWeight} lb · ${changeSinceStart} lb ${movedTowardGoal ? "toward" : "away from"} goal`;
  longTermTrack.setAttribute("aria-valuenow", String(Math.round(completion)));
  longTermPace.textContent =
    daysRemaining < 0
      ? "Target date passed. Update your date or goal weight."
      : `To ${weightDirection} ${Math.abs(longTermGoal.goalWeight - longTermGoal.currentWeight).toLocaleString("en")} lb by ${targetDateLabel}: about ${weeklyPace.toFixed(1)} lb per week`;

  const rapidWeightLoss = weightDirection === "lose" && daysRemaining >= 0 && weeklyPace > 2;
  paceWarning.hidden = !rapidWeightLoss;

  if (rapidWeightLoss) {
    paceWarning.textContent = `This target averages ${weeklyPace.toFixed(1)} lb of loss per week, faster than the commonly recommended gradual pace of 1–2 lb per week. Consider a slower target or discuss your plan with a healthcare professional.`;
  }

  renderWeightHistory();
}

function renderWeightHistory() {
  weightLogList.replaceChildren();

  if (!longTermGoal.weightChanges.length) {
    const emptyEntry = document.createElement("li");
    emptyEntry.className = "meal-empty";
    emptyEntry.textContent = "No weight changes logged yet.";
    weightLogList.append(emptyEntry);
    return;
  }

  longTermGoal.weightChanges.forEach((change) => {
    const entry = document.createElement("li");
    const description = document.createElement("strong");
    const date = document.createElement("span");
    const entryDate = new Date(`${change.date}T00:00:00`);

    entry.className = "weight-log-entry";
    description.textContent = `${change.direction === "lost" ? "Lost" : "Gained"} ${Number(change.pounds).toLocaleString("en")} lb`;
    date.textContent = new Intl.DateTimeFormat("en", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(entryDate);

    entry.append(description, date);
    weightLogList.append(entry);
  });
}

if (longTermGoal) {
  longTermCurrentWeightInput.value = String(longTermGoal.currentWeight);
  longTermGoalWeightInput.value = String(longTermGoal.goalWeight);
  longTermDateInput.value = longTermGoal.targetDate;
  syncActivityWeight();
}

updateLongTermGoal();

longTermForm.addEventListener("submit", (event) => {
  event.preventDefault();
  longTermGoalWeightInput.setCustomValidity("");

  if (!longTermForm.reportValidity()) return;

  const currentWeight = Number(longTermCurrentWeightInput.value);
  const goalWeight = Number(longTermGoalWeightInput.value);

  if (currentWeight === goalWeight) {
    longTermGoalWeightInput.setCustomValidity("Goal weight must be different from current weight.");
    longTermGoalWeightInput.reportValidity();
    return;
  }

  longTermGoal = {
    startingWeight: longTermGoal?.startingWeight ?? currentWeight,
    currentWeight,
    goalWeight,
    targetDate: longTermDateInput.value,
    weightChanges: longTermGoal?.weightChanges ?? [],
  };
  localStorage.setItem("stride-long-term-goal", JSON.stringify(longTermGoal));
  syncActivityWeight();
  updateLongTermGoal();
});

weightChangeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  weightChangeAmount.setCustomValidity("");

  if (!weightChangeForm.reportValidity()) return;

  const direction = weightChangeDirection.value;
  const pounds = Number(weightChangeAmount.value);
  const updatedWeight = Number(
    (longTermGoal.currentWeight + (direction === "lost" ? -pounds : pounds)).toFixed(1),
  );

  if (updatedWeight <= 0 || updatedWeight > 1000) {
    weightChangeAmount.setCustomValidity("This change would put current weight outside the supported range.");
    weightChangeAmount.reportValidity();
    return;
  }

  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  longTermGoal.currentWeight = updatedWeight;
  longTermGoal.weightChanges.unshift({ direction, pounds, date });
  longTermCurrentWeightInput.value = String(updatedWeight);
  syncActivityWeight();
  localStorage.setItem("stride-long-term-goal", JSON.stringify(longTermGoal));
  updateLongTermGoal();
  weightChangeForm.reset();
});

activityForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!activityForm.reportValidity()) return;

  const selectedActivity = document.querySelector("#activity-type").selectedOptions[0];
  const activityName = selectedActivity.value;
  const met = Number(selectedActivity.dataset.met);
  const duration = Number(document.querySelector("#activity-duration").value);
  const weightLb = Number(activityBodyWeightInput.value);
  const weightKg = weightLb * 0.45359237;
  const calories = Math.round(((met * 3.5 * weightKg) / 200) * duration);
  const activityItem = document.createElement("li");
  const removeButton = document.createElement("button");
  const activityInitials = activityName
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  activityItem.className = "activity-item";
  activityItem.dataset.calories = String(calories);
  activityItem.innerHTML = `
    <span class="activity-mark" aria-hidden="true">${activityInitials}</span>
    <div>
      <p class="activity-name"></p>
      <p class="activity-meta"></p>
    </div>
    <span class="activity-calories"></span>
  `;
  activityItem.querySelector(".activity-name").textContent = activityName;
  activityItem.querySelector(".activity-meta").textContent = `${duration} min · just now`;
  activityItem.querySelector(".activity-calories").textContent = `${calories} kcal`;

  removeButton.className = "activity-remove";
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", `Remove ${activityName}`);
  removeButton.textContent = "×";
  activityItem.append(removeButton);
  activityList.prepend(activityItem);

  totalCalories += calories;
  burnTotal.textContent = totalCalories.toLocaleString("en");
  updateGoalProgress();
  activityForm.reset();
  activityBodyWeightInput.value = String(weightLb);
});

const mealForm = document.querySelector("#meal-form");
const mealList = document.querySelector("#meal-list");
const mealCategorySelect = document.querySelector("#meal-category");
const mealCategoryButtons = document.querySelectorAll(".meal-category");
const mealSuggestions = document.querySelectorAll(".meal-suggestion");
let activeMealCategory = "cutting";

function setMealCategory(category) {
  activeMealCategory = category;

  mealCategoryButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.category === category));
  });

  mealSuggestions.forEach((suggestion) => {
    suggestion.hidden = suggestion.dataset.category !== category;
  });

  mealCategorySelect.value = category;
}

mealCategoryButtons.forEach((button) => {
  button.addEventListener("click", () => setMealCategory(button.dataset.category));
});

mealCategorySelect.addEventListener("change", () => setMealCategory(mealCategorySelect.value));

mealSuggestions.forEach((suggestion) => {
  suggestion.addEventListener("click", () => {
    setMealCategory(suggestion.dataset.category);
    document.querySelector("#meal-name").value = suggestion.dataset.meal;
    document.querySelector("#meal-calories").value = suggestion.dataset.calories;
    document.querySelector("#meal-servings").focus();
  });
});

mealForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!mealForm.reportValidity()) return;

  const mealName = document.querySelector("#meal-name").value.trim();
  const category = mealCategorySelect.value;
  const servings = Number(document.querySelector("#meal-servings").value);
  const caloriesPerServing = Number(document.querySelector("#meal-calories").value);
  const totalMealCalories = Math.round(servings * caloriesPerServing);
  const entry = document.createElement("li");
  const name = document.createElement("strong");
  const details = document.createElement("p");

  name.className = "meal-entry-name";
  name.textContent = mealName;
  details.className = "meal-entry-meta";
  details.textContent = `${category[0].toUpperCase()}${category.slice(1)} · ${servings.toLocaleString("en")} servings · ${caloriesPerServing.toLocaleString("en")} kcal per serving · ${totalMealCalories.toLocaleString("en")} kcal batch`;

  entry.append(name, details);
  document.querySelector("#meal-empty")?.remove();
  mealList.prepend(entry);
  mealForm.reset();
  mealCategorySelect.value = activeMealCategory;
});
