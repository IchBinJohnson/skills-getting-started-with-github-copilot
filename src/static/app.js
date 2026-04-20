document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const defaultActivityOption = '<option value="">-- Select an activity --</option>';

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  function createActivityCard(name, details) {
    const activityCard = document.createElement("div");
    activityCard.className = "activity-card";

    const title = document.createElement("h4");
    title.textContent = name;

    const description = document.createElement("p");
    description.className = "activity-description";
    description.textContent = details.description;

    const schedule = document.createElement("p");
    schedule.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

    const spotsLeft = details.max_participants - details.participants.length;
    const availability = document.createElement("p");
    availability.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

    const participantsSection = document.createElement("div");
    participantsSection.className = "participants-section";

    const participantsHeading = document.createElement("p");
    participantsHeading.className = "participants-heading";
    participantsHeading.textContent = "Participants";

    const participantsList = document.createElement("ul");
    participantsList.className = "participants-list";

    details.participants.forEach((participant) => {
      const participantItem = document.createElement("li");
      participantItem.className = "participant-item";

      const participantEmail = document.createElement("span");
      participantEmail.className = "participant-email";
      participantEmail.textContent = participant;

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "participant-remove-button";
      removeButton.dataset.activityName = name;
      removeButton.dataset.participantEmail = participant;
      removeButton.setAttribute("aria-label", `Remove ${participant} from ${name}`);
      removeButton.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v8h-2V9zm4 0h2v8h-2V9zM7 9h2v8H7V9zm1 11h8a2 2 0 0 0 2-2V8H6v10a2 2 0 0 0 2 2z"></path>
        </svg>
      `;

      participantItem.appendChild(participantEmail);
      participantItem.appendChild(removeButton);
      participantsList.appendChild(participantItem);
    });

    participantsSection.appendChild(participantsHeading);
    participantsSection.appendChild(participantsList);

    activityCard.appendChild(title);
    activityCard.appendChild(description);
    activityCard.appendChild(schedule);
    activityCard.appendChild(availability);
    activityCard.appendChild(participantsSection);

    return activityCard;
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load activities.");
      }

      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = defaultActivityOption;

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        activitiesList.appendChild(createActivityCard(name, details));

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  activitiesList.addEventListener("click", async (event) => {
    const removeButton = event.target.closest(".participant-remove-button");

    if (!removeButton) {
      return;
    }

    const { activityName, participantEmail } = removeButton.dataset;

    removeButton.disabled = true;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(participantEmail)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Unable to remove participant.");
      }

      showMessage(result.message, "success");
      await fetchActivities();
    } catch (error) {
      showMessage(error.message || "Unable to remove participant.", "error");
      removeButton.disabled = false;
    }
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        await fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
