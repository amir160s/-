// Global auth reference
const auth = firebase.auth();

// Common UI elements (present in all pages)
function updateAuthUI(user) {
  // Navbar buttons
  if (user) {
    $('.auth-user, .auth-logout').show();
    $('.auth-signup, .auth-login').hide();
    $('.user-name').text(user.displayName || user.email.split('@')[0]);
  } else {
    $('.auth-user, .auth-logout').hide();
    $('.auth-signup, .auth-login').show();
  }
  
  // Protect seller pages
  if (isSellerPage() && !user) {
    window.location.href = 'index.html';
  }
}

// Initialize auth on page load
$(document).ready(function() {
  // Check auth state
  auth.onAuthStateChanged(function(user) {
    updateAuthUI(user);
    
    // For protected pages
    if (isProtectedPage() && !user) {
      window.location.href = 'welcome.html';
    }
  });

  // Login handler (for all login forms)
  $('body').on('submit', '.login-form', handleLogin);
  
  // Signup handler (for all signup forms)
  $('body').on('submit', '.signup-form', handleSignup);
  
  // Logout handler
  $('body').on('click', '.logout-btn', handleLogout);
});

// ===== AUTH FUNCTIONS ===== //

function handleLogin(e) {
  e.preventDefault();
  const form = $(this);
  const alertBox = form.find('.alert');
  
  const email = form.find('input[name="email"]').val().trim();
  const password = form.find('input[name="password"]').val();
  const remember = form.find('input[name="remember"]').is(':checked');

  // Validate
  if (!email || !password) {
    showAlert(alertBox, 'danger', 'সব ঘর পূরণ করুন।');
    return;
  }

  // Set persistence
  const persistence = remember ? 
    firebase.auth.Auth.Persistence.LOCAL : 
    firebase.auth.Auth.Persistence.SESSION;

  auth.setPersistence(persistence)
    .then(() => auth.signInWithEmailAndPassword(email, password))
    .then(() => {
      form[0].reset();
      $('.modal').modal('hide');
      showAlert(alertBox, 'success', 'লগইন সফল!');
    })
    .catch(error => {
      showAlert(alertBox, 'danger', getFirebaseError(error.code));
    });
}

function handleSignup(e) {
  e.preventDefault();
  const form = $(this);
  const alertBox = form.find('.alert');
  
  const fullName = form.find('input[name="fullName"]').val().trim();
  const email = form.find('input[name="email"]').val().trim();
  const phone = form.find('input[name="phone"]').val().trim();
  const password = form.find('input[name="password"]').val();
  const confirmPassword = form.find('input[name="confirmPassword"]').val();

  // Validate
  if (!validateSignup(fullName, email, phone, password, confirmPassword, alertBox)) {
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return userCredential.user.updateProfile({
        displayName: fullName
      }).then(() => {
        form[0].reset();
        $('.modal').modal('hide');
        showAlert(alertBox, 'success', 'রেজিস্ট্রেশন সফল!');
        
        // Optional: Send verification email
        userCredential.user.sendEmailVerification();
      });
    })
    .catch(error => {
      showAlert(alertBox, 'danger', getFirebaseError(error.code));
    });
}

function handleLogout(e) {
  e.preventDefault();
  auth.signOut()
    .then(() => {
      window.location.href = 'index.html';
    })
    .catch(error => {
      console.error('Logout error:', error);
    });
}

// ===== HELPER FUNCTIONS ===== //

function isProtectedPage() {
  // List pages that require login
  return ['becomeAseller.html', 'dashboard.html'].some(
    page => window.location.pathname.endsWith(page)
  );
}

function isSellerPage() {
  return window.location.pathname.endsWith('becomeAseller.html');
}

function validateSignup(name, email, phone, pass, confirmPass, alertBox) {
  if (!name || !email || !phone || !pass || !confirmPass) {
    showAlert(alertBox, 'danger', 'সব ঘর পূরণ করুন।');
    return false;
  }
  
  if (pass !== confirmPass) {
    showAlert(alertBox, 'danger', 'পাসওয়ার্ড মিলছে না।');
    return false;
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAlert(alertBox, 'danger', 'সঠিক ইমেইল লিখুন।');
    return false;
  }
  
  if (!/^01[3-9]\d{8}$/.test(phone)) {
    showAlert(alertBox, 'danger', 'সঠিক মোবাইল নম্বর লিখুন।');
    return false;
  }
  
  if (pass.length < 6) {
    showAlert(alertBox, 'danger', 'পাসওয়ার্ড ৬ অক্ষরের বেশি হতে হবে।');
    return false;
  }
  
  return true;
}

function showAlert(element, type, message) {
  element.removeClass('alert-success alert-danger')
         .addClass(`alert-${type}`)
         .text(message)
         .show()
         .delay(5000)
         .fadeOut();
}

function getFirebaseError(code) {
  const errors = {
    'auth/email-already-in-use': 'ইমেইলটি ইতিমধ্যে ব্যবহৃত হচ্ছে',
    'auth/invalid-email': 'অবৈধ ইমেইল ঠিকানা',
    'auth/weak-password': 'দুর্বল পাসওয়ার্ড',
    'auth/user-not-found': 'ব্যবহারকারী খুঁজে পাওয়া যায়নি',
    'auth/wrong-password': 'ভুল পাসওয়ার্ড',
    'auth/too-many-requests': 'অনেকগুলো চেষ্টা করা হয়েছে'
  };
  return errors[code] || 'একটি ত্রুটি ঘটেছে';
}
