const sendText = document.getElementById("searchBtn");
const chatInput = document.getElementById("chatInput");
const searchBtn = document.getElementById("searchBtn");
const dnwBTN = document.getElementById("dnwBTN");
const chatsectionDiv = document.getElementById("chatsection");

let conversationHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

conversationHistory.forEach(msg => {
  let div = document.createElement("div");
  div.classList.add(msg.sender === "User" ? "chatTexts" : "aiTexts");
  div.innerHTML = `<p>${msg.text}</p>`;
  chatsectionDiv.appendChild(div);
});

function scrollToLatest() {
  const latestMsg = document.getElementById("latestMsg");
  if (latestMsg) {
    latestMsg.scrollIntoView({ behavior: "smooth", block: "end" });

    setTimeout(() => {
      window.scrollBy(0, 180);
    }, 300);
  }
}

sendText.addEventListener("click", async () => {
  let userText = chatInput.value.trim();
  if (!userText) return;

  let chatText = document.createElement("div");
  chatText.classList.add("chatTexts");
  chatText.innerHTML = `<p>${userText}</p>`;
  const oldLast = chatsectionDiv.querySelector("#latestMsg");
  if (oldLast) oldLast.removeAttribute("id");
  chatText.id = "latestMsg";
  chatsectionDiv.appendChild(chatText);
  scrollToLatest();

  conversationHistory.push({ sender: "User", text: userText });
  localStorage.setItem("chatHistory", JSON.stringify(conversationHistory));

  chatInput.value = "";

  try {
    let response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAj52FLcVsU60wgiGIYIfEn07L0x5Ypbnk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{
              text: `You are a professional AI career advisor, delivering concise and polished responses in a formal yet approachable tone, like a career counselor. Provide short responses (1-2 sentences) focused on job suggestions, career advice, or skill recommendations. Always include 1-2 brief follow-up questions to refine suggestions until the user is satisfied. Keep responses compact to fit within a 400px-wide container. Use simple HTML for formatting:
- Bullet points: <ul><li> for lists, keeping items concise.
- Tables: <table border="1"><tr><th>Header</th></tr><tr><td>Item</td></tr></table> for pros/cons or comparisons, respecting 400px width.
- Highlight key text: <span class="highlight-primary">text</span> for emphasis or <span class="highlight-secondary">text</span> for secondary points.
- Links: <a href="url">text</a> for resources, ensuring clarity.
- Use emojis sparingly (e.g., ✅), only for subtle emphasis. Avoid markdown (no ** or #) and casual slang.

Example: "Consider a career in data analysis. <span class="highlight-primary">Learning Python</span> could be a strong start. ✅ What is your current skill set? Are you interested in technical roles?"

Conversation so far:
${conversationHistory.map(m => `${m.sender}: ${m.text}`).join("\n")}

AI reply to last user message: ${userText}`
            }]
          }
        ]
      })
    });

    let data = await response.json();
    let aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn’t provide a suggestion at this time. Could you share your professional background? ✅";
    let aiText = document.createElement("div");
    aiText.classList.add("aiTexts");
    aiText.innerHTML = `<p>${aiReply.replace(/\n/g, "<br>")}</p>`;
    const oldLastAI = chatsectionDiv.querySelector("#latestMsg");
    if (oldLastAI) oldLastAI.removeAttribute("id");
    aiText.id = "latestMsg";
    chatsectionDiv.appendChild(aiText);

    conversationHistory.push({ sender: "AI", text: aiReply });
    localStorage.setItem("chatHistory", JSON.stringify(conversationHistory));

    scrollToLatest();

  } catch (err) {
    console.error("API Error:", err);
    let errorText = document.createElement("div");
    errorText.classList.add("aiTexts");
    errorText.innerHTML = `<p>An error occurred. Please try again or provide more details. ✅</p>`;
    chatsectionDiv.appendChild(errorText);
    scrollToLatest();
  }
});

clearBTN.addEventListener("click", () => {
  conversationHistory = [];
  localStorage.removeItem("chatHistory");
  chatsectionDiv.innerHTML = "";

  let msgDiv = document.createElement("div");
  msgDiv.classList.add("featureMsg");
  msgDiv.textContent = "Chat cleared";

  document.body.appendChild(msgDiv);

  setTimeout(() => {
    msgDiv.remove();
  }, 2000);
});

chatInput.addEventListener("focus", () => {
  searchBtn.style.borderTopRightRadius = "20px";
  searchBtn.style.borderBottomRightRadius = "20px";
  searchBtn.style.borderTopLeftRadius = "20px";
  searchBtn.style.borderBottomLeftRadius = "20px";
  searchBtn.style.bottom = "-20px";
  searchBtn.style.right = "0";

  dnwBTN.style.bottom = "-20px";
  dnwBTN.style.left = "0";

  clearBTN.style.bottom = "-20px";
  clearBTN.style.left = "0";
});

chatInput.addEventListener("blur", () => {
  searchBtn.style.borderTopRightRadius = "20px";
  searchBtn.style.borderBottomRightRadius = "20px";
  searchBtn.style.borderTopLeftRadius = "0px";
  searchBtn.style.borderBottomLeftRadius = "0px";
  searchBtn.style.bottom = "0";
  searchBtn.style.right = "0";

  dnwBTN.style.bottom = "0";
  dnwBTN.style.left = "0";

  clearBTN.style.bottom = "0";
  clearBTN.style.left = "0";
});

function wellcome() {
  let well = document.getElementById("wellcome");
  if (chatsectionDiv.children.length === 0) {
    well.style.display = "flex";
  } else {
    well.style.display = "none";
  }
}

wellcome();

const observer = new MutationObserver(() => {
  wellcome();
});

observer.observe(chatsectionDiv, { childList: true });

const well = document.getElementById("wellcome");

const messages = [
  "just send me a 'hey' so we can start ",
  "Let’s find your first job together",
  "Ask me about skills, jobs, or careers",
  "Ready to discover your path?",
  "ask anything"
];

let msgIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
  const currentMsg = messages[msgIndex];

  if (!isDeleting) {
    well.textContent = currentMsg.substring(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentMsg.length) {
      isDeleting = true;
      setTimeout(typeEffect, 1500);
      return;
    }
  } else {
    well.textContent = currentMsg.substring(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      isDeleting = false;
      msgIndex = (msgIndex + 1) % messages.length;
    }
  }

  const speed = isDeleting ? 40 : 100;
  setTimeout(typeEffect, speed);
}

typeEffect();

dnwBTN.addEventListener("click", () => {
  let oldMsg = document.querySelector(".featureMsg");
  if (oldMsg) oldMsg.remove();

  let msgDiv = document.createElement("div");
  msgDiv.classList.add("featureMsg");
  msgDiv.textContent = "Opps! Harshad is still working on this feature";

  document.body.appendChild(msgDiv);

  setTimeout(() => {
    msgDiv.remove();
  }, 4000);
});

const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('change', () => {
  if (themeToggle.checked) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');

  let msgDiv = document.createElement("div");
  msgDiv.classList.add("featureMsg");
  msgDiv.textContent = "Dark mode applied";

  document.body.appendChild(msgDiv);

  setTimeout(() => {
    msgDiv.remove();
  }, 2500);

  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    let msgDiv = document.createElement("div");
  msgDiv.classList.add("featureMsg");
  msgDiv.textContent = "light mode applied";

  document.body.appendChild(msgDiv);

  setTimeout(() => {
    msgDiv.remove();
  }, 2500);
  }
});

// i will make cahnges in this part latter 

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.checked = true;
} else {
  document.body.classList.remove('dark-mode');
  themeToggle.checked = false;
} 
