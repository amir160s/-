$(document).ready(function() {
  // Handle signup form submission
  $('#signupForm').submit(function(e) {
    e.preventDefault();
    
    // Clear previous alerts
    $('#signupAlert').hide().removeClass('alert-success alert-danger').text('');
    
    // Get form values
    const fullName = $('input[name="fullName"]').val().trim();
    const email = $('input[name="email"]').val().trim();
    const phone = $('input[name="phone"]').val().trim();
    const password = $('input[name="password"]').val();
    const confirmPassword = $('input[name="confirmPassword"]').val();
    
    // Validate form
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      showAlert('signupAlert', 'danger', 'সব ঘর পূরণ করুন।');
      return;
    }
    
    if (password !== confirmPassword) {
      showAlert('signupAlert', 'danger', 'পাসওয়ার্ড মিলছে না।');
      return;
    }
    
    if (!validateEmail(email)) {
      showAlert('signupAlert', 'danger', 'সঠিক ইমেইল ঠিকানা লিখুন।');
      return;
    }
    
    if (!validatePhone(phone)) {
      showAlert('signupAlert', 'danger', 'সঠিক মোবাইল নাম্বার লিখুন (01XXXXXXXXX)।');
      return;
    }
    
    // Simulate successful signup (in a real app, this would be an AJAX call)
    showAlert('signupAlert', 'success', 'রেজিস্ট্রেশন সফল! লগইন করুন।');
    $('#signupForm')[0].reset();
    
    // In a real app, you would:
    // $.ajax({
    //   url: 'api/signup',
    //   method: 'POST',
    //   data: { fullName, email, phone, password },
    //   success: function(response) {
    //     if (response.success) {
    //       showAlert('signupAlert', 'success', 'রেজিস্ট্রেশন সফল! লগইন করুন।');
    //       $('#signupForm')[0].reset();
    //     } else {
    //       showAlert('signupAlert', 'danger', response.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
    //     }
    //   },
    //   error: function() {
    //     showAlert('signupAlert', 'danger', 'সার্ভারে সমস্যা হয়েছে। পরে চেষ্টা করুন।');
    //   }
    // });
  });
  
  // Handle login form submission
  $('#loginForm').submit(function(e) {
    e.preventDefault();
    
    // Clear previous alerts
    $('#loginAlert').hide().removeClass('alert-success alert-danger').text('');
    
    // Get form values
    const loginId = $('input[name="loginId"]').val().trim();
    const password = $('input[name="password"]').val();
    const remember = $('input[name="remember"]').is(':checked');
    
    // Validate form
    if (!loginId || !password) {
      showAlert('loginAlert', 'danger', 'সব ঘর পূরণ করুন।');
      return;
    }
    
    // Simulate successful login (in a real app, this would be an AJAX call)
    showAlert('loginAlert', 'success', 'লগইন সফল! ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...');
    $('#loginForm')[0].reset();
    
    // Redirect after 1 second
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
    
    // In a real app, you would:
    // $.ajax({
    //   url: 'api/login',
    //   method: 'POST',
    //   data: { loginId, password, remember },
    //   success: function(response) {
    //     if (response.success) {
    //       showAlert('loginAlert', 'success', 'লগইন সফল! ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...');
    //       $('#loginForm')[0].reset();
    //       setTimeout(() => {
    //         window.location.href = 'index.html';
    //       }, 1000);
    //     } else {
    //       showAlert('loginAlert', 'danger', response.message || 'লগইন ব্যর্থ হয়েছে।');
    //     }
    //   },
    //   error: function() {
    //     showAlert('loginAlert', 'danger', 'সার্ভারে সমস্যা হয়েছে। পরে চেষ্টা করুন।');
    //   }
    // });
  });
  
  // Helper function to show alerts
  function showAlert(id, type, message) {
    const alert = $('#' + id);
    alert.addClass('alert-' + type).text(message).show();
  }
  
  // Email validation
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  // Phone validation (Bangladeshi format)
  function validatePhone(phone) {
    const re = /^01[3-9]\d{8}$/;
    return re.test(phone);
  }
});