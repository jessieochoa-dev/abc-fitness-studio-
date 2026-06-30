/* =====================================================================
   ABC Fitness Studio — About Us / Contact form script
   Stores feedback & custom order submissions in localStorage so the
   client can retain inquiries between visits (web storage requirement).
   Includes client-side input validation for data integrity/security.
   ===================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "abcFitnessContactSubmissions";

  function getSubmissions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (err) {
      return [];
    }
  }

  function saveSubmission(entry) {
    var entries = getSubmissions();
    entries.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function setFieldError(rowEl, errorEl, message) {
    rowEl.classList.add("invalid");
    errorEl.textContent = message;
  }
  function clearFieldError(rowEl, errorEl) {
    rowEl.classList.remove("invalid");
    errorEl.textContent = "";
  }

  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var nameInput = document.getElementById("cfName");
    var emailInput = document.getElementById("cfEmail");
    var phoneInput = document.getElementById("cfPhone");
    var typeSelect = document.getElementById("cfType");
    var messageInput = document.getElementById("cfMessage");
    var successBanner = document.getElementById("cfSuccess");
    var charCount = document.getElementById("cfCharCount");

    var namePattern = /^[A-Za-z' -]{2,60}$/;
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var phonePattern = /^[0-9()+\-.\s]{7,20}$/;

    if (messageInput && charCount) {
      messageInput.addEventListener("input", function () {
        var remaining = 500 - messageInput.value.length;
        charCount.textContent =
          (remaining < 0 ? 0 : remaining) + " characters remaining";
      });
    }

    function validateField(input, pattern, rowId, errorId, requiredMsg, invalidMsg) {
      var row = document.getElementById(rowId);
      var errorEl = document.getElementById(errorId);
      var value = input.value.trim();

      if (value === "") {
        setFieldError(row, errorEl, requiredMsg);
        return false;
      }
      if (pattern && !pattern.test(value)) {
        setFieldError(row, errorEl, invalidMsg);
        return false;
      }
      clearFieldError(row, errorEl);
      return true;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      successBanner.classList.remove("visible");

      var validName = validateField(
        nameInput, namePattern, "cfNameRow", "cfNameError",
        "Please enter your name.",
        "Name should be 2-60 letters (no numbers or symbols)."
      );
      var validEmail = validateField(
        emailInput, emailPattern, "cfEmailRow", "cfEmailError",
        "Please enter your email address.",
        "Please enter a valid email address (e.g. name@example.com)."
      );
      var validPhone = true;
      if (phoneInput.value.trim() !== "") {
        validPhone = validateField(
          phoneInput, phonePattern, "cfPhoneRow", "cfPhoneError",
          "Please enter a phone number.",
          "Please enter a valid phone number."
        );
      } else {
        clearFieldError(document.getElementById("cfPhoneRow"), document.getElementById("cfPhoneError"));
      }
      var validType = validateField(
        typeSelect, null, "cfTypeRow", "cfTypeError",
        "Please select an inquiry type.",
        ""
      );
      var validMessage = validateField(
        messageInput, /^.{10,500}$/, "cfMessageRow", "cfMessageError",
        "Please enter a message (at least 10 characters).",
        "Message must be between 10 and 500 characters."
      );

      if (!(validName && validEmail && validPhone && validType && validMessage)) {
        var firstInvalid = form.querySelector(".invalid input, .invalid select, .invalid textarea");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Basic sanitization: strip angle brackets to reduce injection / stored-XSS risk
      // before persisting user-supplied text to localStorage.
      var sanitize = function (str) {
        return str.replace(/[<>]/g, "");
      };

      var entry = {
        name: sanitize(nameInput.value.trim()),
        email: sanitize(emailInput.value.trim()),
        phone: sanitize(phoneInput.value.trim()),
        inquiryType: sanitize(typeSelect.value),
        message: sanitize(messageInput.value.trim()),
        submittedAt: new Date().toISOString()
      };

      saveSubmission(entry);

      successBanner.classList.add("visible");
      successBanner.focus();
      form.reset();
      if (charCount) charCount.textContent = "500 characters remaining";
    });
  }

  document.addEventListener("DOMContentLoaded", initContactForm);
})();
