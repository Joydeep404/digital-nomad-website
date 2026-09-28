/* =========================================
   NOMAD GUIDE - JAVASCRIPT LOGIC
   Handles Registration, Login, and UI Interactions
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize LocalStorage if empty
    if (!localStorage.getItem('nomadGuideUsers')) {
        localStorage.setItem('nomadGuideUsers', JSON.stringify([]));
    }

    // === CHECK LOGIN STATE AND UPDATE NAVBAR ===
    updateNavbar();

    // === REGISTRATION LOGIC ===
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // === LOGIN LOGIC ===
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Helper: Show Alert Message
function showAlert(elementId, message, type = 'danger') {
    const alertBox = document.getElementById(elementId);
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} custom-alert`;
    alertBox.style.display = 'block';
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 4000);
}

// Helper: Validate Email Format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// === HANDLE REGISTRATION ===
function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showAlert('regAlert', 'Please fill in all fields!', 'danger');
        return;
    }

    if (!isValidEmail(email)) {
        showAlert('regAlert', 'Please enter a valid email address!', 'danger');
        return;
    }

    // Prevent registering with admin email
    if (email === 'admin@nomadguide.com') {
        showAlert('regAlert', 'This email is reserved for administrators!', 'danger');
        return;
    }

    if (password.length < 6) {
        showAlert('regAlert', 'Password must be at least 6 characters long!', 'danger');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('regAlert', 'Passwords do not match!', 'danger');
        return;
    }

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('nomadGuideUsers'));
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        showAlert('regAlert', 'This email is already registered!', 'warning');
        return;
    }

    // Save new user to LocalStorage
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('nomadGuideUsers', JSON.stringify(users));

    // Success Feedback
    showAlert('regAlert', 'Registration Successful! Redirecting to Login...', 'success');
    registerForm.reset();

    // Redirect to Login page after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// === HANDLE LOGIN ===
function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validation
    if (!email || !password) {
        showAlert('loginAlert', 'Please enter your email and password!', 'danger');
        return;
    }

    if (!isValidEmail(email)) {
        showAlert('loginAlert', 'Please enter a valid email address!', 'danger');
        return;
    }

    // === ADMIN LOGIN CHECK ===
    if (email === 'admin@nomadguide.com' && password === 'admin123') {
        localStorage.setItem('isAdminLoggedIn', 'true');
        showAlert('loginAlert', 'Welcome Admin! Redirecting to dashboard...', 'success');
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1500);
        return;
    }

    // Check credentials against LocalStorage (regular users)
    const users = JSON.parse(localStorage.getItem('nomadGuideUsers'));
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Save logged-in user state
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        showAlert('loginAlert', `Welcome back, ${user.name}! Redirecting...`, 'success');
        loginForm.reset();

        // Redirect to Homepage after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showAlert('loginAlert', 'Invalid email or password. Please try again.', 'danger');
    }
}

// === UPDATE NAVBAR BASED ON LOGIN STATE ===
function updateNavbar() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const displayName = document.getElementById('display-name');
    const logoutBtn = document.getElementById('logout-btn');
    const adminLink = document.getElementById('adminLink');
    const adminDashboardLink = document.getElementById('adminDashboardLink');
    const adminDirectBtn = document.getElementById('adminDirectBtn');

    if (isAdminLoggedIn) {
        if (adminDirectBtn) adminDirectBtn.style.display = 'inline-block';
        // Admin is logged in
        if (authButtons) authButtons.classList.add('d-none');
        if (userProfile) {
            userProfile.classList.remove('d-none');
            displayName.textContent = 'Admin';
            displayName.classList.add('text-danger');
        }
        // Show admin dashboard link in dropdown
        if (adminDashboardLink) {
            adminDashboardLink.style.display = 'block';
        }
        // Show admin link in navbar if exists
        if (adminLink) {
            adminLink.style.display = 'inline-block';
            adminLink.href = 'admin-dashboard.html';
        }
    } else if (currentUser) {
        if (adminDirectBtn) adminDirectBtn.style.display = 'none';
        // Regular user is logged in
        if (authButtons) authButtons.classList.add('d-none');
        if (userProfile) {
            userProfile.classList.remove('d-none');
            displayName.textContent = currentUser.name;
            displayName.classList.remove('text-danger');
        }
        // Hide admin links for regular users
        if (adminDashboardLink) {
            adminDashboardLink.style.display = 'none';
        }
        if (adminLink) {
            adminLink.style.display = 'none';
        }
    } else {
        if (adminDirectBtn) adminDirectBtn.style.display = 'none';
        // No one is logged in
        if (authButtons) authButtons.classList.remove('d-none');
        if (userProfile) userProfile.classList.add('d-none');
        // Hide admin links
        if (adminDashboardLink) {
            adminDashboardLink.style.display = 'none';
        }
        if (adminLink) {
            adminLink.style.display = 'none';
        }
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isAdminLoggedIn');
            window.location.href = 'index.html';
        });
    }
}

// === EUROPE PAGE FILTERING LOGIC ===
const filterBtns = document.querySelectorAll('.filter-btn');
const cityItems = document.querySelectorAll('.city-item');

if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            cityItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category').includes(filterValue)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// === GEAR PAGE - ADD TO KIT LOGIC ===
let myKit = [];

function addToKit(button, itemName) {
    // Check if already in kit
    if (myKit.includes(itemName)) {
        // Remove from kit
        myKit = myKit.filter(item => item !== itemName);
        button.classList.remove('added');
        button.innerHTML = '<i class="fas fa-plus me-1"></i> Add to My Kit';
    } else {
        // Add to kit
        myKit.push(itemName);
        button.classList.add('added');
        button.innerHTML = '<i class="fas fa-check me-1"></i> Added!';
    }
    updateKitDisplay();
}

function updateKitDisplay() {
    const kitList = document.getElementById('kit-list');
    const emptyMsg = document.getElementById('empty-kit-msg');
    
    if (!kitList) return; // Exit if not on gear page

    if (myKit.length === 0) {
        kitList.innerHTML = '<p class="text-center text-muted mb-0" id="empty-kit-msg">Your kit is empty. Add some gear above!</p>';
    } else {
        let html = '';
        myKit.forEach((item, index) => {
            html += `
                <div class="kit-item">
                    <span><i class="fas fa-check-circle text-success me-2"></i> ${item}</span>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeKitItem(${index})"><i class="fas fa-times"></i></button>
                </div>
            `;
        });
        kitList.innerHTML = html;
    }
}

function removeKitItem(index) {
    const itemName = myKit[index];
    myKit.splice(index, 1);
    
    // Reset the button on the product card
    const buttons = document.querySelectorAll('.add-kit-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(`'${itemName}'`)) {
            btn.classList.remove('added');
            btn.innerHTML = '<i class="fas fa-plus me-1"></i> Add to My Kit';
        }
    });
    
    updateKitDisplay();
}

function clearKit() {
    myKit = [];
    const buttons = document.querySelectorAll('.add-kit-btn');
    buttons.forEach(btn => {
        btn.classList.remove('added');
        btn.innerHTML = '<i class="fas fa-plus me-1"></i> Add to My Kit';
    });
    updateKitDisplay();
}

// === VISA PAGE - COUNTRY SELECTOR LOGIC ===
const visaData = {
    spain: {
        flag: "🇪🇸",
        title: "Spain Digital Nomad Visa",
        cost: "€70 (~$75)",
        duration: "Up to 5 years",
        tax: "24% flat rate (Beckham Law) for first 4 years",
        req: "Proof of remote work for a non-Spanish company, minimum income of ~€2,600/month, clean criminal record, and private health insurance."
    },
    costarica: {
        flag: "🇨🇷",
        title: "Costa Rica Rentista Visa",
        cost: "$50 application fee",
        duration: "2 years (renewable)",
        tax: "0% on foreign-sourced income",
        req: "Proof of $2,500/month income for at least 2 years, OR a $60,000 deposit in a Costa Rican bank account. Must have health insurance."
    },
    thailand: {
        flag: "🇹🇭",
        title: "Thailand Destination Thailand Visa (DTV)",
        cost: "10,000 THB (~$270)",
        duration: "180 days per entry (extendable)",
        tax: "Complex, generally 0% if income is not remitted to Thailand in the same year",
        req: "Must be employed by a company abroad or have a freelance portfolio. Requires proof of at least 500,000 THB (~$13,500) in savings."
    },
    estonia: {
        flag: "🇪🇪",
        title: "Estonia Digital Nomad Visa",
        cost: "€80 (Short stay) / €100 (Long stay)",
        duration: "Up to 1 year",
        tax: "0% in Estonia if you don't become a tax resident (spend < 183 days)",
        req: "Proof of remote work in the last month. Must have a minimum income of €4,500/month in the 6 months prior to applying. Must register with the Estonian health insurance fund."
    }
};

function updateVisaDetails() {
    const selector = document.getElementById('countrySelector');
    const detailsCard = document.getElementById('visaDetailsCard');
    
    if (!selector || !detailsCard) return; // Exit if not on visa page

    const selectedCountry = selector.value;
    const data = visaData[selectedCountry];

    detailsCard.innerHTML = `
        <h2 class="fw-bold mb-4">${data.flag} ${data.title}</h2>
        <div class="visa-detail-item">
            <div class="visa-detail-icon"><i class="fas fa-money-bill-wave"></i></div>
            <div>
                <h6 class="fw-bold mb-0">Application Cost</h6>
                <p class="text-muted mb-0">${data.cost}</p>
            </div>
        </div>
        <div class="visa-detail-item">
            <div class="visa-detail-icon"><i class="fas fa-calendar-alt"></i></div>
            <div>
                <h6 class="fw-bold mb-0">Visa Duration</h6>
                <p class="text-muted mb-0">${data.duration}</p>
            </div>
        </div>
        <div class="visa-detail-item">
            <div class="visa-detail-icon"><i class="fas fa-percentage"></i></div>
            <div>
                <h6 class="fw-bold mb-0">Tax Implication</h6>
                <p class="text-muted mb-0">${data.tax}</p>
            </div>
        </div>
        <div class="visa-detail-item">
            <div class="visa-detail-icon"><i class="fas fa-file-signature"></i></div>
            <div>
                <h6 class="fw-bold mb-0">Key Requirements</h6>
                <p class="text-muted mb-0">${data.req}</p>
            </div>
        </div>
    `;
}

// Initialize Visa Page
const countrySelector = document.getElementById('countrySelector');
if (countrySelector) {
    countrySelector.addEventListener('change', updateVisaDetails);
    updateVisaDetails(); // Load initial data on page load
}

// === BUDGET PAGE - CALCULATOR LOGIC ===
function calculateBudget() {
    const ids = [
        'exp-accommodation', 'exp-food', 'exp-coworking', 'exp-transport',
        'exp-entertainment', 'exp-insurance', 'exp-internet', 'exp-misc'
    ];
    
    let total = 0;
    ids.forEach(id => {
        const val = parseFloat(document.getElementById(id).value) || 0;
        total += val;
    });

    const totalAmountEl = document.getElementById('totalAmount');
    const adviceEl = document.getElementById('budgetAdvice');
    const displayEl = document.getElementById('totalDisplay');

    if (!totalAmountEl) return; // Exit if not on budget page

    // Update the total text
    totalAmountEl.textContent = `$${total.toLocaleString()}`;

    // Remove old color classes
    totalAmountEl.classList.remove('budget-low', 'budget-med', 'budget-high');

    // Add new color class based on total and give advice
    if (total < 1000) {
        totalAmountEl.classList.add('budget-low');
        adviceEl.textContent = "Great! You are living very affordably. Perfect for Southeast Asia or Latin America!";
    } else if (total < 2000) {
        totalAmountEl.classList.add('budget-med');
        adviceEl.textContent = "A comfortable budget. This is average for most popular European or Asian nomad hubs.";
    } else {
        totalAmountEl.classList.add('budget-high');
        adviceEl.textContent = "A premium budget. You are living large! This is typical for major Western European cities or a very comfortable lifestyle anywhere.";
    }
    
    // Little animation effect when calculating
    displayEl.style.transform = "scale(1.05)";
    setTimeout(() => {
        displayEl.style.transform = "scale(1)";
    }, 200);
}

// === HEALTH PAGE - INTERACTIVE CHECKLIST LOGIC ===
function toggleCheck(item) {
    const checkbox = item.querySelector('input[type="checkbox"]');
    
    // Toggle the checkbox state
    checkbox.checked = !checkbox.checked;
    
    // Toggle the visual 'checked' class on the row
    if (checkbox.checked) {
        item.classList.add('checked');
    } else {
        item.classList.remove('checked');
    }
    
    updateReadinessScore();
}

function updateReadinessScore() {
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const total = checkboxes.length;
    let checkedCount = 0;

    checkboxes.forEach(box => {
        if (box.checked) checkedCount++;
    });

    const percentage = Math.round((checkedCount / total) * 100);
    
    const bar = document.getElementById('readinessBar');
    const text = document.getElementById('readinessText');

    if (bar && text) {
        bar.style.width = percentage + '%';
        text.textContent = percentage + '%';
        
        // Change color when 100% complete
        if (percentage === 100) {
            bar.style.background = 'linear-gradient(90deg, #198754, #28a745)';
            text.textContent = "100% - Ready to Fly! ✈️";
        } else {
            bar.style.background = 'linear-gradient(90deg, #00b4db, #0083b0)';
        }
    }
}

// === HEALTH PAGE - INSURANCE MODAL LOGIC ===
const insuranceDetails = {
    basic: { 
        title: "Basic Nomad Plan", 
        text: "Perfect for short trips under 3 months. Includes up to $50,000 medical coverage and emergency evacuation. Great for budget travelers visiting low-risk areas." 
    },
    pro: { 
        title: "Pro Nomad Plan (Most Popular)", 
        text: "Our recommended plan for full-time nomads. Includes $250,000 medical coverage, basic dental, and 24/7 global assistance. Covers trips up to 12 months." 
    },
    elite: { 
        title: "Elite Nomad Plan", 
        text: "The ultimate peace of mind. Unlimited medical coverage, full dental & vision, and includes high-risk adventure sports like scuba diving, skiing, and rock climbing." 
    }
};

const modalElement = document.getElementById('insuranceModal');
if (modalElement) {
    modalElement.addEventListener('show.bs.modal', function (event) {
        // Button that triggered the modal
        const button = event.relatedTarget;
        // Extract info from data-plan attribute
        const plan = button.getAttribute('data-plan');
        const data = insuranceDetails[plan];
        
        // Update the modal's content
        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalBody').textContent = data.text;
    });
}

// === CONTACT PAGE - FORM VALIDATION & NEWSLETTER ===
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const message = document.getElementById('contactMessage').value.trim();
        const alertBox = document.getElementById('contactAlert');

        if (!name || !email || !message) {
            alertBox.textContent = "Please fill in all required fields!";
            alertBox.className = "alert alert-danger";
            return;
        }

        // Simulate sending message
        alertBox.textContent = `Thank you, ${name}! Your message has been received. We'll get back to you soon.`;
        alertBox.className = "alert alert-success";
        contactForm.reset();
    });
}

const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('newsletterEmail').value.trim();
        const alertBox = document.getElementById('newsletterAlert');

        if (email) {
            alertBox.textContent = "🎉 Success! You've been subscribed to our newsletter.";
            alertBox.className = "alert alert-success d-block";
            newsletterForm.reset();
        }
    });
}

// === EUROPE PAGE - CITY MODAL LOGIC ===
const europeCityData = {
    lisbon: { name: "Lisbon, Portugal", cost: "$1,500 / month", visa: "D8 Digital Nomad Visa", vibe: "Sunny, Historic, & Tech-Friendly", desc: "A sunny coastal city with a booming tech scene, affordable living, and beautiful historic architecture. Famous for its pastel de nata and tram 28.", img: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=800&q=80" },
    berlin: { name: "Berlin, Germany", cost: "$2,200 / month", visa: "Freelance Visa (Freiberufler)", vibe: "Gritty, Creative, & Urban", desc: "The ultimate urban tech hub. Gritty, creative, and packed with co-working spaces and startups. Incredible nightlife and a very international community.", img: "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80" },
    barcelona: { name: "Barcelona, Spain", cost: "$2,000 / month", visa: "Spain Digital Nomad Visa", vibe: "Beach City & Architectural Wonder", desc: "The perfect blend of city life and beach relaxation. Incredible food, Gaudi architecture, and a massive nomad community.", img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80" },
    prague: { name: "Prague, Czech Republic", cost: "$1,600 / month", visa: "Zivno (Trade License)", vibe: "Medieval & Affordable", desc: "Stunning medieval architecture, very affordable, and a central location for exploring the rest of Europe. Great beer culture!", img: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=800&q=80" },
    athens: { name: "Athens, Greece", cost: "$1,400 / month", visa: "Digital Nomad Visa (6 months)", vibe: "Ancient History & Sunny", desc: "Ancient history meets modern cafe culture. A great base for island hopping on the weekends. Very affordable Mediterranean lifestyle.", img: "https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=800&q=80" },
    amsterdam: { name: "Amsterdam, Netherlands", cost: "$2,800 / month", visa: "DAFT Treaty (for US/JP) or Highly Skilled Migrant", vibe: "Bike-Friendly & Premium", desc: "Highly connected, English-friendly, and incredibly safe. A premium destination for remote workers who love canals and coffee shops.", img: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80" }
};

const cityModal = document.getElementById('cityModal');
if (cityModal) {
    cityModal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const city = button.getAttribute('data-city');
        const data = europeCityData[city];
        
        document.getElementById('modalCityName').textContent = data.name;
        document.getElementById('modalCityCost').textContent = data.cost;
        document.getElementById('modalCityVisa').textContent = data.visa;
        document.getElementById('modalCityVibe').textContent = data.vibe;
        document.getElementById('modalCityDesc').textContent = data.desc;
        document.getElementById('modalCityImg').src = data.img;
    });
}

// === ADMIN PANEL LOGIC ===

// Admin Login
const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value.trim();
        const alertBox = document.getElementById('adminAlert');

        // Simple admin credentials (you can change these)
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('isAdminLoggedIn', 'true');
            window.location.href = 'admin-dashboard.html';
        } else {
            alertBox.textContent = 'Invalid credentials! Try admin/admin123';
            alertBox.className = 'alert alert-danger';
        }
    });
}

// Admin Logout
function adminLogout() {
    localStorage.removeItem('isAdminLoggedIn');
    window.location.href = 'admin-login.html';
}

// Check Admin Auth on Dashboard
if (window.location.pathname.includes('admin-dashboard.html')) {
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
    }
}

// Admin Dashboard Functions
function showSection(sectionName) {
    // Hide all sections
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('cities-section').style.display = 'none';
    document.getElementById('add-city-section').style.display = 'none';
    
    // Show selected section
    const selectedSection = document.getElementById(sectionName + '-section');
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }
    
    // Update nav active state
    document.querySelectorAll('.admin-sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Load data based on section
    if (sectionName === 'dashboard') {
        loadDashboardData();
    } else if (sectionName === 'cities') {
        loadCitiesTable();
    }
}

// Load Cities Table
function loadCitiesTable() {
    const tbody = document.getElementById('citiesTableBody');
    if (!tbody) return;
    
    const allCities = JSON.parse(localStorage.getItem('nomadCities') || '[]');
    tbody.innerHTML = '';
    
    allCities.forEach((city, index) => {
        const row = `
            <tr>
                <td class="fw-bold">${city.name}</td>
                <td><span class="badge bg-primary text-uppercase">${city.region}</span></td>
                <td>${city.cost}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteCity(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    
    // Update stats
    document.getElementById('totalCities').textContent = allCities.length;
    const users = JSON.parse(localStorage.getItem('nomadGuideUsers') || '[]');
    document.getElementById('totalUsers').textContent = users.length;
}

// Add City Form
const addCityForm = document.getElementById('addCityForm');
if (addCityForm) {
    // Image preview functionality
    const imageFileInput = document.getElementById('newCityImageFile');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    let base64Image = '';
    
    if (imageFileInput) {
        imageFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    base64Image = e.target.result;
                    previewImg.src = base64Image;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    addCityForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!base64Image) {
            alert('Please select an image!');
            return;
        }
        
        const newCity = {
            name: document.getElementById('newCityName').value,
            region: document.getElementById('newCityRegion').value,
            cost: document.getElementById('newCityCost').value,
            visa: document.getElementById('newCityVisa').value,
            vibe: document.getElementById('newCityVibe').value,
            image: base64Image // Store base64 image
        };
        
        // Get existing cities or initialize empty array
        const allCities = JSON.parse(localStorage.getItem('nomadCities') || '[]');
        allCities.push(newCity);
        localStorage.setItem('nomadCities', JSON.stringify(allCities));
        
        alert('City added successfully! Go to "Manage Cities" to see it.');
        addCityForm.reset();
        base64Image = '';
        if (imagePreview) {
            imagePreview.style.display = 'none';
        }
    });
}

// Delete City
function deleteCity(index) {
    if (confirm('Are you sure you want to delete this city?')) {
        const allCities = JSON.parse(localStorage.getItem('nomadCities') || '[]');
        allCities.splice(index, 1);
        localStorage.setItem('nomadCities', JSON.stringify(allCities));
        loadCitiesTable();
    }
}

// === ADMIN DASHBOARD MANAGEMENT FUNCTIONS ===

// Load dashboard data
function loadDashboardData() {
    const allCities = JSON.parse(localStorage.getItem('nomadCities') || '[]');
    const users = JSON.parse(localStorage.getItem('nomadGuideUsers') || '[]');
    
    // Update stats
    const totalCitiesEl = document.getElementById('totalCities');
    const totalUsersEl = document.getElementById('totalUsers');
    
    if (totalCitiesEl) totalCitiesEl.textContent = allCities.length;
    if (totalUsersEl) totalUsersEl.textContent = users.length;
    
    // Load users table in dashboard
    const usersTable = document.getElementById('dashboardUsersTable');
    if (usersTable) {
        usersTable.innerHTML = '';
        users.slice(0, 5).forEach(user => {
            usersTable.innerHTML += `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="deleteUser('${user.email}')"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
        });
    }
    
    // Load cities table in dashboard
    const citiesTable = document.getElementById('dashboardCitiesTable');
    if (citiesTable) {
        citiesTable.innerHTML = '';
        allCities.slice(0, 5).forEach((city, index) => {
            citiesTable.innerHTML += `
                <tr>
                    <td>${city.name}</td>
                    <td><span class="badge bg-primary">${city.region}</span></td>
                    <td><button class="btn btn-sm btn-danger" onclick="deleteCity(${index})"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
        });
    }
}

// Delete user function
function deleteUser(email) {
    if (confirm('Delete this user?')) {
        let users = JSON.parse(localStorage.getItem('nomadGuideUsers') || '[]');
        users = users.filter(u => u.email !== email);
        localStorage.setItem('nomadGuideUsers', JSON.stringify(users));
        loadDashboardData();
    }
}

// Load dashboard data on admin dashboard page load
if (window.location.pathname.includes('admin-dashboard.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadDashboardData();
    });
}

// === DYNAMIC CITY LOADING FOR WEBSITE PAGES ===

function loadDynamicCities() {
    const allCities = JSON.parse(localStorage.getItem('nomadCities') || '[]');
    
    if (allCities.length === 0) return; // No admin cities to add
    
    // Check which page we're on
    const isAsiaPage = window.location.pathname.includes('asia.html');
    const isEuropePage = window.location.pathname.includes('europe.html');
    const isAmericasPage = window.location.pathname.includes('americas.html');
    
    let container, region, existingSelector;
    
    if (isAsiaPage) {
        container = document.querySelector('#asiaCitiesContainer');
        region = 'asia';
        existingSelector = '.asia-city-item';
    } else if (isEuropePage) {
        container = document.querySelector('#city-grid');
        region = 'europe';
        existingSelector = '.city-item';
    } else if (isAmericasPage) {
        container = document.querySelector('.container'); // Find the feature-row container
        region = 'americas';
        existingSelector = '.feature-row';
    }
    
    if (!container) return;
    
    // Filter cities for this region
    const regionCities = allCities.filter(city => city.region === region);
    
    if (regionCities.length > 0) {
        // Create a new section for admin-added cities if it doesn't exist
        let adminSection = document.getElementById('adminAddedCities');
        if (!adminSection) {
            adminSection = document.createElement('div');
            adminSection.id = 'adminAddedCities';
            adminSection.className = 'mt-5 pt-5 border-top';
            
            const title = document.createElement('h2');
            title.className = 'fw-bold text-center mb-5';
            title.textContent = 'More Destinations';
            adminSection.appendChild(title);
            
            const row = document.createElement('div');
            row.className = 'row g-4';
            row.id = 'adminCitiesRow';
            adminSection.appendChild(row);
            
            container.appendChild(adminSection);
        }
        
        const citiesRow = document.getElementById('adminCitiesRow');
        if (citiesRow) {
            citiesRow.innerHTML = ''; // Clear existing admin cities
            
            regionCities.forEach((city, index) => {
                if (isAsiaPage) {
                    // Asia layout (alternating rows)
                    const reverseClass = index % 2 === 1 ? 'reverse' : '';
                    const cityHTML = `
                        <div class="feature-row ${reverseClass} asia-city-item" data-city="${city.name.toLowerCase().replace(/\s+/g, '')}">
                            <div class="feature-text">
                                <h2 class="fw-bold text-success mb-3">${city.name}</h2>
                                <p class="lead text-muted">${city.vibe}</p>
                                <ul class="list-unstyled">
                                    <li><i class="fas fa-check-circle text-success me-2"></i> Average Cost: ${city.cost}</li>
                                    <li><i class="fas fa-check-circle text-success me-2"></i> Visa: ${city.visa}</li>
                                </ul>
                            </div>
                            <div class="feature-image">
                                <img src="${city.image}" alt="${city.name}">
                            </div>
                        </div>
                    `;
                    adminSection.innerHTML += cityHTML;
                } else if (isEuropePage) {
                    // Europe layout (card grid)
                    const cityHTML = `
                        <div class="col-md-4 city-item" data-category="admin">
                            <div class="card city-card h-100">
                                <div class="overflow-hidden">
                                    <img src="${city.image}" class="card-img-top" alt="${city.name}" style="height: 220px; object-fit: cover;">
                                </div>
                                <div class="card-body">
                                    <h5 class="fw-bold">${city.name}</h5>
                                    <p class="text-muted small"><i class="fas fa-money-bill text-success me-1"></i> ${city.cost}</p>
                                    <p class="card-text">${city.vibe}</p>
                                    <button class="btn btn-outline-primary btn-sm w-100 view-city-btn" data-bs-toggle="modal" data-bs-target="#cityModal" data-city="admin-${index}">View City Guide</button>
                                </div>
                            </div>
                        </div>
                    `;
                    citiesRow.innerHTML += cityHTML;
                } else if (isAmericasPage) {
                    // Americas layout (alternating rows like Asia)
                    const reverseClass = index % 2 === 1 ? 'reverse' : '';
                    const cityHTML = `
                        <div class="feature-row ${reverseClass}" style="margin-bottom: 80px; display: flex; align-items: center; gap: 50px;">
                            <div class="feature-text" style="flex: 1;">
                                <h2 class="fw-bold text-danger mb-3">${city.name}</h2>
                                <p class="lead text-muted">${city.vibe}</p>
                                <ul class="list-unstyled">
                                    <li><i class="fas fa-check-circle text-danger me-2"></i> Average Cost: ${city.cost}</li>
                                    <li><i class="fas fa-check-circle text-danger me-2"></i> Visa: ${city.visa}</li>
                                </ul>
                            </div>
                            <div class="feature-image" style="flex: 1; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 30px rgba(0,0,0,0.15);">
                                <img src="${city.image}" alt="${city.name}" style="width: 100%; height: 350px; object-fit: cover;">
                            </div>
                        </div>
                    `;
                    adminSection.innerHTML += cityHTML;
                }
            });
        }
    }
}

// Load dynamic cities on page load
if (window.location.pathname.includes('asia.html') || window.location.pathname.includes('europe.html') || window.location.pathname.includes('americas.html')) {
    document.addEventListener('DOMContentLoaded', loadDynamicCities);
}// === DYNAMIC CITY LOADING FOR WEBSITE PAGES ===

function loadDynamicCities() {
    const allCities = JSON.parse(localStorage.getItem('nomadCities') || '[]');
    
    if (allCities.length === 0) return;
    
    const isAsiaPage = window.location.pathname.includes('asia.html');
    const isEuropePage = window.location.pathname.includes('europe.html');
    const isAmericasPage = window.location.pathname.includes('americas.html');
    
    // --- ASIA PAGE LOGIC ---
    if (isAsiaPage) {
        const container = document.getElementById('asiaCitiesContainer');
        if (!container) return;
        
        const asiaCities = allCities.filter(city => city.region === 'asia');
        if (asiaCities.length === 0) return;
        
        // Remove previously added admin cities to prevent duplicates on refresh
        document.querySelectorAll('.admin-added-city').forEach(el => el.remove());
        
        const existingRows = container.querySelectorAll('.feature-row').length;
        
        asiaCities.forEach((city, index) => {
            const reverseClass = (existingRows + index) % 2 === 1 ? 'reverse' : '';
            const cityHTML = `
                <div class="feature-row ${reverseClass} admin-added-city">
                    <div class="feature-text">
                        <h2 class="fw-bold text-success mb-3">${city.name}</h2>
                        <p class="lead text-muted">${city.vibe}</p>
                        <ul class="list-unstyled">
                            <li><i class="fas fa-check-circle text-success me-2"></i> Average Cost: ${city.cost}</li>
                            <li><i class="fas fa-check-circle text-success me-2"></i> Visa: ${city.visa}</li>
                        </ul>
                    </div>
                    <div class="feature-image">
                        <img src="${city.image}" alt="${city.name}">
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cityHTML);
        });
        
    // --- EUROPE PAGE LOGIC ---
    } else if (isEuropePage) {
        const gridContainer = document.getElementById('city-grid');
        if (!gridContainer) return;
        
        const europeCities = allCities.filter(city => city.region === 'europe');
        if (europeCities.length === 0) return;
        
        // Remove previously added admin cities
        document.querySelectorAll('.admin-city-card').forEach(el => el.remove());
        
        europeCities.forEach(city => {
            const cityCard = document.createElement('div');
            cityCard.className = 'col-md-4 city-item admin-city-card';
            cityCard.setAttribute('data-category', 'admin');
            cityCard.innerHTML = `
                <div class="card city-card h-100">
                    <div class="overflow-hidden">
                        <img src="${city.image}" class="card-img-top" alt="${city.name}" style="height: 220px; object-fit: cover;">
                    </div>
                    <div class="card-body">
                        <h5 class="fw-bold">${city.name}</h5>
                        <p class="text-muted small"><i class="fas fa-money-bill text-success me-1"></i> ${city.cost}</p>
                        <p class="card-text">${city.vibe}</p>
                        <button class="btn btn-outline-primary btn-sm w-100">View City Guide</button>
                    </div>
                </div>
            `;
            gridContainer.appendChild(cityCard);
        });
        
    // --- AMERICAS PAGE LOGIC (FIXED TO BLEND IN) ---
    } else if (isAmericasPage) {
        const americasCities = allCities.filter(city => city.region === 'americas');
        if (americasCities.length === 0) return;

        // Find the container holding the "City Deep Dives"
        const headings = document.querySelectorAll('h2');
        let targetContainer = null;
        for (let h of headings) {
            if (h.textContent.includes('City Deep Dives')) {
                targetContainer = h.parentElement;
                break;
            }
        }

        if (targetContainer) {
            // Remove previously added admin cities to prevent duplicates
            document.querySelectorAll('.admin-added-city').forEach(el => el.remove());

            const existingRows = targetContainer.querySelectorAll('.feature-row').length;
            
            americasCities.forEach((city, index) => {
                const reverseClass = (existingRows + index) % 2 === 1 ? 'reverse' : '';
                
                const cityHTML = `
                    <div class="feature-row ${reverseClass} admin-added-city">
                        <div class="feature-text">
                            <h2 class="fw-bold text-danger mb-3">${city.name}</h2>
                            <p class="lead text-muted">${city.vibe}</p>
                            <ul class="list-unstyled">
                                <li><i class="fas fa-check-circle text-danger me-2"></i> Average Cost: ${city.cost}</li>
                                <li><i class="fas fa-check-circle text-danger me-2"></i> Visa: ${city.visa}</li>
                            </ul>
                        </div>
                        <div class="feature-image">
                            <img src="${city.image}" alt="${city.name}">
                        </div>
                    </div>
                `;
                targetContainer.insertAdjacentHTML('beforeend', cityHTML);
            });
        }
    }
}

// Load dynamic cities on page load
if (window.location.pathname.includes('asia.html') || window.location.pathname.includes('europe.html') || window.location.pathname.includes('americas.html')) {
    document.addEventListener('DOMContentLoaded', loadDynamicCities);
}