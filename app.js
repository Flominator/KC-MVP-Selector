// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCnjwzIOIkq8eJquf2MBbktyxw3jpjEPtc",
    authDomain: "kc-mvp-selector.firebaseapp.com",
    projectId: "kc-mvp-selector",
    storageBucket: "kc-mvp-selector.firebasestorage.app",
    messagingSenderId: "212133638001",
    appId: "1:212133638001:web:0c6e6a45c847f848ffd0d0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// SVG Icons
const Icons = {
    Users: () => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    Award: () => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>',
    Crown: () => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>',
    Trophy: () => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>',
    Plus: () => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    Trash2: () => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
    X: () => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    LogOut: () => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>'
};

// App State
let state = {
    user: null,
    members: [],
    events: [],
    mvpHistory: [],
    titleHistory: [],
    selectedEvent: '',
    isCS: false,
    isTitles: false,
    isManualMVP: false,
    selectedTitle: 'Earl',
    selectedMemberForTitle: '',
    selectedMemberForManual: '',
    showAdminModal: false,
    showEventModal: false,
    showRenameModal: false,
    newMemberName: '',
    newEventName: '',
    renameMemberOld: '',
    renameMemberNew: '',
    loading: true,
    loginEmail: '',
    loginPassword: ''
};

const defaultWeight = 10;
const penaltyWeight = 1;
const penaltyMultiplier = 0.5;

// Firebase Helper Functions
async function loadDataFromFirebase() {
    try {
        const userId = auth.currentUser.uid;
        
        const membersDoc = await db.collection('users').doc(userId).collection('data').doc('members').get();
        if (membersDoc.exists) {
            state.members = membersDoc.data().list || [];
        }

        const mvpDoc = await db.collection('users').doc(userId).collection('data').doc('mvpHistory').get();
        if (mvpDoc.exists) {
            state.mvpHistory = mvpDoc.data().list || [];
        }

        const titleDoc = await db.collection('users').doc(userId).collection('data').doc('titleHistory').get();
        if (titleDoc.exists) {
            state.titleHistory = titleDoc.data().list || [];
        }

        const eventsDoc = await db.collection('users').doc(userId).collection('data').doc('events').get();
        if (eventsDoc.exists) {
            state.events = eventsDoc.data().list || [];
        } else {
            state.events = ['Bandit Attack', 'Battle Royale', 'Kingdom War', 'Territory War', 'Alliance War'];
            await saveToFirebase('events', state.events);
        }

        state.loading = false;
        render();
    } catch (error) {
        console.error('Error loading data:', error);
        state.loading = false;
        render();
    }
}

async function saveToFirebase(docName, data) {
    try {
        const userId = auth.currentUser.uid;
        await db.collection('users').doc(userId).collection('data').doc(docName).set({ list: data });
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data. Please try again.');
    }
}

// Auth Functions
function handleLogin(e) {
    e.preventDefault();
    state.loading = true;
    render();

    auth.signInWithEmailAndPassword(state.loginEmail, state.loginPassword)
        .catch((error) => {
            state.loading = false;
            alert('Login failed: ' + error.message);
            render();
        });
}

function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        auth.signOut();
    }
}

// Business Logic Functions
function getEligibleMembers() {
    return state.members.filter(m => m.eligible);
}

function getMVPCount(memberName) {
    const recentLimit = state.members.length;
    const recentMVPs = state.mvpHistory.slice(-recentLimit);
    return recentMVPs.filter(h => h.member === memberName).length;
}

function calculatePenaltyWeight(mvpCount) {
    if (mvpCount === 0) return defaultWeight;
    const calculatedPenalty = penaltyWeight * Math.pow(penaltyMultiplier, mvpCount);
    return Math.max(0.1, calculatedPenalty);
}

function addMember() {
    const name = state.newMemberName.trim();
    if (!name) {
        alert('Please enter a member name.');
        return;
    }
    if (state.members.find(m => m.name === name)) {
        alert('Member already exists.');
        return;
    }
    state.members.push({ name: name, eligible: true });
    state.newMemberName = '';
    saveToFirebase('members', state.members);
    render();
}

