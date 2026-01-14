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
    LogOut: () => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
    RefreshCw: () => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>'
};

// App State
let state = {
    user: null,
    userRole: 'viewer', // 'viewer' or 'moderator'
    moderators: [], // Loaded from Firebase
    members: [],
    events: [],
    mvpHistory: [],
    titleHistory: [],
    selectedEvent: '',
    isCS: false,
    isTitles: false,
    isManualMVP: false,
    selectedTitle: 'Earl/Countess',
    selectedMemberForTitle: '',
    selectedMemberForManual: '',
    titleSource: 'individual', // 'individual' or 'alliance'
    showAdminModal: false,
    showEventModal: false,
    showRenameModal: false,
    newMemberName: '',
    newEventName: '',
    renameMemberOld: '',
    renameMemberNew: '',
    loading: true,
    refreshing: false,
    loginEmail: '',
    loginPassword: '',
    errorMessage: '' // For displaying errors to users
};

const defaultWeight = 10;
const penaltyWeight = 1;
const penaltyMultiplier = 0.5;

// ALLIANCE ID - this determines which alliance data to use
const ALLIANCE_ID = 'alliance_main';

// Check if current user is a moderator (from Firebase data)
function isModerator() {
    return state.user && state.moderators.includes(state.user.email);
}

