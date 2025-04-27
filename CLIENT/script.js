const btn = document.querySelector("#submit");
const field = document.querySelector("#chat-prompt");
const output = document.querySelector("#output");

let messages = []

function loadChatHistory(){
    messages = JSON.parse(localStorage.getItem("chatHistory")) || messages;
}

function delayTextSpeed(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

btn.addEventListener("click", async (event) => {
    event.preventDefault();
    btn.disabled = true;

    messages.push(["human", field.value])
    try {
        const response = await fetch("http://localhost:3000/ask", {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages }),
        });

        if (response.ok) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            output.innerText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                output.innerText += chunk;

                await delayTextSpeed(150);
            }

            btn.disabled = false;
            messages.push(["ai", output.innerText]);
            localStorage.setItem("chatHistory", JSON.stringify(messages));
        } else {
            console.error("Error:", response.statusText);
            output.innerText = "Error: " + response.statusText;
        }
    } catch (error) {
        console.error("Error:", error);
        output.innerText = "Error: " + error.message;
    }
});

loadChatHistory()