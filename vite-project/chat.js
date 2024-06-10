const messageBar = document.querySelector(".bar-wrapper input");
const sendBtn = document.querySelector(".bar-wrapper button");
const messageBox = document.querySelector(".message-box");

sendBtn.onclick = function () {
  if(isWaiting){
    return;
  }

  if(messageBar.value.length > 0){
    const UserTypedMessage = messageBar.value;
    messageBar.value = "";

    let message =
    `<div class="chat message">
    <img src="img/user.jpg">
    <span>
      ${UserTypedMessage}
    </span>
  </div>`;

    messageBox.insertAdjacentHTML("beforeend", message);
    askOpenAi(UserTypedMessage)
    isWaiting = true;
    CheckForAnswer();
    threadPosition++;
    
  }
}

import OpenAI from "openai";
import dotenv from 'dotenv';

let thread;
let run;
let assistant;
let threadPosition = 0;
let isWaiting = false;

// Create a OpenAI connection
const secretKey = "";
const openai = new OpenAI({
  apiKey: secretKey,
  dangerouslyAllowBrowser: true 
});

async function askOpenAi(userQuestion){
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: userQuestion,
  });

  run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });
}

async function CheckForAnswer(){
  

    // Use runs to wait for the assistant response and then retrieve it
    

    let runStatus = await openai.beta.threads.runs.retrieve(
      thread.id,
      run.id
    );

    // Polling mechanism to see if runStatus is completed
    // This should be made more robust.
    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }
    // Get the last assistant message from the messages array

    while(isWaiting){
      const messages = await openai.beta.threads.messages.list(thread.id);
        const lastMessageForRun = messages.data
        .filter(
          (message) => message.run_id === run.id && message.role === "assistant"
        )



        if(messages.data.length > threadPosition){
            if (lastMessageForRun[0].content.length == 1) {
              let response =

                `<div class="chat response">
                <img src="img/chatbot.jpg">
                  <span>
                ${lastMessageForRun[0].content[0].text.value}
                  </span>
                </div>`

              messageBox.insertAdjacentHTML("beforeend", response);

              isWaiting = false;
              threadPosition++;
            }
        }
    }


    // Find the last message for the current run
}

async function main() {

  try {
    assistant = await openai.beta.assistants.retrieve(
        "asst_R0W2WQSuBcgMuuW9fgl18qxm"
    );   // Log the first greeting

    // Create a thread
    thread = await openai.beta.threads.create();

    run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    isWaiting = true;
    CheckForAnswer();

  }
  catch (error) {
    console.error(error);
  }
}

// Call the main function
main();