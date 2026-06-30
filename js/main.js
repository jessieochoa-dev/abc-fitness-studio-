/* =====================================================================
   ABC Fitness Studio — Shared site script
   Handles: mobile nav toggle, newsletter subscribe (localStorage),
            shopping cart (sessionStorage) shared across Gallery + header
   ===================================================================== */

(function () {
  "use strict";

  /* ---------------- Mobile nav toggle ---------------- */
  function initNavToggle() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("mainNav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  /* ---------------- Newsletter subscribe (localStorage) ----------------
     Persists subscriber emails permanently across browser sessions —
     appropriate for newsletter sign-ups the client wants to retain. */
  function initNewsletter() {
    var form = document.getElementById("newsletterForm");
    if (!form) return;
    var input = document.getElementById("newsletterEmail");
    var msg = document.getElementById("newsletterMsg");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = input.value.trim();
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        msg.textContent = "Please enter a valid email address.";
        msg.style.color = "#FF8A8A";
        return;
      }

      var subscribers = JSON.parse(localStorage.getItem("abcFitnessSubscribers") || "[]");
      if (subscribers.indexOf(email) === -1) {
        subscribers.push(email);
        localStorage.setItem("abcFitnessSubscribers", JSON.stringify(subscribers));
      }
      msg.textContent = "You're subscribed! Thanks for joining the ABC Fitness community.";
      msg.style.color = "#9BE3B5";
      form.reset();
    });
  }

  /* ---------------- Shopping Cart (sessionStorage) ----------------
     Cart only needs to persist for the current visit/session, so
     sessionStorage is used (clears when the browser tab/session ends). */
  var CART_KEY = "abcFitnessCart";

  function getCart() {
    try {
      return JSON.parse(sessionStorage.getItem(CART_KEY) || "[]");
    } catch (err) {
      return [];
    }
  }

  function saveCart(cart) {
    sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function addToCart(item) {
    var cart = getCart();
    cart.push(item);
    saveCart(cart);
  }

  function clearCart() {
    sessionStorage.removeItem(CART_KEY);
    updateCartCount();
  }

  function cartTotal(cart) {
    return cart.reduce(function (sum, i) { return sum + Number(i.price || 0); }, 0);
  }

  function updateCartCount() {
    var countEls = document.querySelectorAll(".cart-count");
    var count = getCart().length;
    countEls.forEach(function (el) {
      el.textContent = count;
      el.parentElement.setAttribute(
        "aria-label",
        "View shopping cart, " + count + (count === 1 ? " item" : " items")
      );
    });
  }

  /* ---------------- Dialog helper (visually styled "alert") ---------------- */
  function showDialog(message) {
    var dlg = document.getElementById("alertDialog");
    if (!dlg) {
      // Fallback if dialog markup isn't present on this page
      window.alert(message);
      return;
    }
    var msgEl = document.getElementById("alertDialogMsg");
    msgEl.textContent = message;
    if (typeof dlg.showModal === "function") {
      dlg.showModal();
    } else {
      dlg.setAttribute("open", "");
    }
  }

  function initAlertDialog() {
    var dlg = document.getElementById("alertDialog");
    if (!dlg) return;
    var closeBtn = document.getElementById("alertDialogClose");
    closeBtn.addEventListener("click", function () {
      dlg.close ? dlg.close() : dlg.removeAttribute("open");
    });
  }

  /* ---------------- Cart modal (View Cart) ---------------- */
  function renderCartModal() {
    var list = document.getElementById("cartItemsList");
    var totalRow = document.getElementById("cartTotalAmount");
    var emptyMsg = document.getElementById("cartEmptyMsg");
    if (!list) return;

    var cart = getCart();
    list.innerHTML = "";

    if (cart.length === 0) {
      emptyMsg.style.display = "block";
    } else {
      emptyMsg.style.display = "none";
      cart.forEach(function (item, idx) {
        var li = document.createElement("li");
        li.className = "cart-line-item";
        li.innerHTML =
          '<span class="cli-name">' + escapeHtml(item.name) + "</span>" +
          '<span class="cli-price">$' + Number(item.price).toFixed(2) + "</span>";
        list.appendChild(li);
      });
    }
    if (totalRow) totalRow.textContent = "$" + cartTotal(cart).toFixed(2);
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function initCartModal() {
    var modal = document.getElementById("cartModal");
    var openBtns = document.querySelectorAll(".js-open-cart");
    var closeBtn = document.getElementById("cartModalClose");
    var clearBtn = document.getElementById("clearCartBtn");
    var processBtn = document.getElementById("processOrderBtn");

    if (!modal) {
      updateCartCount();
      return;
    }

    function openModal() {
      renderCartModal();
      modal.removeAttribute("hidden");
      closeBtn.focus();
      document.addEventListener("keydown", onKeydown);
    }
    function closeModal() {
      modal.setAttribute("hidden", "");
      document.removeEventListener("keydown", onKeydown);
    }
    function onKeydown(e) {
      if (e.key === "Escape") closeModal();
    }

    openBtns.forEach(function (btn) {
      btn.addEventListener("click", openModal);
    });
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });

    clearBtn.addEventListener("click", function () {
      clearCart();
      renderCartModal();
      showDialog("Cart cleared.");
    });

    processBtn.addEventListener("click", function () {
      var cart = getCart();
      if (cart.length === 0) {
        showDialog("Your cart is empty. Add an item before processing your order.");
        return;
      }
      showDialog("Thank you for your order.");
      clearCart();
      renderCartModal();
    });

    updateCartCount();
  }

  /* ---------------- Add to Cart buttons on Gallery page ---------------- */
  function initAddToCartButtons() {
    var buttons = document.querySelectorAll(".add-to-cart-btn");
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var name = btn.getAttribute("data-name");
        var price = btn.getAttribute("data-price");
        addToCart({ name: name, price: price });
        showDialog("Item added.");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initNewsletter();
    initAlertDialog();
    initCartModal();
    initAddToCartButtons();
    updateCartCount();
  });
})();
