// Enhanced game logic for Crystal Cove
const state = {
    day: 1,
    health: 100,
    water: 0,
    waterGoal: 8,
    alcohol: 0,
    alcoholLimit: 6,
    steps: 0,
    stepsGoal: 10000,
    sleep: 0,
    sleepGoal: 7,
    meals: 0,
    mood: null,
    storyIndex: 0,
    daysSurvived: 0,
    guide: null
};

const storyChapters = [
    {
        label: 'CHAPTER 1',
        title: 'Awakening in Darkness',
        content: [
            "Your eyes flutter open to an otherworldly glow. Luminescent crystals pulse with soft light along the cavern walls, casting dancing shadows across ancient stone.",
            "As your vision clears, you realize the terrible truth: you don't remember how you got here. The last thing you recall is... nothing. Just darkness.",
            "A shimmer of light catches your attention as two ethereal beings materialize before you—Astra and Nox. They warn that the cave feeds on neglect; your survival depends on your daily choices."
        ]
    },
    {
        label: 'CHAPTER 2',
        title: 'Rituals of Survival',
        content: [
            "The fairies lead you deeper where ancient runes glow. Each rune represents a ritual—hydration, movement, rest. The more you honor them, the brighter the chamber glows.",
            "You feel your strength returning with every completed quest. Astra nods approvingly while Nox sharpens your resolve when motivation fades."
        ]
    },
    {
        label: 'CHAPTER 3',
        title: 'Toward the Crystal Gate',
        content: [
            "A distant rumble echoes through the cave. The Crystal Gate responds to your progress, opening only when your life force remains strong.",
            "Stay vigilant—each day of care weakens the cave's hold, bringing you closer to escape." 
        ]
    }
];

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.game-section');

    navButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;
            navButtons.forEach((b) => b.classList.remove('active'));
            sections.forEach((sec) => sec.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

function updateWaterUI() {
    const percent = (state.water / state.waterGoal) * 100;
    document.getElementById('waterProgress').style.width = `${clamp(percent, 0, 100)}%`;
    document.getElementById('waterText').textContent = `${state.water}/${state.waterGoal} glasses`;
}

function updateAlcoholUI() {
    const percent = (state.alcohol / state.alcoholLimit) * 100;
    const progressEl = document.getElementById('alcoholProgress');
    progressEl.style.width = `${clamp(percent, 0, 100)}%`;
    progressEl.classList.toggle('danger', state.alcohol > state.alcoholLimit);

    const overLimit = state.alcohol > state.alcoholLimit ? ' (over limit!)' : '';
    document.getElementById('alcoholText').textContent = `${state.alcohol}/${state.alcoholLimit} drinks${overLimit}`;
}

function updateStepsUI() {
    const percent = (state.steps / state.stepsGoal) * 100;
    document.getElementById('stepsProgress').style.width = `${clamp(percent, 0, 100)}%`;
    document.getElementById('stepsText').textContent = `${state.steps.toLocaleString()}/${state.stepsGoal.toLocaleString()} steps`;
}

function updateSleepUI() {
    const percent = (state.sleep / state.sleepGoal) * 100;
    document.getElementById('sleepProgress').style.width = `${clamp(percent, 0, 100)}%`;
    document.getElementById('sleepText').textContent = `${state.sleep}/${state.sleepGoal} hours`;
}

function updateMealsUI() {
    document.getElementById('mealText').textContent = `${state.meals}/3 healthy meals`;
}

function adjustQuest(type, delta) {
    if (type === 'water') {
        state.water = clamp(state.water + delta, 0, state.waterGoal);
        updateWaterUI();
    }

    if (type === 'alcohol') {
        state.alcohol = clamp(state.alcohol + delta, 0, 12);
        updateAlcoholUI();
    }

    refreshDailySummary();
}

function setAlcoholLimit() {
    const input = document.getElementById('alcoholLimitInput');
    const value = parseInt(input.value, 10);

    if (Number.isNaN(value)) return;

    state.alcoholLimit = clamp(value, 0, 12);
    input.value = state.alcoholLimit;
    if (state.alcohol > state.alcoholLimit) {
        state.alcohol = state.alcoholLimit;
    }
    updateAlcoholUI();
    refreshDailySummary();
}

function updateSteps() {
    const value = parseInt(document.getElementById('stepsInput').value, 10);
    if (Number.isNaN(value)) return;
    state.steps = clamp(value, 0, 50000);
    document.getElementById('stepsInput').value = '';
    updateStepsUI();
    refreshDailySummary();
}

function updateSleep() {
    const value = parseFloat(document.getElementById('sleepInput').value);
    if (Number.isNaN(value)) return;
    state.sleep = clamp(value, 0, 24);
    document.getElementById('sleepInput').value = '';
    updateSleepUI();
    refreshDailySummary();
}

function updateMeals() {
    const checks = ['breakfast', 'lunch', 'dinner'];
    state.meals = checks.reduce((total, id) => total + (document.getElementById(id).checked ? 1 : 0), 0);
    updateMealsUI();
    refreshDailySummary();
}

function setMood(level) {
    state.mood = level;
    const labels = {
        1: 'Rough',
        2: 'Low',
        3: 'Neutral',
        4: 'Upbeat',
        5: 'Energized'
    };
    document.getElementById('moodLabel').textContent = `Mood: ${labels[level]}`;
    document.querySelectorAll('.mood-btn').forEach((btn) => {
        btn.classList.toggle('active', parseInt(btn.dataset.mood, 10) === level);
    });
}

function togglePriority(num) {
    const input = document.getElementById(`priority${num}`);
    input.classList.toggle('completed');
}

function refreshDailySummary() {
    const criticalComplete = Number(state.water >= state.waterGoal) + Number(state.alcohol <= state.alcoholLimit);
    const importantComplete = Number(state.steps >= state.stepsGoal) + Number(state.sleep >= state.sleepGoal);
    const bonusComplete = Number(state.meals === 3) + Number(Boolean(state.mood));

    document.querySelector('#criticalStat .stat-value').textContent = `${criticalComplete}/2`;
    document.querySelector('#importantStat .stat-value').textContent = `${importantComplete}/2`;
    document.querySelector('#bonusStat .stat-value').textContent = `${bonusComplete}/2`;

    const completionScore = criticalComplete * 40 + importantComplete * 20 + bonusComplete * 10;
    const healthChange = completionScore >= 60 ? 5 : completionScore >= 40 ? 0 : -10;
    state.projectedHealth = clamp(state.health + healthChange, 0, 100);
    updateHealthUI();
}

function updateHealthUI() {
    const fill = document.getElementById('healthFill');
    const valueLabel = document.getElementById('healthValue');
    const warning = document.getElementById('dangerWarning');
    const healthPercent = state.projectedHealth ?? state.health;

    fill.style.width = `${healthPercent}%`;
    fill.classList.toggle('danger', healthPercent < 40);
    valueLabel.textContent = `${healthPercent}%`;
    valueLabel.classList.toggle('danger', healthPercent < 40);
    warning.classList.toggle('hidden', healthPercent >= 40);
}

function endDay() {
    const criticalComplete = Number(state.water >= state.waterGoal) + Number(state.alcohol <= state.alcoholLimit);
    const importantComplete = Number(state.steps >= state.stepsGoal) + Number(state.sleep >= state.sleepGoal);
    const bonusComplete = Number(state.meals === 3) + Number(Boolean(state.mood));
    const completionScore = criticalComplete * 40 + importantComplete * 20 + bonusComplete * 10;

    const healthChange = completionScore >= 60 ? 5 : completionScore >= 40 ? 0 : -10;
    state.health = clamp(state.health + healthChange, 0, 100);
    state.daysSurvived += 1;
    state.day += 1;

    document.getElementById('dayCounter').textContent = state.day;
    document.getElementById('daysSurvived').textContent = state.daysSurvived;
    document.getElementById('healthValue').textContent = `${state.health}%`;
    document.getElementById('healthFill').style.width = `${state.health}%`;

    advanceStory();
    resetDailyLogs();
    refreshDailySummary();
}

function resetDailyLogs() {
    state.water = 0;
    state.alcohol = 0;
    state.steps = 0;
    state.sleep = 0;
    state.meals = 0;
    state.mood = null;

    document.querySelectorAll('.priority-input').forEach((input) => input.classList.remove('completed'));
    document.querySelectorAll('.quest-input').forEach((input) => input.value = '');
    ['breakfast', 'lunch', 'dinner'].forEach((id) => (document.getElementById(id).checked = false));
    document.getElementById('moodLabel').textContent = 'How are you feeling?';
    document.querySelectorAll('.mood-btn').forEach((btn) => btn.classList.remove('active'));

    updateWaterUI();
    updateAlcoholUI();
    updateStepsUI();
    updateSleepUI();
    updateMealsUI();
}

function advanceStory() {
    state.storyIndex = Math.min(state.storyIndex + 1, storyChapters.length - 1);
    renderStory();
}

function makeChoice(choice) {
    state.guide = choice;
    document.getElementById('choicesContainer').classList.add('hidden');
    renderStory();
}

function renderStory() {
    const chapter = storyChapters[state.storyIndex];
    document.getElementById('chapterLabel').textContent = chapter.label;
    document.getElementById('storyTitle').textContent = chapter.title;
    document.getElementById('storyHealth').textContent = `${state.health}%`;

    const storyContent = document.getElementById('storyContent');
    storyContent.innerHTML = '';
    chapter.content.forEach((paragraph) => {
        const p = document.createElement('p');
        p.className = 'story-text';
        p.textContent = paragraph;
        storyContent.appendChild(p);
    });

    const message = document.getElementById('dailyMessage');
    if (state.guide === 'astra') {
        message.querySelector('.message-text').textContent = 'Astra whispers: Protect your rituals and the cave will yield.';
    } else if (state.guide === 'nox') {
        message.querySelector('.message-text').textContent = 'Nox remarks: Adapt when the cave shifts. Your instincts matter most.';
    } else if (state.guide === 'neutral') {
        message.querySelector('.message-text').textContent = 'Both guides nod—balance light and shadow to find your own way.';
    } else {
        message.querySelector('.message-text').textContent = 'Complete your critical quests to receive today\'s guidance...';
    }
}

function init() {
    initNavigation();
    updateWaterUI();
    updateAlcoholUI();
    updateStepsUI();
    updateSleepUI();
    updateMealsUI();
    refreshDailySummary();
    renderStory();
    document.getElementById('alcoholLimitInput').value = state.alcoholLimit;
}

document.addEventListener('DOMContentLoaded', init);
