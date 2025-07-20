// Initialize Firebase
const auth = firebase.auth();

$(document).ready(function() {
  // Check authentication state on page load
  auth.onAuthStateChanged(handleAuthStateChange);

  // Handle signup form submission
  $('#signupForm').submit(handleSignup);

  // Handle login form submission
  $('#loginForm').submit(handleLogin);

  // Handle logout button click
  $(document).on('click', '#logoutBtn', handleLogout);

  // Initialize UI based on current auth state
  updateAuthUI();
});

// ========================
// Authentication Handlers
// ========================

function handleSignup(e) {
  e.preventDefault();
  $('#signupAlert').hide().removeClass('alert-success alert-danger').text('');

  const fullName = $('input[name="fullName"]').val().trim();
  const email = $('input[name="email"]').val().trim();
  const phone = $('input[name="phone"]').val().trim();
  const password = $('input[name="password"]').val();
  const confirmPassword = $('input[name="confirmPassword"]').val();

  // Validate form inputs
  if (!validateSignupForm(fullName, email, phone, password, confirmPassword)) {
    return;
  }

  // Create user with Firebase
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      
      // Update user profile with display name
      return user.updateProfile({
        displayName: fullName
      }).then(() => {
        // You could save phone number to Firestore here
        showAlert('signupAlert', 'success', 'রেজিস্ট্রেশন সফল! লগইন করুন।');
        $('#signupForm')[0].reset();
        $('#signupModal').modal('hide');
        
        // Optional: Send email verification
        sendEmailVerification(user);
      });
    })
    .catch((error) => {
      showAlert('signupAlert', 'danger', getFirebaseErrorMessage(error.code));
    });
}

function handleLogin(e) {
  e.preventDefault();
  $('#loginAlert').hide().removeClass('alert-success alert-danger').text('');

  const loginId = $('input[name="loginId"]').val().trim();
  const password = $('input[name="password"]').val();
  const remember = $('input[name="remember"]').is(':checked');

  if (!loginId || !password) {
    showAlert('loginAlert', 'danger', 'সব ঘর পূরণ করুন।');
    return;
  }

  // Set persistence based on "remember me" selection
  const persistence = remember ? 
    firebase.auth.Auth.Persistence.LOCAL : 
    firebase.auth.Auth.Persistence.SESSION;

  auth.setPersistence(persistence)
    .then(() => {
      return auth.signInWithEmailAndPassword(loginId, password);
    })
    .then(() => {
      showAlert('loginAlert', 'success', 'লগইন সফল! ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...');
      $('#loginForm')[0].reset();
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    })
    .catch((error) => {
      showAlert('loginAlert', 'danger', getFirebaseErrorMessage(error.code));
    });
}

function handleLogout(e) {
  e.preventDefault();
  auth.signOut().then(() => {
    window.location.href = 'welcome.html';
  }).catch((error) => {
    console.error('Logout error:', error);
  });
}

function handleAuthStateChange(user) {
  if (user) {
    // User is signed in
    console.log('User logged in:', user.email);
    // You can store user data in localStorage if needed
    localStorage.setItem('user', JSON.stringify({
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      emailVerified: user.emailVerified
    }));
  } else {
    // User is signed out
    console.log('User logged out');
    localStorage.removeItem('user');
    
    // If on a protected page, redirect to welcome
    if (isProtectedPage()) {
      window.location.href = 'welcome.html';
    }
  }
  updateAuthUI(user);
}

// ========================
// Helper Functions
// ========================

function validateSignupForm(fullName, email, phone, password, confirmPassword) {
  if (!fullName || !email || !phone || !password || !confirmPassword) {
    showAlert('signupAlert', 'danger', 'সব ঘর পূরণ করুন।');
    return false;
  }

  if (password !== confirmPassword) {
    showAlert('signupAlert', 'danger', 'পাসওয়ার্ড মিলছে না।');
    return false;
  }

  if (!validateEmail(email)) {
    showAlert('signupAlert', 'danger', 'সঠিক ইমেইল ঠিকানা লিখুন।');
    return false;
  }

  if (!validatePhone(phone)) {
    showAlert('signupAlert', 'danger', 'সঠিক মোবাইল নাম্বার লিখুন (01XXXXXXXXX)।');
    return false;
  }

  return true;
}

function updateAuthUI(user) {
  if (user) {
    // User is logged in
    $('#authUser, #authLogout').show();
    $('#authSignup, #authLogin').hide();
    $('#userName').text(user.displayName || user.email);
  } else {
    // User is logged out
    $('#authUser, #authLogout').hide();
    $('#authSignup, #authLogin').show();
  }
}

function isProtectedPage() {
  // Add paths that require authentication
  const protectedPages = ['index.html', 'becomeAseller.html'];
  return protectedPages.some(page => window.location.pathname.endsWith(page));
}

function sendEmailVerification(user) {
  user.sendEmailVerification()
    .then(() => {
      console.log('Verification email sent');
      // You could show a message to the user
    })
    .catch((error) => {
      console.error('Error sending verification email:', error);
    });
}

function showAlert(id, type, message) {
  const alert = $('#' + id);
  alert.addClass('alert-' + type).text(message).show();
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^01[3-9]\d{8}$/;
  return re.test(phone);
}

function getFirebaseErrorMessage(errorCode) {
  const messages = {
    'auth/email-already-in-use': 'এই ইমেইল দিয়ে ইতিমধ্যে রেজিস্টার করা হয়েছে',
    'auth/invalid-email': 'সঠিক ইমেইল ঠিকানা লিখুন',
    'auth/operation-not-allowed': 'এই অপারেশনটি অনুমোদিত নয়',
    'auth/weak-password': 'পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার দীর্ঘ হতে হবে',
    'auth/user-disabled': 'এই অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে',
    'auth/user-not-found': 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি',
    'auth/wrong-password': 'ভুল পাসওয়ার্ড',
    'auth/too-many-requests': 'অনেকগুলো চেষ্টা করা হয়েছে, পরে আবার চেষ্টা করুন',
    'auth/network-request-failed': 'নেটওয়ার্ক সমস্যা হয়েছে, ইন্টারনেট সংযোগ চেক করুন'
  };
  return messages[errorCode] || 'একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন';
}

// ========================
// Password Reset Functionality
// ========================

function handlePasswordReset(email) {
  auth.sendPasswordResetEmail(email)
    .then(() => {
      showAlert('loginAlert', 'success', 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে');
    })
    .catch((error) => {
      showAlert('loginAlert', 'danger', getFirebaseErrorMessage(error.code));
    });
}

// Add this to your login modal HTML:
// <a href="#" id="resetPasswordLink">পাসওয়ার্ড ভুলে গেছেন?</a>

$(document).on('click', '#resetPasswordLink', function(e) {
  e.preventDefault();
  const email = prompt('আপনার ইমেইল ঠিকানা লিখুন:');
  if (email && validateEmail(email)) {
    handlePasswordReset(email);
  } else {
    alert('সঠিক ইমেইল ঠিকানা লিখুন');
  }
});
