(function () {
  // Inbox that receives purchase inquiries from both language versions.
  var INQUIRY_EMAIL = "miguel.centeno16@gmail.com";

  function payloadFromForm(form) {
    var data = new FormData(form);
    return {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      message: String(data.get("message") || "").trim(),
      language: String(data.get("language") || "").trim(),
      _subject: String(data.get("_subject") || "Purchase inquiry").trim(),
      _template: "table",
      _captcha: "false",
      _replyto: String(data.get("email") || "").trim()
    };
  }

  function setBusy(form, busy) {
    var submit = form.querySelector('[type="submit"]');
    if (!submit) return;
    if (busy) {
      submit.dataset.originalValue = submit.value;
      submit.value = submit.getAttribute("data-wait") || submit.value;
      submit.disabled = true;
    } else {
      submit.value = submit.dataset.originalValue || submit.value;
      submit.disabled = false;
    }
  }

  function showState(form, kind) {
    var wrap = form.closest(".w-form");
    if (!wrap) return;
    var done = wrap.querySelector(".w-form-done");
    var fail = wrap.querySelector(".w-form-fail");
    if (kind === "done") {
      form.style.display = "none";
      if (done) done.style.display = "block";
      if (fail) fail.style.display = "none";
      return;
    }
    if (done) done.style.display = "none";
    if (fail) fail.style.display = "block";
  }

  function onSubmit(event) {
    var form = event.target;
    if (!form || !form.classList.contains("inquiry-form")) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    var honey = form.querySelector('[name="_honey"]');
    if (honey && honey.value) return;

    var payload = payloadFromForm(form);
    if (!payload.name || !payload.email || !payload.message) {
      showState(form, "fail");
      return;
    }

    if (!INQUIRY_EMAIL || INQUIRY_EMAIL === "YOUR_EMAIL_HERE") {
      console.error("Set INQUIRY_EMAIL in js/inquiry-form.js so inquiries can be delivered.");
      showState(form, "fail");
      return;
    }

    setBusy(form, true);

    fetch("https://formsubmit.co/ajax/" + encodeURIComponent(INQUIRY_EMAIL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Request failed");
        return response.json();
      })
      .then(function (result) {
        if (result && result.success === "false") throw new Error("Rejected");
        showState(form, "done");
      })
      .catch(function () {
        showState(form, "fail");
        setBusy(form, false);
      });
  }

  document.addEventListener("submit", onSubmit, true);
})();