function removeMember(name) {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
        state.members = state.members.filter(m => m.name !== name);
        saveToFirebase('members', state.members);
        render();
    }
}

function toggleEligibility(name) {
    state.members = state.members.map(m => 
        m.name === name ? { ...m, eligible: !m.eligible } : m
    );
    saveToFirebase('members', state.members);
    render();
}

function selectAllMembers() {
    state.members = state.members.map(m => ({ ...m, eligible: true }));
    saveToFirebase('members', state.members);
    render();
}

function deselectAllMembers() {
    state.members = state.members.map(m => ({ ...m, eligible: false }));
    saveToFirebase('members', state.members);
    render();
}

function addEvent() {
    const name = state.newEventName.trim();
    console.log('addEvent called with:', name);
    if (!name) {
        alert('Please enter an event name.');
        return;
    }
    if (state.events.find(e => e === name)) {
        alert('Event already exists.');
        return;
    }
    state.events.push(name);
    state.events.sort();
    state.newEventName = '';
    saveToFirebase('events', state.events);
    render();
}

function removeEvent(name) {
    console.log('removeEvent called with:', name);
    if (confirm(`Are you sure you want to remove event "${name}"?`)) {
        state.events = state.events.filter(e => e !== name);
        saveToFirebase('events', state.events);
        render();
    }
}

function renameMember() {
    const oldName = state.renameMemberOld.trim();
    const newName = state.renameMemberNew.trim();
    
    if (!oldName || !newName) {
        alert('Please enter both old and new member names.');
        return;
    }
    
    if (oldName === newName) {
        alert('Old and new names are the same.');
        return;
    }
    
    const memberExists = state.members.find(m => m.name === oldName);
    if (!memberExists) {
        alert(`Member "${oldName}" not found.`);
        return;
    }
    
    const newNameExists = state.members.find(m => m.name === newName);
    if (newNameExists) {
        alert(`Member "${newName}" already exists.`);
        return;
    }
    
    if (!confirm(`Rename "${oldName}" to "${newName}" across all data?`)) {
        return;
    }
    
    state.members = state.members.map(m => 
        m.name === oldName ? { ...m, name: newName } : m
    );
    
    state.mvpHistory = state.mvpHistory.map(entry =>
        entry.member === oldName ? { ...entry, member: newName } : entry
    );
    
    state.titleHistory = state.titleHistory.map(entry =>
        entry.member === oldName ? { ...entry, member: newName } : entry
    );
    
    saveToFirebase('members', state.members);
    saveToFirebase('mvpHistory', state.mvpHistory);
    saveToFirebase('titleHistory', state.titleHistory);
    
    alert(`Successfully renamed "${oldName}" to "${newName}"!`);
    
    state.showRenameModal = false;
    state.renameMemberOld = '';
    state.renameMemberNew = '';
    render();
}

function assignTitle() {
    if (!state.selectedMemberForTitle) {
        alert('Please select a member for title assignment.');
        return;
    }
    if (!state.selectedTitle) {
        alert('Please select a title.');
        return;
    }

    const origin = confirm('Was this title earned through Alliance efforts?\n\nClick OK for Alliance, Cancel for Individual');
    const titleSuffix = origin ? ' (Ally)' : '';
    
    const entry = {
        timestamp: new Date().toISOString(),
        title: state.selectedTitle + titleSuffix,
        member: state.selectedMemberForTitle
    };

    state.titleHistory.push(entry);
    state.titleHistory = state.titleHistory.slice(-30);
    saveToFirebase('titleHistory', state.titleHistory);
    
    alert(`🏅 Title '${state.selectedTitle}' assigned to '${state.selectedMemberForTitle}'`);
    state.isTitles = false;
    render();
}

