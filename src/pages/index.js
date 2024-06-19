import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import axios from "axios";
import TypingAnimation from "../components/TypingAnimation";
import OpenAI from "openai";
import { GetTotalPopulation } from "../pages/api/_inegi.js";

let thread;
let run;
let assistant;
let threadPosition = 0;
let isWaiting = true;
let UpdateChatLog;

const secretKey = "";
const openai = new OpenAI({
  apiKey: secretKey,
  dangerouslyAllowBrowser: true,
});

async function get_total_population() {
  const response = await GetTotalPopulation();
  return response;
}

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [file, setFile] = useState();

  const handleSubmit = (event) => {
    if (isWaiting) {
      return;
    }
    event.preventDefault();
    setChatLog((prevChatLog) => [
      ...prevChatLog,
      { type: "user", message: inputValue },
    ]);
    threadPosition++;
    sendMessage(inputValue);
    setInputValue("");
  };
  const sendMessage = (message) => {
    askOpenAi(inputValue);
    isWaiting = true;
    CheckForAnswer();
  };
  /*const sendMessage = (message) => {
    const url = '/api/chat';

    const data = {
      model: "gpt-3.5-turbo-0301",
      messages: [{ "role": "user", "content": message }]
    };
    
   

    axios.post(url, data).then((response) => {
      console.log(response);
      setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: response.data.choices[0].message.content }])
      setIsLoading(false);
    }).catch((error) => {
      setIsLoading(false);
      console.log(error);
    })
  }*/
  function handleFileChange(event) {
    setFile(event.target.files[0]);
    console.log(file);
  }
  //<input className="block w-11/12 text-sm text-gray-900 border border-purple-500 rounded-lg cursor-pointer bg-purple-500 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 ml-5 mr-5 mb-5" id="name_input" type="text" value={filename} onChange={e => setFilename(e.target.value)}/>
  async function handleFileSend(event) {
    const fileOpenAi = await openai.files.create({
      file: file,
      purpose: "assistants",
    });
    //await openai.beta.vectorStores.fileBatches.uploadAndPoll("vs_9D7siGuHRgxjMBWgKVZzFfzm", fileOpenAi);
    const myVectorStoreFile = await openai.beta.vectorStores.files.create(
      "vs_9D7siGuHRgxjMBWgKVZzFfzm",
      {
        file_id: fileOpenAi.id,
      }
    );
    await openai.beta.assistants.update(assistant.id, {
      tool_resources: {
        file_search: { vector_store_ids: ["vs_9D7siGuHRgxjMBWgKVZzFfzm"] },
      },
    });
    const element = document.getElementById("uploadFile");
    element.remove();
    UpdateChatLog(`Se subió el archivo con el nombre ${file.name}`);
  }
  UpdateChatLog = (message2) => {
    setChatLog((prevChatLog) => [
      ...prevChatLog,
      { type: "bot", message: message2 },
    ]);
  };
  return (
    <div className="container mx-auto max-w-[700px]">
      <div className="flex flex-col min-h-screen bg-gray-900">
        <div
          id="uploadFile"
          className="mt-5 mr-5 ml-5 static bg-slate-500 rounded"
        >
          <input
            className="block w-11/12 text-sm text-gray-900 border border-purple-500 rounded-lg cursor-pointer bg-purple-500 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 ml-5 mt-3 mr-5"
            id="file_input"
            type="file"
            onChange={handleFileChange}
          />
          <button
            className="bg-purple-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mt-3 mb-5 ml-5"
            onClick={handleFileSend}
          >
            Enviar
          </button>
        </div>
        <h1 className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text text-center py-3 font-bold text-6xl">
          D&D
        </h1>
        <div className="flex-grow p-6">
          <div className="flex flex-col space-y-4">
            {chatLog.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`${
                    message.type === "user" ? "bg-purple-500" : "bg-gray-800"
                  } rounded-lg p-4 text-white max-w-sm`}
                >
                  {message.message}
                </div>
              </div>
            ))}
            {isWaiting && (
              <div key={chatLog.length} className="flex justify-start">
                <div className="bg-gray-800 rounded-lg p-4 text-white max-w-sm">
                  <TypingAnimation />
                </div>
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex-none p-6">
          <div className="flex rounded-lg border border-gray-700 bg-gray-800">
            <input
              type="text"
              className="flex-grow px-4 py-2 bg-transparent text-white focus:outline-none"
              placeholder="Escribe tú mensaje..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              className="bg-purple-500 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none hover:bg-purple-600 transition-colors duration-300"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

async function CallRequiredFunctions(required_actions) {
  let tool_outputs = [];
  let functionName;
  let output;
  let final_str;

  for (let i = 0; i < required_actions.length; i++) {
    functionName = required_actions[i].function.name;

    if (functionName == "get_total_population") {
      output = get_total_population();
      console.log("Function Calling output: " + output);
      final_str = "";

      for (let i = 0; i < output.length; i++) {
        final_str += "".join(output[i]);
      }

      tool_outputs.push({
        tool_call_id: required_actions[i].id,
        output: final_str,
      });
    } else {
      throw new Error("Unknown function: " + func_name);
    }
  }

  await openai.beta.threads.runs.submit_tool_outputs(
    thread.id,
    run.id,
    tool_outputs
  );
}

async function CheckForAnswer() {
  isWaiting = true;
  // Use runs to wait for the assistant response and then retrieve it

  let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

  // Polling mechanism to see if runStatus is completed
  // This should be made more robust.
  while (runStatus.status !== "completed") {
    if (runStatus.status !== "requires_action") {
      console.log("FUNCTION CALLING NOW...");
      CallRequiredFunctions(
        runStatus.required_action.submit_tool_outputs.tool_calls
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }
  // Get the last assistant message from the messages array

  while (isWaiting) {
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessageForRun = messages.data.filter(
      (message) => message.run_id === run.id && message.role === "assistant"
    );

    if (messages.data.length > threadPosition) {
      if (lastMessageForRun[0].content.length == 1) {
        /* let response =

              `<div class="chat response">
              <img src="img/chatbot.jpg">
                <span>
              ${lastMessageForRun[0].content[0].text.value}
                </span>
              </div>`

            messageBox.insertAdjacentHTML("beforeend", response);*/
        console.log(messages.data);
        UpdateChatLog(lastMessageForRun[0].content[0].text.value);
        isWaiting = false;
        threadPosition++;
      }
    }
  }

  // Find the last message for the current run
}

async function main() {
  console.log("Main");
  const response = await get_total_population();
  console.log(response);
  /*try {
    assistant = await openai.beta.assistants.retrieve(
      "asst_R0W2WQSuBcgMuuW9fgl18qxm"
    ); // Log the first greeting

    // Create a thread
    thread = await openai.beta.threads.create();

    run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    isWaiting = true;
    CheckForAnswer();
  } catch (error) {
    console.error(error);
  }
}
async function askOpenAi(userQuestion) {
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: userQuestion,
  });

  run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });*/
}

// Call the main function
main();
