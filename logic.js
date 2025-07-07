

        let EMAIL = null;
        // DOM Elements
        const emailSection = document.getElementById('emailSection');
        const otpSection = document.getElementById('otpSection');
        const emailInput = document.getElementById('email');
        const emailForOtpInput = document.getElementById('emailForOtp');
        const sendOtpBtn = document.getElementById('sendOtpBtn');
        const verifyOtpBtn = document.getElementById('verifyOtpBtn');
        const showOtpSection = document.getElementById('showOtpSection');
        const showEmailSection = document.getElementById('showEmailSection');
        const resendOtp = document.getElementById('resendOtp');
        const otpInputs = document.querySelectorAll('.otp-input');
        const toastContainer = document.querySelector('.toast-container');
        
        // Show OTP section
        function showOtpForm(isBack=true) {
            if(isBack){
                EMAIL = "";
            }
            emailSection.style.display = 'none';
            otpSection.style.display = 'block';
        }
        
        // Show email section
        function showEmailForm() {
            clearFieldsVerification();
            otpSection.style.display = 'none';
            emailSection.style.display = 'block';
        }
        function clearFields(){
            emailInput.value = "";
        }
        function clearFieldsVerification(){
              otpInputs.forEach(input => {
                input.value = "";
            });
        }
        
        // Handle OTP input navigation
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', () => {
                if (input.value && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !input.value && index > 0) {
                    otpInputs[index - 1].focus();
                }
            });
        });
        
        // Show toast message
        function showToast(type, title, message) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            const icon = type === 'success' ? '✓' : '✕';
            
            toast.innerHTML = `
                <div class="toast-icon">${icon}</div>
                <div class="toast-content">
                    <div class="toast-title">${title}</div>
                    <div class="toast-message">${message}</div>
                </div>
                <button class="toast-close">&times;</button>
            `;
            
            toastContainer.appendChild(toast);
            
            // Show toast
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);
            
            // Close toast on button click
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            });
            
            // Auto remove toast after 5 seconds
            setTimeout(() => {
                if (toast.classList.contains('show')) {
                    toast.classList.remove('show');
                    setTimeout(() => {
                        toast.remove();
                    }, 300);
                }
            }, 5000);
        }
        
        // Event Listeners
        showOtpSection.addEventListener('click', showOtpForm);
        showEmailSection.addEventListener('click', showEmailForm);
        function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}
        // Simulated API calls for demo purposes
        sendOtpBtn.addEventListener('click', async () => {
            
            const email = emailInput.value;
            
            if (!email || !isValidEmail(email)) {
                showToast('error', 'Invalid Email', 'Please enter a valid email address');
                return;
            }
            EMAIL  = email;
            
            //CALL
            const response = await fetch("https://otp-verification-app-07q2.onrender.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
            },
            body: JSON.stringify({ "email":email })
        });
        
        
        const resp = await response.json()
        if(resp.status  === "success"){
            showToast('success', 'OTP', 'Successfully, Initiated An Account; Verify OTP');
        }
        // clearFields();
        showOtpForm(false);

        
        
        })
        
        verifyOtpBtn.addEventListener('click', async() => {
            let otp = '';
            otpInputs.forEach(input => {
                otp += input.value;
            });
            
            if (otp.length !== 6) {
                showToast('error', 'Invalid OTP', 'Please enter the complete 6-digit code');
                return;
            }
            if(EMAIL == null){
                showToast('error', 'OTP Failure', 'Unable to Sent OTP, Please Enter the Email');
                return
            }
            
            // Simulate API call to /verify-otp
            const response = await fetch("https://otp-verification-app-07q2.onrender.com/verify", {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "email":EMAIL,"otp_code":otp})
        });
        
        
        const resp = await response.json()
        if(resp.status  === "success"){
            showToast('success', 'OTP Verification', 'Code has been Verified');
        }else{
            showToast('error', 'OTP Rejection', 'Wrong OTP, Try Again');
        }
        clearFieldsVerification();
        
        
        
    })
    
    resendOtp.addEventListener('click', async() => {
            if(EMAIL == null){

                showToast('error', 'OTP Resent Failure', 'Unable to Sent OTP, Please Enter the Email');
                return
            }
            const response = await fetch("https://otp-verification-app-07q2.onrender.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                    body: JSON.stringify({ "email":EMAIL })
            });
            
            
            const resp = await response.json()
    
            
            if(resp.status  === "success"){
                    showToast('success', 'OTP Resent', 'A new verification code has been sent to your email');
            }
            
        });
        // Initialize
        showEmailForm();