function selectMVP() {
    if (state.isTitles) {
        assignTitle();
        return;
    }

    const eligibleMembers = getEligibleMembers();
    if (eligibleMembers.length === 0) {
        alert('No eligible members selected!');
        return;
    }

    if (!state.selectedEvent) {
        alert('Please select an event.');
        return;
    }

    const eventName = state.isCS ? `${state.selectedEvent} CS` : state.selectedEvent;
    let selectedMVP;
    let mvpWeight;

    if (state.isManualMVP) {
        if (!state.selectedMemberForManual) {
            alert('Please select a member for manual MVP.');
            return;
        }
        selectedMVP = state.selectedMemberForManual;
        const mvpCount = getMVPCount(selectedMVP);
        mvpWeight = mvpCount > 0 ? calculatePenaltyWeight(mvpCount) : defaultWeight;
    } else {
        const recentLimit = state.members.length;
        const recentMVPs = state.mvpHistory.slice(-recentLimit);
        const recentMemberNames = recentMVPs.map(h => h.member);

        const membersNotInHistory = eligibleMembers.filter(m => !recentMemberNames.includes(m.name));
        
        let weightedList = [];

        if (membersNotInHistory.length > 0) {
            membersNotInHistory.forEach(member => {
                for (let i = 0; i < defaultWeight; i++) {
                    weightedList.push(member.name);
                }
            });
        } else {
            eligibleMembers.forEach(member => {
                const mvpCount = getMVPCount(member.name);
                const penalizedWeight = calculatePenaltyWeight(mvpCount);
                const weightEntries = Math.max(1, Math.round(penalizedWeight * 10));
                for (let i = 0; i < weightEntries; i++) {
                    weightedList.push(member.name);
                }
            });
        }

        selectedMVP = weightedList[Math.floor(Math.random() * weightedList.length)];
        const mvpCount = getMVPCount(selectedMVP);
        mvpWeight = mvpCount > 0 ? calculatePenaltyWeight(mvpCount) : defaultWeight;
    }

    const mvpCount = getMVPCount(selectedMVP);
    const message = `${state.isManualMVP ? 'Manual' : 'Random'} selection: '${selectedMVP}' (weight: ${mvpWeight.toFixed(2)})${mvpCount > 0 ? ` (appears ${mvpCount} time(s) in recent history)` : ''} for '${eventName}'.\n\nConfirm participation and eligibility?`;

    if (confirm(message)) {
        const entry = {
            date: new Date().toISOString().split('T')[0],
            event: eventName,
            member: selectedMVP,
            timestamp: new Date().toISOString()
        };
        state.mvpHistory.push(entry);
        state.mvpHistory = state.mvpHistory.slice(-state.members.length);
        saveToFirebase('mvpHistory', state.mvpHistory);
        alert(`✅ MVP '${selectedMVP}' logged for '${eventName}'`);
        render();
    }
}

function getTitleColor(title) {
    if (title.includes('Earl')) return 'bg-blue-200';
    if (title.includes('Duke')) return 'bg-purple-300';
    if (title.includes('King')) return 'bg-yellow-300';
    return 'bg-gray-300';
}

function isTitleExpired(timestamp) {
    const now = new Date();
    const titleDate = new Date(timestamp);
    const daysDiff = (now - titleDate) / (1000 * 60 * 60 * 24);
    return daysDiff >= 30;
}

