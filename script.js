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
            parts: [{ text: "Conversation so far:\n" + conversationHistory.map(m => `${m.sender}: ${m.text}`).join("\n") + `\nAI reply to last user message: ${userText}` }]
          }
        ]
      })
    });

    let data = await response.json();
    let aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ AI couldn’t generate a reply.";


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
    errorText.innerHTML = `<p>⚠️ Error fetching AI response.</p>`;
    chatsectionDiv.appendChild(errorText);
    scrollToLatest();
  }
});


clearBTN.addEventListener("click", () => {
  conversationHistory = [];
  localStorage.removeItem("chatHistory");
  chatsectionDiv.innerHTML = "";
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
  "just say 'hey help me find a job' ",
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