// Firebase Helper Functions
async function loadDataFromFirebase() {
    try {
        state.refreshing = true;
        state.errorMessage = '';
        if (!state.loading) render(); // Show refresh indicator if not initial load
        
        console.log('Starting data load for user:', state.user?.email);
        
        // First, load moderator list from Firebase
        try {
            console.log('Loading moderators from:', `alliance/${ALLIANCE_ID}/config/moderators`);
            const moderatorsDoc = await db.collection('alliance').doc(ALLIANCE_ID).collection('config').doc('moderators').get();
            
            if (moderatorsDoc.exists) {
                state.moderators = moderatorsDoc.data().emails || [];
                console.log('Moderators loaded:', state.moderators);
            } else {
                state.moderators = [];
                console.warn('No moderators configured in Firebase. Creating default structure...');
                
                // Try to create the moderators document if user is authenticated
                if (state.user) {
                    try {
                        await db.collection('alliance').doc(ALLIANCE_ID).collection('config').doc('moderators').set({
                            emails: [state.user.email] // Add current user as first moderator
                        });
                        state.moderators = [state.user.email];
                        console.log('Created moderators document with current user');
                    } catch (createError) {
                        console.error('Could not create moderators document:', createError);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading moderators:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            state.moderators = [];
            
            // Check for permission errors
            if (error.code === 'permission-denied') {
                throw new Error('Permission denied: Please ensure Firestore security rules are configured correctly and you have access to this alliance.');
            }
        }
        
        // Determine user role
        state.userRole = isModerator() ? 'moderator' : 'viewer';
        console.log('User role:', state.userRole);
        
        // Load from SHARED alliance data
        console.log('Loading members...');
        const membersDoc = await db.collection('alliance').doc(ALLIANCE_ID).collection('data').doc('members').get();
        if (membersDoc.exists) {
            state.members = membersDoc.data().list || [];
            console.log('Members loaded:', state.members.length);
        } else {
            console.log('No members document found, initializing empty');
            state.members = [];
            if (isModerator()) {
                await saveToFirebase('members', []);
            }
        }

        console.log('Loading MVP history...');
        const mvpDoc = await db.collection('alliance').doc(ALLIANCE_ID).collection('data').doc('mvpHistory').get();
        if (mvpDoc.exists) {
            state.mvpHistory = mvpDoc.data().list || [];
            console.log('MVP history loaded:', state.mvpHistory.length);
        } else {
            state.mvpHistory = [];
            if (isModerator()) {
                await saveToFirebase('mvpHistory', []);
            }
        }

        console.log('Loading title history...');
        const titleDoc = await db.collection('alliance').doc(ALLIANCE_ID).collection('data').doc('titleHistory').get();
        if (titleDoc.exists) {
            state.titleHistory = titleDoc.data().list || [];
            console.log('Title history loaded:', state.titleHistory.length);
        } else {
            state.titleHistory = [];
            if (isModerator()) {
                await saveToFirebase('titleHistory', []);
            }
        }

        console.log('Loading events...');
        const eventsDoc = await db.collection('alliance').doc(ALLIANCE_ID).collection('data').doc('events').get();
        if (eventsDoc.exists) {
            state.events = eventsDoc.data().list || [];
            console.log('Events loaded:', state.events.length);
        } else if (isModerator()) {
            state.events = ['Bandit Attack', 'Battle Royale', 'Kingdom War', 'Territory War', 'Alliance War'];
            await saveToFirebase('events', state.events);
            console.log('Default events created');
        }

        state.loading = false;
        state.refreshing = false;
        console.log('Data load complete');
        render();
    } catch (error) {
        console.error('Error loading data:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        
        let errorMsg = 'Error loading data from Firebase:\n\n';
        
        if (error.code === 'permission-denied') {
            errorMsg += '❌ Permission Denied\n\n';
            errorMsg += 'Possible causes:\n';
            errorMsg += '1. Your email is not in the moderators list\n';
            errorMsg += '2. Security rules are not configured correctly\n';
            errorMsg += '3. The database structure doesn\'t exist yet\n\n';
            errorMsg += 'Current user: ' + (state.user?.email || 'Not logged in') + '\n';
            errorMsg += 'Moderators: ' + (state.moderators.length > 0 ? state.moderators.join(', ') : 'None configured');
        } else if (error.code === 'unavailable') {
            errorMsg += '❌ Firebase Unavailable\n\n';
            errorMsg += 'Please check your internet connection and try again.';
        } else if (error.message) {
            errorMsg += error.message;
        } else {
            errorMsg += 'Unknown error. Check browser console for details.';
        }
        
        state.errorMessage = errorMsg;
        state.loading = false;
        state.refreshing = false;
        render();
    }
}

async function saveToFirebase(docName, data) {
    if (!isModerator()) {
        alert('Only moderators can modify data.');
        return false;
    }
    
    try {
        console.log(`Saving ${docName} to Firebase...`);
        await db.collection('alliance').doc(ALLIANCE_ID).collection('data').doc(docName).set({ list: data });
        console.log(`${docName} saved successfully`);
        return true;
    } catch (error) {
        console.error(`Error saving ${docName}:`, error);
        alert(`Error saving data: ${error.message}\n\nPlease try again.`);
        return false;
    }
}

async function manualRefresh() {
    state.refreshing = true;
    render();
    await loadDataFromFirebase();
}

// Auth Functions
function handleLogin(e) {
    e.preventDefault();
    state.loading = true;
    state.errorMessage = '';
    render();

    auth.signInWithEmailAndPassword(state.loginEmail, state.loginPassword)
        .catch((error) => {
            state.loading = false;
            console.error('Login error:', error);
            
            let errorMsg = 'Login failed:\n\n';
            if (error.code === 'auth/invalid-email') {
                errorMsg += 'Invalid email address format.';
            } else if (error.code === 'auth/user-not-found') {
                errorMsg += 'No account found with this email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMsg += 'Incorrect password.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMsg += 'Too many failed attempts. Please try again later.';
            } else {
                errorMsg += error.message;
            }
            
            state.errorMessage = errorMsg;
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
    if (!isModerator()) {
        alert('Only moderators can add members.');
        return;
    }
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
    if (!isModerator()) {
        alert('Only moderators can remove members.');
        return;
    }
    if (!confirm(`Are you sure you want to remove ${name}?`)) {
        return;
    }
    state.members = state.members.filter(m => m.name !== name);
    saveToFirebase('members', state.members);
    render();
}

function toggleEligibility(name) {
    if (!isModerator()) {
        alert('Only moderators can change eligibility.');
        return;
    }
    const member = state.members.find(m => m.name === name);
    if (member) {
        member.eligible = !member.eligible;
        saveToFirebase('members', state.members);
        render();
    }
}

function selectAllMembers() {
    if (!isModerator()) {
        alert('Only moderators can change eligibility.');
        return;
    }
    state.members.forEach(m => m.eligible = true);
    saveToFirebase('members', state.members);
    render();
}

function deselectAllMembers() {
    if (!isModerator()) {
        alert('Only moderators can change eligibility.');
        return;
    }
    state.members.forEach(m => m.eligible = false);
    saveToFirebase('members', state.members);
    render();
}

function addEvent() {
    if (!isModerator()) {
        alert('Only moderators can add events.');
        return;
    }
    const name = state.newEventName.trim();
    if (!name) {
        alert('Please enter an event name.');
        return;
    }
    if (state.events.includes(name)) {
        alert('Event already exists.');
        return;
    }
    state.events.push(name);
    state.newEventName = '';
    saveToFirebase('events', state.events);
    render();
}

function removeEvent(name) {
    if (!isModerator()) {
        alert('Only moderators can remove events.');
        return;
    }
    if (!confirm(`Are you sure you want to remove event: ${name}?`)) {
        return;
    }
    state.events = state.events.filter(e => e !== name);
    saveToFirebase('events', state.events);
    render();
}

function renameMember() {
    if (!isModerator()) {
        alert('Only moderators can rename members.');
        return;
    }
    
    const oldName = state.renameMemberOld.trim();
    const newName = state.renameMemberNew.trim();
    
    if (!oldName || !newName) {
        alert('Please select a member and enter a new name.');
        return;
    }
    
    if (oldName === newName) {
        alert('New name must be different from current name.');
        return;
    }
    
    if (state.members.find(m => m.name === newName)) {
        alert('A member with this name already exists.');
        return;
    }
    
    if (!confirm(`Rename "${oldName}" to "${newName}"?\n\nThis will update:\n- Members list\n- All MVP history\n- All title history`)) {
        return;
    }
    
    // Update member in members list
    const member = state.members.find(m => m.name === oldName);
    if (member) {
        member.name = newName;
    }
    
    // Update MVP history
    state.mvpHistory.forEach(entry => {
        if (entry.member === oldName) {
            entry.member = newName;
        }
    });
    
    // Update title history
    state.titleHistory.forEach(entry => {
        if (entry.member === oldName) {
            entry.member = newName;
        }
    });
    
    // Save all changes
    saveToFirebase('members', state.members);
    saveToFirebase('mvpHistory', state.mvpHistory);
    saveToFirebase('titleHistory', state.titleHistory);
    
    // Reset and close modal
    state.renameMemberOld = '';
    state.renameMemberNew = '';
    state.showRenameModal = false;
    state.showAdminModal = true;
    
    render();
}

function selectMVP() {
    if (!isModerator()) {
        alert('Only moderators can select MVPs.');
        return;
    }
    
    if (state.isManualMVP) {
        // Manual MVP selection
        if (!state.selectedMemberForManual) {
            alert('Please select a member for manual MVP selection.');
            return;
        }
        
        const member = state.members.find(m => m.name === state.selectedMemberForManual);
        const mvpCount = getMVPCount(state.selectedMemberForManual);
        const weight = calculatePenaltyWeight(mvpCount).toFixed(2);
        
        // Confirmation prompt with weight info
        if (!confirm(`Confirm MVP Selection:\n\nMember: ${state.selectedMemberForManual}\nCurrent MVPs: ${mvpCount}\nCurrent Weight: ${weight}\n\nIs this member eligible for MVP?`)) {
            return;
        }
        
        let eventName = state.selectedEvent || 'Manual Selection';
        // Append " CS" if cross-server checkbox is checked
        if (state.isCS && eventName !== 'Manual Selection') {
            eventName = eventName + ' CS';
        }
        const timestamp = new Date().toLocaleString();
        
        state.mvpHistory.push({
            member: state.selectedMemberForManual,
            event: eventName,
            timestamp: timestamp,
            method: 'manual'
        });
        
        // Auto-cleanup history
        cleanupMVPHistory();
        
        saveToFirebase('mvpHistory', state.mvpHistory);
        
        alert(`✅ ${state.selectedMemberForManual} selected as MVP!`);
        state.selectedMemberForManual = '';
        
    } else {
        // Random weighted selection
        const eligible = getEligibleMembers();
        
        if (eligible.length === 0) {
            alert('No eligible members selected!');
            return;
        }
        
        if (!state.selectedEvent) {
            alert('Please select an event!');
            return;
        }
        
        // Calculate weights
        const weights = eligible.map(m => {
            const mvpCount = getMVPCount(m.name);
            return calculatePenaltyWeight(mvpCount);
        });
        
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        
        let selectedMember = null;
        for (let i = 0; i < eligible.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                selectedMember = eligible[i];
                break;
            }
        }
        
        if (!selectedMember && eligible.length > 0) {
            selectedMember = eligible[eligible.length - 1];
        }
        
        const mvpCount = getMVPCount(selectedMember.name);
        const weight = calculatePenaltyWeight(mvpCount).toFixed(2);
        
        // Prepare event name with CS suffix if applicable
        let eventName = state.selectedEvent;
        if (state.isCS) {
            eventName = eventName + ' CS';
        }
        
        // Confirmation prompt with weight info
        if (!confirm(`Random Selection Result:\n\nMember: ${selectedMember.name}\nEvent: ${eventName}\nCurrent MVPs: ${mvpCount}\nCurrent Weight: ${weight}\n\nIs this member eligible for MVP?`)) {
            return;
        }
        
        const timestamp = new Date().toLocaleString();
        
        state.mvpHistory.push({
            member: selectedMember.name,
            event: eventName,
            timestamp: timestamp,
            method: 'weighted-random'
        });
        
        // Auto-cleanup history
        cleanupMVPHistory();
        
        saveToFirebase('mvpHistory', state.mvpHistory);
        
        alert(`✅ ${selectedMember.name} selected as MVP for ${state.selectedEvent}!`);
    }
    
    render();
}

// Auto-cleanup function for MVP history
function cleanupMVPHistory() {
    const eligibleCount = getEligibleMembers().length;
    const maxHistory = Math.max(10, eligibleCount);
    
    // Only keep the most recent entries
    if (state.mvpHistory.length > maxHistory) {
        state.mvpHistory = state.mvpHistory.slice(-maxHistory);
    }
}

function assignTitle() {
    if (!isModerator()) {
        alert('Only moderators can assign titles.');
        return;
    }
    
    if (!state.selectedMemberForTitle) {
        alert('Please select a member for title assignment.');
        return;
    }
    
    if (!state.selectedTitle) {
        alert('Please select a title.');
        return;
    }
    
    // Ask if title is earned individually or given by alliance
    const isIndividual = confirm(`Title Assignment:\n\nMember: ${state.selectedMemberForTitle}\nTitle: ${state.selectedTitle}\n\nWas this title earned INDIVIDUALLY?\n\nClick OK for Individual\nClick Cancel for Alliance-Given`);
    
    const titleToAssign = isIndividual ? state.selectedTitle : `${state.selectedTitle} (ally)`;
    
    const timestamp = new Date().toLocaleString();
    
    state.titleHistory.push({
        member: state.selectedMemberForTitle,
        title: titleToAssign,
        timestamp: timestamp,
        source: isIndividual ? 'individual' : 'alliance'
    });
    
    saveToFirebase('titleHistory', state.titleHistory);
    
    alert(`✅ ${titleToAssign} title assigned to ${state.selectedMemberForTitle}!`);
    state.selectedMemberForTitle = '';
    
    render();
}

// Removed clearMVPHistory, clearTitleHistory, removeMVPEntry, and removeTitleEntry functions
// History management should only be done through Firestore backend for data integrity

// Render Functions
function render() {
    const root = document.getElementById('root');
    
    if (!state.user) {
        root.innerHTML = renderLoginScreen();
        attachEventListeners();
        return;
    }
    
    if (state.loading) {
        root.innerHTML = renderLoadingScreen();
        return;
    }
    
    if (state.errorMessage) {
        root.innerHTML = renderErrorScreen();
        attachEventListeners();
        return;
    }
    
    root.innerHTML = renderMainApp();
    attachEventListeners();
}

function renderLoginScreen() {
    return `
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl p-8 max-w-md w-full">
                <div class="text-center mb-8">
                    <div class="inline-block p-4 bg-purple-500/20 rounded-full mb-4">
                        <span class="text-5xl">${Icons.Crown()}</span>
                    </div>
                    <h1 class="text-3xl font-bold text-white mb-2">Alliance MVP Selector</h1>
                    <p class="text-gray-300">Sign in to continue</p>
                </div>
                
                <form onsubmit="handleLogin(event)" class="space-y-4">
                    <div>
                        <label class="block text-white mb-2 font-semibold">Email</label>
                        <input 
                            type="email" 
                            value="${state.loginEmail}"
                            oninput="state.loginEmail = this.value"
                            placeholder="your@email.com"
                            required
                            class="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/30 placeholder-white/50 focus:border-purple-500 focus:outline-none"
                        />
                    </div>
                    
                    <div>
                        <label class="block text-white mb-2 font-semibold">Password</label>
                        <input 
                            type="password" 
                            value="${state.loginPassword}"
                            oninput="state.loginPassword = this.value"
                            placeholder="••••••••"
                            required
                            class="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/30 placeholder-white/50 focus:border-purple-500 focus:outline-none"
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg"
                    >
                        Sign In
                    </button>
                </form>
                
                ${state.errorMessage ? `
                    <div class="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                        <p class="text-red-200 text-sm whitespace-pre-line">${state.errorMessage}</p>
                    </div>
                ` : ''}
                
                <p class="text-center text-gray-400 text-sm mt-6">
                    Contact your alliance administrator for access
                </p>
            </div>
        </div>
    `;
}

function renderLoadingScreen() {
    return `
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
            <div class="text-center">
                <div class="spinner mx-auto mb-4"></div>
                <p class="text-white text-xl">Loading Alliance Data...</p>
            </div>
        </div>
    `;
}

function renderErrorScreen() {
    return `
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl p-8 max-w-2xl w-full">
                <div class="text-center mb-6">
                    <div class="inline-block p-4 bg-red-500/20 rounded-full mb-4">
                        <span class="text-5xl">❌</span>
                    </div>
                    <h1 class="text-3xl font-bold text-white mb-2">Connection Error</h1>
                </div>
                
                <div class="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-6">
                    <pre class="text-red-200 text-sm whitespace-pre-wrap font-mono">${state.errorMessage}</pre>
                </div>
                
                <div class="bg-blue-500/20 border border-blue-500/50 rounded-lg p-6 mb-6">
                    <h3 class="text-white font-bold mb-3 flex items-center gap-2">
                        💡 Troubleshooting Steps
                    </h3>
                    <ol class="text-blue-200 text-sm space-y-2 list-decimal list-inside">
                        <li>Check that you're logged in with an authorized email</li>
                        <li>Verify Firestore security rules are deployed</li>
                        <li>Ensure the database structure exists in Firebase Console</li>
                        <li>Check browser console (F12) for detailed error messages</li>
                        <li>Contact your alliance administrator if issues persist</li>
                    </ol>
                </div>
                
                <div class="flex gap-3">
                    <button 
                        onclick="manualRefresh()"
                        class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                    >
                        <span class="w-5 h-5">${Icons.RefreshCw()}</span>
                        Retry Connection
                    </button>
                    <button 
                        onclick="handleLogout()"
                        class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                    >
                        <span class="w-5 h-5">${Icons.LogOut()}</span>
                        Sign Out
                    </button>
                </div>
                
                <div class="mt-6 text-center">
                    <p class="text-gray-400 text-sm">
                        Logged in as: <span class="text-white font-mono">${state.user?.email || 'Unknown'}</span>
                    </p>
                </div>
            </div>
        </div>
    `;
}

function renderMainApp() {
    const sortedMembers = [...state.members].sort((a, b) => a.name.localeCompare(b.name));
    const recentMVPs = state.mvpHistory.slice(-10).reverse();
    const recentTitles = state.titleHistory.slice(-10).reverse();
    
    return `
        <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <!-- Header -->
            <div class="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
                <div class="container mx-auto px-4 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="text-4xl">${Icons.Crown()}</span>
                            <div>
                                <h1 class="text-2xl font-bold text-white">Alliance MVP Selector</h1>
                                <p class="text-purple-100 text-sm">
                                    ${state.user.email} 
                                    <span class="ml-2 px-2 py-0.5 bg-white/20 rounded text-xs">
                                        ${state.userRole === 'moderator' ? '👑 Moderator' : '👁️ Viewer'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button 
                                onclick="manualRefresh()"
                                ${state.refreshing ? 'disabled' : ''}
                                class="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition disabled:opacity-50"
                                title="Refresh data"
                            >
                                <span class="w-5 h-5 text-white ${state.refreshing ? 'animate-spin' : ''}">${Icons.RefreshCw()}</span>
                            </button>
                            ${state.userRole === 'moderator' ? `
                                <button 
                                    onclick="state.showAdminModal = true; render();"
                                    class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition"
                                >
                                    ⚙️ Admin
                                </button>
                            ` : ''}
                            <button 
                                onclick="handleLogout()"
                                class="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                                title="Sign out"
                            >
                                <span class="w-6 h-6 text-white">${Icons.LogOut()}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="container mx-auto px-4 py-8">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    <!-- MVP Selection Card -->
                    <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl p-6">
                        <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <span class="w-8 h-8">${Icons.Award()}</span>
                            MVP Selection
                        </h2>
                        
                        ${state.userRole === 'moderator' ? `
                            <!-- Event Selection -->
                            <div class="mb-4">
                                <label class="block text-white mb-2 font-semibold">Select Event</label>
                                <div class="flex gap-2">
                                    <select 
                                        onchange="state.selectedEvent = this.value; render();"
                                        class="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/30"
                                    >
                                        <option value="">-- Choose Event --</option>
                                        ${state.events.map(e => `<option value="${e}" ${state.selectedEvent === e ? 'selected' : ''}>${e}</option>`).join('')}
                                    </select>
                                    <button 
                                        onclick="state.showEventModal = true; render();"
                                        class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
                                        title="Manage events"
                                    >
                                        ⚙️
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Cross-Server Checkbox -->
                            <div class="mb-4">
                                <label class="flex items-center gap-2 text-white cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        ${state.isCS ? 'checked' : ''}
                                        onchange="state.isCS = this.checked; render();"
                                        class="w-5 h-5 rounded cursor-pointer"
                                    />
                                    <span class="font-semibold">Cross-Server (CS)</span>
                                    <span class="text-gray-400 text-sm">- Adds "CS" to event name</span>
                                </label>
                            </div>
                            
                            <!-- Selection Mode Toggle -->
                            <div class="mb-4 flex gap-2">
                                <button 
                                    onclick="state.isManualMVP = false; state.selectedMemberForManual = ''; render();"
                                    class="flex-1 px-4 py-2 rounded-lg font-semibold transition ${!state.isManualMVP ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}"
                                >
                                    🎲 Random
                                </button>
                                <button 
                                    onclick="state.isManualMVP = true; render();"
                                    class="flex-1 px-4 py-2 rounded-lg font-semibold transition ${state.isManualMVP ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}"
                                >
                                    ✋ Manual
                                </button>
                            </div>
                            
                            ${state.isManualMVP ? `
                                <!-- Manual Selection -->
                                <div class="mb-4">
                                    <label class="block text-white mb-2 font-semibold">Select Member Manually</label>
                                    <select 
                                        onchange="state.selectedMemberForManual = this.value; render();"
                                        class="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/30"
                                    >
                                        <option value="">-- Choose Member --</option>
                                        ${sortedMembers.map(m => `<option value="${m.name}" ${state.selectedMemberForManual === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
                                    </select>
                                </div>
                            ` : `
                                <!-- Eligible Members Count -->
                                <div class="mb-4 bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
                                    <p class="text-blue-200 text-sm">
                                        <strong>${getEligibleMembers().length}</strong> of <strong>${state.members.length}</strong> members are eligible for random selection
                                    </p>
                                </div>
                            `}
                            
                            <button 
                                id="selectMvpBtn"
                                class="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
                            >
                                <span class="w-6 h-6">${Icons.Award()}</span>
                                ${state.isManualMVP ? 'Assign MVP' : 'Select Random MVP'}
                            </button>
                        ` : `
                            <div class="bg-gray-500/20 border border-gray-500/50 rounded-lg p-6 text-center">
                                <p class="text-gray-300">Only moderators can select MVPs</p>
                            </div>
                        `}
                    </div>
                    
                    <!-- Title Assignment Card -->
                    <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl p-6">
                        <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <span class="w-8 h-8">${Icons.Crown()}</span>
                            Title Assignment
                        </h2>
                        
                        ${state.userRole === 'moderator' ? `
                            <div class="mb-4">
                                <label class="block text-white mb-2 font-semibold">Select Title</label>
                                <select 
                                    onchange="state.selectedTitle = this.value; render();"
                                    class="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/30"
                                >
                                    <option value="Earl/Countess" ${state.selectedTitle === 'Earl/Countess' ? 'selected' : ''}>Earl/Countess</option>
                                    <option value="Duke/Duchess" ${state.selectedTitle === 'Duke/Duchess' ? 'selected' : ''}>Duke/Duchess</option>
                                    <option value="King/Queen" ${state.selectedTitle === 'King/Queen' ? 'selected' : ''}>King/Queen</option>
                                </select>
                            </div>
                            
                            <div class="mb-4">
                                <label class="block text-white mb-2 font-semibold">Select Member</label>
                                <select 
                                    onchange="state.selectedMemberForTitle = this.value; render();"
                                    class="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/30"
                                >
                                    <option value="">-- Choose Member --</option>
                                    ${sortedMembers.map(m => `<option value="${m.name}" ${state.selectedMemberForTitle === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
                                </select>
                            </div>
                            
                            <button 
                                onclick="assignTitle()"
                                class="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
                            >
                                <span class="w-6 h-6">${Icons.Crown()}</span>
                                Assign Title
                            </button>
                        ` : `
                            <div class="bg-gray-500/20 border border-gray-500/50 rounded-lg p-6 text-center">
                                <p class="text-gray-300">Only moderators can assign titles</p>
                            </div>
                        `}
                    </div>
                    
                    <!-- Members List Card -->
                    <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                                <span class="w-8 h-8">${Icons.Users()}</span>
                                Members (${state.members.length})
                            </h2>
                            ${state.userRole === 'moderator' ? `
                                <div class="flex gap-2">
                                    <button 
                                        id="selectAllBtn"
                                        class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition"
                                        title="Select all"
                                    >
                                        ✓ All
                                    </button>
                                    <button 
                                        id="deselectAllBtn"
                                        class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition"
                                        title="Deselect all"
                                    >
                                        ✗ None
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="max-h-96 overflow-y-auto space-y-2">
                            ${sortedMembers.length === 0 ? `
                                <div class="text-center py-8 text-gray-400">
                                    <p>No members yet</p>
                                    ${state.userRole === 'moderator' ? '<p class="text-sm mt-2">Add members in the Admin panel</p>' : ''}
                                </div>
                            ` : sortedMembers.map(member => {
                                const mvpCount = getMVPCount(member.name);
                                const weight = calculatePenaltyWeight(mvpCount);
                                return `
                                    <div class="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition">
                                        <div class="flex items-center gap-3 flex-1">
                                            ${state.userRole === 'moderator' ? `
                                                <input 
                                                    type="checkbox" 
                                                    ${member.eligible ? 'checked' : ''}
                                                    onchange="toggleEligibility('${member.name}')"
                                                    class="w-5 h-5 rounded cursor-pointer"
                                                />
                                            ` : `
                                                <div class="w-5 h-5 rounded ${member.eligible ? 'bg-green-500' : 'bg-gray-500'}"></div>
                                            `}
                                            <div class="flex-1">
                                                <p class="text-white font-semibold">${member.name}</p>
                                                <p class="text-gray-400 text-xs">
                                                    MVPs: ${mvpCount} | Weight: ${weight.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <!-- Recent History Card -->
                    <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl p-6">
                        <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <span class="w-8 h-8">${Icons.Trophy()}</span>
                            Recent History
                        </h2>
                        
                        <!-- Tabs -->
                        <div class="flex gap-2 mb-4">
                            <button 
                                onclick="state.isTitles = false; render();"
                                class="flex-1 px-4 py-2 rounded-lg font-semibold transition ${!state.isTitles ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}"
                            >
                                🏆 MVPs
                            </button>
                            <button 
                                onclick="state.isTitles = true; render();"
                                class="flex-1 px-4 py-2 rounded-lg font-semibold transition ${state.isTitles ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}"
                            >
                                👑 Titles
                            </button>
                        </div>
                        
                        <div class="max-h-96 overflow-y-auto space-y-2">
                            ${!state.isTitles ? `
                                ${recentMVPs.length === 0 ? `
                                    <div class="text-center py-8 text-gray-400">
                                        <p>No MVP history yet</p>
                                    </div>
                                ` : recentMVPs.map((entry, idx) => `
                                    <div class="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition">
                                        <div class="flex-1">
                                            <p class="text-white font-semibold">${entry.member}</p>
                                            <p class="text-gray-400 text-sm">${entry.event}</p>
                                            <p class="text-gray-500 text-xs">${entry.timestamp}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            ` : `
                                ${recentTitles.length === 0 ? `
                                    <div class="text-center py-8 text-gray-400">
                                        <p>No title history yet</p>
                                    </div>
                                ` : recentTitles.map((entry, idx) => `
                                    <div class="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition">
                                        <div class="flex-1">
                                            <p class="text-white font-semibold">${entry.member}</p>
                                            <p class="text-yellow-400 text-sm">👑 ${entry.title}</p>
                                            <p class="text-gray-500 text-xs">${entry.timestamp}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            `}
                        </div>
                        
                        ${state.userRole === 'moderator' ? `
                            <div class="mt-4 pt-4 border-t border-white/10">
                                <p class="text-gray-400 text-sm text-center">
                                    ℹ️ History auto-managed. Edit via Firestore if needed.
                                </p>
                            </div>
                        ` : ''}
                    </div>
                    
                </div>
            </div>
            
            <!-- Modals -->
            ${state.showAdminModal ? renderAdminModal(sortedMembers) : ''}
            ${state.showEventModal ? renderEventModal() : ''}
            ${state.showRenameModal ? renderRenameModal(sortedMembers) : ''}
        </div>
    `;
}

function renderAdminModal(sortedMembers) {
    return `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onclick="if(event.target === this) { state.showAdminModal = false; render(); }">
            <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-white">⚙️ Admin Panel</h2>
                    <button onclick="state.showAdminModal = false; render();" class="text-white hover:text-red-400 transition">
                        <span class="w-6 h-6">${Icons.X()}</span>
                    </button>
                </div>

                <!-- Add Member Section -->
                <div class="mb-6">
                    <h3 class="text-white font-bold mb-3 flex items-center gap-2">
                        <span class="w-5 h-5">${Icons.Users()}</span>
                        Add Member
                    </h3>
                    <div class="flex gap-2">
                        <input 
                            type="text" 
                            id="newMemberInput"
                            value="${state.newMemberName}"
                            placeholder="Enter member name"
                            class="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/30 placeholder-white/50"
                        />
                        <button id="addMemberBtn" class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition">
                            Add
                        </button>
                    </div>
                </div>

                <!-- Members List -->
                <div class="mb-6">
                    <h3 class="text-white font-bold mb-3">All Members</h3>
                    <div class="max-h-60 overflow-y-auto space-y-2">
                        ${sortedMembers.map(member => `
                            <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                <span class="text-white">${member.name}</span>
                                <button 
                                    class="removeMemberBtn p-1 hover:bg-red-500/20 rounded transition text-red-400"
                                    data-member-name="${member.name}"
                                    title="Remove member"
                                >
                                    <span class="w-5 h-5">${Icons.Trash2()}</span>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Rename Member Button -->
                <div class="mb-6">
                    <button 
                        onclick="state.showRenameModal = true; state.showAdminModal = false; render();"
                        class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition"
                    >
                        ✏️ Rename Member
                    </button>
                </div>

                <!-- Database Info -->
                <div class="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                    <h3 class="text-white font-bold mb-2">📊 Database Info</h3>
                    <div class="text-blue-200 text-sm space-y-1">
                        <p>Alliance ID: <span class="font-mono">${ALLIANCE_ID}</span></p>
                        <p>Members: ${state.members.length}</p>
                        <p>MVP History: ${state.mvpHistory.length}</p>
                        <p>Title History: ${state.titleHistory.length}</p>
                        <p>Events: ${state.events.length}</p>
                        <p>Moderators: ${state.moderators.length}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderEventModal() {
    return `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onclick="if(event.target === this) { state.showEventModal = false; render(); }">
            <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl p-6 max-w-md w-full">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-white">🎯 Manage Events</h2>
                    <button onclick="state.showEventModal = false; render();" class="text-white hover:text-red-400 transition">
                        <span class="w-6 h-6">${Icons.X()}</span>
                    </button>
                </div>

                <div class="mb-6">
                    <h3 class="text-white font-bold mb-3">Add Event</h3>
                    <div class="flex gap-2">
                        <input 
                            type="text" 
                            id="newEventInput"
                            value="${state.newEventName}"
                            placeholder="Enter event name"
                            class="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/30 placeholder-white/50"
                        />
                        <button id="addEventBtn" class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition">
                            Add
                        </button>
                    </div>
                </div>

                <div>
                    <h3 class="text-white font-bold mb-3">All Events</h3>
                    <div class="max-h-60 overflow-y-auto space-y-2">
                        ${state.events.map(event => `
                            <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                <span class="text-white">${event}</span>
                                <button 
                                    class="removeEventBtn p-1 hover:bg-red-500/20 rounded transition text-red-400"
                                    data-event-name="${event}"
                                    title="Remove event"
                                >
                                    <span class="w-5 h-5">${Icons.Trash2()}</span>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderRenameModal(sortedMembers) {
    return `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onclick="if(event.target === this) { state.showRenameModal = false; state.showAdminModal = true; render(); }">
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