// Render Functions
function render() {
    const root = document.getElementById('root');
    
    if (state.loading) {
        root.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div class="text-center">
                    <div class="spinner mx-auto mb-4"></div>
                    <p class="text-white text-xl">Loading...</p>
                </div>
            </div>
        `;
        return;
    }

    if (!state.user) {
        renderLoginScreen(root);
        setTimeout(attachLoginListeners, 0);
        return;
    }

    renderMainApp(root);
    setTimeout(attachEventListeners, 0);
}

function renderLoginScreen(root) {
    root.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div class="bg-white/10 backdrop-blur-lg rounded-lg shadow-2xl p-8 max-w-md w-full">
                <div class="text-center mb-8">
                    <div class="inline-block mb-4">${Icons.Trophy()}</div>
                    <h1 class="text-3xl font-bold text-white mb-2">Alliance MVP Selector</h1>
                    <p class="text-purple-200">King's Choice - Sign In</p>
                </div>
                
                <form id="loginForm" class="space-y-4">
                    <div>
                        <label class="block text-white mb-2 font-semibold">Email</label>
                        <input 
                            type="email" 
                            id="loginEmail"
                            value="${state.loginEmail}"
                            placeholder="your-email@example.com"
                            class="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 placeholder-white/50 focus:outline-none focus:border-white/50"
                            required
                        />
                    </div>
                    
                    <div>
                        <label class="block text-white mb-2 font-semibold">Password</label>
                        <input 
                            type="password" 
                            id="loginPassword"
                            value="${state.loginPassword}"
                            placeholder="••••••••"
                            class="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 placeholder-white/50 focus:outline-none focus:border-white/50"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        class="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition"
                    >
                        Sign In
                    </button>
                </form>
                
                <p class="text-white/50 text-sm text-center mt-6">
                    Secure login with Firebase Authentication
                </p>
            </div>
        </div>
    `;
}

function attachLoginListeners() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const loginEmailInput = document.getElementById('loginEmail');
    if (loginEmailInput) {
        loginEmailInput.addEventListener('input', (e) => {
            state.loginEmail = e.target.value;
        });
    }
    
    const loginPasswordInput = document.getElementById('loginPassword');
    if (loginPasswordInput) {
        loginPasswordInput.addEventListener('input', (e) => {
            state.loginPassword = e.target.value;
        });
    }
}

