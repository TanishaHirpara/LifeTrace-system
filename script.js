let memories = JSON.parse(localStorage.getItem("lifetraceMemories")) || [];

const memoryForm = document.getElementById("memoryForm");
const timeline = document.getElementById("timeline");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("filterCategory");
const relatedSelect = document.getElementById("related");

function saveMemories() {
    localStorage.setItem("lifetraceMemories", JSON.stringify(memories));
}

function updateRelatedOptions() {
    relatedSelect.innerHTML = '<option value="">No related memory</option>';

    memories.forEach(function(memory) {
        let option = document.createElement("option");
        option.value = memory.id;
        option.textContent = memory.title;
        relatedSelect.appendChild(option);
    });
}

function updateStats() {
    document.getElementById("memoryCount").textContent = memories.length;

    let importantMemories = memories.filter(function(memory) {
        return memory.important;
    });

    let categories = [];

    memories.forEach(function(memory) {
        if (!categories.includes(memory.category)) {
            categories.push(memory.category);
        }
    });

    document.getElementById("importantCount").textContent = importantMemories.length;
    document.getElementById("categoryCount").textContent = categories.length;
}

function showMemories() {
    timeline.innerHTML = "";

    let searchText = searchInput.value.toLowerCase();
    let selectedCategory = categoryFilter.value;

    let results = memories.filter(function(memory) {
        let searchableText = [
            memory.title,
            memory.description,
            memory.category,
            memory.people,
            memory.location,
            memory.tags
        ].join(" ").toLowerCase();

        let matchesSearch = searchableText.includes(searchText);
        let matchesCategory = selectedCategory === "" ||
            memory.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    results.sort(function(a, b) {
        return b.date.localeCompare(a.date);
    });

    document.getElementById("shownCount").textContent =
        results.length + (results.length === 1 ? " entry" : " entries");

    updateStats();

    if (results.length === 0) {
        timeline.innerHTML =
            '<div class="empty-state">No memories found. Try another search or add a memory.</div>';
        return;
    }

    results.forEach(function(memory) {
        let card = document.createElement("article");
        card.className = "memory";

        let top = document.createElement("div");
        top.className = "memory-top";

        let titleArea = document.createElement("div");
        let title = document.createElement("h3");
        title.textContent = memory.title;

        let date = document.createElement("p");
        date.className = "memory-date";
        date.textContent = formatDate(memory.date);

        titleArea.appendChild(title);
        titleArea.appendChild(date);

        let category = document.createElement("span");
        category.className = "category-pill";
        category.textContent = memory.category;

        top.appendChild(titleArea);
        top.appendChild(category);
        card.appendChild(top);

        if (memory.important) {
            let important = document.createElement("p");
            important.className = "important-label";
            important.textContent = "★ Important memory";
            card.appendChild(important);
        }

        let description = document.createElement("p");
        description.className = "memory-description";
        description.textContent = memory.description || "No description added.";
        card.appendChild(description);

        let details = document.createElement("p");
        details.className = "memory-details";
        details.textContent =
            "People: " + (memory.people || "Not added") +
            " · Place: " + (memory.location || "Not added");
        card.appendChild(details);

        if (memory.tags) {
            let tags = document.createElement("p");
            tags.className = "memory-tags";
            tags.textContent = "Tags: " + memory.tags;
            card.appendChild(tags);
        }

        if (memory.relatedId) {
            let relatedMemory = memories.find(function(item) {
                return String(item.id) === String(memory.relatedId);
            });

            if (relatedMemory) {
                let related = document.createElement("p");
                related.className = "related-memory";
                related.textContent = "↳ Related to: " + relatedMemory.title;
                card.appendChild(related);
            }
        }

        let deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete memory";
        deleteButton.addEventListener("click", function() {
            deleteMemory(memory.id);
        });
        card.appendChild(deleteButton);

        timeline.appendChild(card);
    });
}

function formatDate(dateText) {
    if (!dateText) {
        return "Date not set";
    }

    let date = new Date(dateText + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function deleteMemory(id) {
    memories = memories.filter(function(memory) {
        return memory.id !== id;
    });

    saveMemories();
    updateRelatedOptions();
    showMemories();
}

memoryForm.addEventListener("submit", function(event) {
    event.preventDefault();

    let memory = {
        id: Date.now(),
        title: document.getElementById("title").value.trim(),
        date: document.getElementById("date").value,
        category: document.getElementById("category").value,
        description: document.getElementById("description").value.trim(),
        people: document.getElementById("people").value.trim(),
        location: document.getElementById("location").value.trim(),
        tags: document.getElementById("tags").value.trim(),
        relatedId: relatedSelect.value,
        important: document.getElementById("important").checked
    };

    memories.push(memory);
    saveMemories();
    updateRelatedOptions();
    showMemories();

    memoryForm.reset();
    document.getElementById("formMessage").textContent = "Memory saved!";
    document.getElementById("date").value = "";
});

searchInput.addEventListener("input", showMemories);
categoryFilter.addEventListener("change", showMemories);

updateRelatedOptions();
showMemories();