function renderMainApp(root) {
    const eligibleCount = getEligibleMembers().length;
    const sortedMembers = [...state.members].sort((a, b) => a.name.localeCompare(b.name));
    const sortedEvents = [...state.events].sort((a, b) => a.localeCompare(b));
    const sortedEligibleMembers = getEligibleMembers().sort((a, b) => a.name.localeCompare(b.name));
    const recentMVPs = [...state.mvpHistory].reverse().slice(0, 35);
    const recentTitles = [...state.titleHistory].reverse().slice(0, 30);

    root.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div class="max-w-7xl mx-auto">
                <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-2xl p-6 mb-6">
                    <div class="flex items-center justify-between flex-wrap gap-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10">${Icons.Trophy()}</div>
                            <div>
                                <h1 class="text-3xl font-bold text-white">Alliance MVP Selector</h1>
                                <p class="text-purple-200">King's Choice - Firebase Synced</p>
                            </div>
                        </div>
                        <div class="flex gap-2 flex-wrap">
                            <button onclick="state.showAdminModal = true; render();" class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
                                <span class="w-5 h-5">${Icons.Users()}</span>
                                Member Admin
                            </button>
                            <button onclick="state.showEventModal = true; render();" class="bg-purple-500/50 hover:bg-purple-600/50 text-white px-4 py-2 rounded-lg transition">
                                📅 Events
                            </button>
                            <button onclick="handleLogout()" class="bg-red-500/50 hover:bg-red-600/50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
                                <span class="w-5 h-5">${Icons.LogOut()}</span>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                <div class="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-white mb-2 font-semibold">Select Event</label>
                            <select onchange="state.selectedEvent = this.value; render();" class="w-full px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30">
                                <option value="">-- Select Event --</option>
                                ${sortedEvents.map(event => `<option value="${event}" ${state.selectedEvent === event ? 'selected' : ''}>${event}</option>`).join('')}
                            </select>
                        </div>

                        <div class="flex items-end gap-2">
                            <label class="flex items-center gap-2 text-white cursor-pointer">
                                <input type="checkbox" ${state.isCS ? 'checked' : ''} onchange="state.isCS = this.checked; render();" class="w-5 h-5" />
                                <span class="font-semibold">CS</span>
                            </label>
                            <label class="flex items-center gap-2 text-white cursor-pointer ml-4">
                                <input type="checkbox" ${state.isManualMVP ? 'checked' : ''} ${state.isTitles ? 'disabled' : ''} onchange="state.isManualMVP = this.checked; render();" class="w-5 h-5" />
                                <span class="font-semibold">Manual MVP</span>
                            </label>
                        </div>

                        <div class="flex items-end gap-2">
                            <label class="flex items-center gap-2 text-white cursor-pointer">
                                <input type="checkbox" ${state.isTitles ? 'checked' : ''} onchange="state.isTitles = this.checked; if(this.checked) state.isManualMVP = false; render();" class="w-5 h-5" />
                                <span class="font-semibold">Titles</span>
                            </label>
                        </div>

                        ${state.isTitles ? `
                            <div>
                                <label class="block text-white mb-2 font-semibold">Member</label>
                                <select onchange="state.selectedMemberForTitle = this.value; render();" class="w-full px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30">
                                    <option value="">-- Select Member --</option>
                                    ${sortedMembers.map(m => `<option value="${m.name}" ${state.selectedMemberForTitle === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-white mb-2 font-semibold">Title</label>
                                <select onchange="state.selectedTitle = this.value; render();" class="w-full px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30">
                                    <option value="Earl" ${state.selectedTitle === 'Earl' ? 'selected' : ''}>Earl</option>
                                    <option value="Duke" ${state.selectedTitle === 'Duke' ? 'selected' : ''}>Duke</option>
                                    <option value="King" ${state.selectedTitle === 'King' ? 'selected' : ''}>King</option>
                                </select>
                            </div>
                        ` : ''}

                        ${state.isManualMVP && !state.isTitles ? `
                            <div>
                                <label class="block text-white mb-2 font-semibold">Select Member</label>
                                <select onchange="state.selectedMemberForManual = this.value; render();" class="w-full px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30">
                                    <option value="">-- Select Member --</option>
                                    ${sortedEligibleMembers.map(m => `<option value="${m.name}" ${state.selectedMemberForManual === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
                                </select>
                            </div>
                        ` : ''}
                    </div>

                    <button type="button" id="selectMvpBtn" class="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition flex items-center justify-center gap-2">
                        <span class="w-6 h-6">${Icons.Award()}</span>
                        ${state.isTitles ? 'Assign Title' : 'Select MVP'}
                    </button>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6">
                        <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                            <h2 class="text-xl font-bold text-white flex items-center gap-2">
                                <span class="w-6 h-6">${Icons.Users()}</span>
                                Alliance Members (${eligibleCount}/${state.members.length} Eligible)
                            </h2>
                            <div class="flex gap-2">
                                <button type="button" id="selectAllBtn" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition">Select All</button>
                                <button type="button" id="deselectAllBtn" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition">Deselect All</button>
                            </div>
                        </div>
                        
                        <div class="bg-black/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                ${sortedMembers.map(member => `
                                    <label class="flex items-center gap-2 text-white cursor-pointer hover:bg-white/10 p-2 rounded transition">
                                        <input type="checkbox" ${member.eligible ? 'checked' : ''} onchange="toggleEligibility('${member.name}')" class="w-5 h-5" />
                                        <span>${member.name}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="space-y-6">
                        <div class="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6">
                            <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span class="w-6 h-6 text-yellow-400">${Icons.Trophy()}</span>
                                Recent MVPs
                            </h2>
                            <div class="bg-black/20 rounded-lg p-4 max-h-64 overflow-y-auto">
                                ${recentMVPs.length > 0 ? recentMVPs.map(entry => `
                                    <div class="text-white text-sm mb-2 pb-2 border-b border-white/10">
                                        ${entry.date} || ${entry.event} || ${entry.member}
                                    </div>
                                `).join('') : '<p class="text-white/50 text-center">No MVP history yet.</p>'}
                            </div>
                        </div>

                        <div class="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6">
                            <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span class="w-6 h-6 text-yellow-400">${Icons.Crown()}</span>
                                Recent Titles
                            </h2>
                            <div class="bg-black/20 rounded-lg p-4 max-h-48 overflow-y-auto">
                                ${recentTitles.length > 0 ? recentTitles.map(entry => {
                                    const expired = isTitleExpired(entry.timestamp);
                                    const colorClass = expired ? 'bg-gray-400' : getTitleColor(entry.title);
                                    const dateStr = new Date(entry.timestamp).toISOString().split('T')[0];
                                    return `
                                        <div class="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                                            <div class="w-5 h-5 rounded ${colorClass}"></div>
                                            <span class="text-white text-sm">${dateStr} || ${entry.title} || ${entry.member}</span>
                                        </div>
                                    `;
                                }).join('') : '<p class="text-white/50 text-center">No title history yet.</p>'}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="text-center text-white/50 mt-8 text-sm">
                    ©2025 - Flominator - Made for King's Choice - Firebase Version
                </div>
            </div>

            ${state.showAdminModal ? renderAdminModal(sortedMembers) : ''}
            ${state.showEventModal ? renderEventModal(sortedEvents) : ''}
            ${state.showRenameModal ? renderRenameModal(sortedMembers) : ''}
        </div>
    `;
}

function renderAdminModal(sortedMembers) {
    return `
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                        <span class="w-7 h-7">${Icons.Users()}</span>
                        Member Administration
                    </h2>
                    <button onclick="state.showAdminModal = false; render();" class="text-white hover:text-red-400 transition">
                        <span class="w-6 h-6">${Icons.X()}</span>
                    </button>
                </div>

                <div class="mb-6">
                    <label class="block text-white mb-2 font-semibold">Add New Member</label>
                    <div class="flex gap-2">
                        <input 
                            type="text" 
                            id="newMemberInput"
                            value="${state.newMemberName}"
                            placeholder="Enter member name"
                            class="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/30 placeholder-white/50"
                        />
                        <button type="button" id="addMemberBtn" class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition">
                            <span class="w-5 h-5">${Icons.Plus()}</span>
                            Add
                        </button>
                    </div>
                </div>

                <div class="mb-6">
                    <button onclick="state.showRenameModal = true; state.showAdminModal = false; render();" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition">
                        ✏️ Rename Member
                    </button>
                </div>

                <div>
                    <h3 class="text-white font-semibold mb-3">Alliance Members</h3>
                    <div class="space-y-2 max-h-96 overflow-y-auto">
                        ${sortedMembers.map(member => `
                            <div class="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <span class="text-white font-medium">${member.name}</span>
                                    <span class="text-sm px-2 py-1 rounded ${member.eligible ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}">
                                        ${member.eligible ? '✓ Eligible' : '✗ Not Eligible'}
                                    </span>
                                </div>
                                <button class="removeMemberBtn bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition" data-member-name="${member.name}">
                                    <span class="w-4 h-4">${Icons.Trash2()}</span>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <button onclick="state.showAdminModal = false; render();" class="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition">
                    Close
                </button>
            </div>
        </div>
    `;
}

function renderEventModal(sortedEvents) {
    return `
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                        📅 Event Management
                    </h2>
                    <button onclick="state.showEventModal = false; render();" class="text-white hover:text-red-400 transition">
                        <span class="w-6 h-6">${Icons.X()}</span>
                    </button>
                </div>

                <div class="mb-6">
                    <label class="block text-white mb-2 font-semibold">Add New Event</label>
                    <div class="flex gap-2">
                        <input 
                            type="text" 
                            id="newEventInput"
                            value="${state.newEventName}"
                            placeholder="Enter event name"
                            class="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/30 placeholder-white/50"
                        />
                        <button type="button" id="addEventBtn" class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition">
                            <span class="w-5 h-5">${Icons.Plus()}</span>
                            Add
                        </button>
                    </div>
                </div>

                <div>
                    <h3 class="text-white font-semibold mb-3">Events</h3>
                    <div class="space-y-2 max-h-96 overflow-y-auto">
                        ${sortedEvents.map(event => `
                            <div class="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                                <span class="text-white font-medium">${event}</span>
                                <button type="button" data-event-name="${event}" class="removeEventBtn bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition">
                                    <span class="w-4 h-4">${Icons.Trash2()}</span>
                                </button>
                            </div>
                        `).join('')}
                        ${state.events.length === 0 ? '<p class="text-white/50 text-center py-4">No events yet. Add your first event above!</p>' : ''}
                    </div>
                </div>

                <button onclick="state.showEventModal = false; render();" class="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition">
                    Close
                </button>
            </div>
        </div>
    `;
}

function renderRenameModal(sortedMembers) {
    return `
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl p-6 max-w-md w-full">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                        ✏️ Rename Member
                    </h2>
                    <button onclick="state.showRenameModal = false; state.showAdminModal = true; render();" class="text-white hover:text-red-400 transition">
                        <span class="w-6 h-6">${Icons.X()}</span>
                    </button>
                </div>

                <div class="mb-4">
                    <label class="block text-white mb-2 font-semibold">Current Member Name</label>
                    <select 
                        id="renameOldInput"
                        class="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/30"
                    >
                        <option value="">-- Select Member --</option>
                        ${sortedMembers.map(m => `<option value="${m.name}" ${state.renameMemberOld === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
                    </select>
                </div>

                <div class="mb-6">
                    <label class="block text-white mb-2 font-semibold">New Member Name</label>
                    <input 
                        type="text" 
                        id="renameNewInput"
                        value="${state.renameMemberNew}"
                        placeholder="Enter new name"
                        class="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/30 placeholder-white/50"
                    />
                </div>

                <div class="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-6">
                    <p class="text-yellow-200 text-sm">
                        ⚠️ This will rename the member across ALL data: members list, MVP history, and title history.
                    </p>
                </div>

                <div class="flex gap-2">
                    <button onclick="state.showRenameModal = false; state.showAdminModal = true; render();" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition">
                        Cancel
                    </button>
                    <button type="button" id="renameMemberBtn" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition">
                        Rename
                    </button>
                </div>
            </div>
        </div>
    `;
}

function attachEventListeners() {
    // Input listeners
    const newMemberInput = document.getElementById('newMemberInput');
    if (newMemberInput) {
        newMemberInput.addEventListener('input', (e) => {
            state.newMemberName = e.target.value;
        });
        newMemberInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addMember();
            }
        });
    }

    const newEventInput = document.getElementById('newEventInput');
    if (newEventInput) {
        newEventInput.addEventListener('input', (e) => {
            state.newEventName = e.target.value;
        });
        newEventInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addEvent();
            }
        });
    }

    const renameOldInput = document.getElementById('renameOldInput');
    if (renameOldInput) {
        renameOldInput.addEventListener('change', (e) => {
            state.renameMemberOld = e.target.value;
        });
    }

    const renameNewInput = document.getElementById('renameNewInput');
    if (renameNewInput) {
        renameNewInput.addEventListener('input', (e) => {
            state.renameMemberNew = e.target.value;
        });
        renameNewInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                renameMember();
            }
        });
    }

    // Button listeners
    const addMemberBtn = document.getElementById('addMemberBtn');
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Add Member clicked');
            addMember();
        });
    }

    const addEventBtn = document.getElementById('addEventBtn');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Add Event clicked');
            addEvent();
        });
    }

    const renameMemberBtn = document.getElementById('renameMemberBtn');
    if (renameMemberBtn) {
        renameMemberBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            renameMember();
        });
    }

    const selectMvpBtn = document.getElementById('selectMvpBtn');
    if (selectMvpBtn) {
        selectMvpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectMVP();
        });
    }

    const selectAllBtn = document.getElementById('selectAllBtn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectAllMembers();
        });
    }

    const deselectAllBtn = document.getElementById('deselectAllBtn');
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            deselectAllMembers();
        });
    }

    // Remove event buttons
    const removeEventBtns = document.querySelectorAll('.removeEventBtn');
    removeEventBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const eventName = btn.getAttribute('data-event-name');
            console.log('Remove event clicked:', eventName);
            if (eventName) {
                removeEvent(eventName);
            }
        });
    });
    
    // Remove member buttons
    const removeMemberBtns = document.querySelectorAll('.removeMemberBtn');
    removeMemberBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const memberName = btn.getAttribute('data-member-name');
            if (memberName) {
                removeMember(memberName);
            }
        });
    });
}

// Auth State Listener
auth.onAuthStateChanged((user) => {
    if (user) {
        state.user = user;
        state.loading = true;
        render();
        loadDataFromFirebase();
    } else {
        state.user = null;
        state.loading = false;
        render();
    }
});

// Initial render
render();