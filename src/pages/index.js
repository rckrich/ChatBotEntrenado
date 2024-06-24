import { useState } from "react";
import { Inter } from "next/font/google";
import TypingAnimation from "../components/TypingAnimation";
import { AssistantManager } from "../pages/api/assistant_manager.js";
import { TypeAnimation } from "react-type-animation";

let assistant;
let threadPosition = 0;
let isWaiting = true;
let UpdateChatLog;
let assistantManager;

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
    try {
      if (assistantManager != null) {
        UserResponse(inputValue);
      }
    } catch (error) {
      console.error(error);
    }
  };

  function handleFileChange(event) {
    setFile(event.target.files[0]);
    console.log(file);
  }

  async function handleFileSend(event) {
    const fileOpenAi = await openai.files.create({
      file: file,
      purpose: "assistants",
    });

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
    <div className="bg-neutral-800">
      <div className="container mx-auto max-w-[1000px]">
        <div className="flex flex-col min-h-screen bg-neutral-900">
          <div
            id="uploadFile"
            style={{ display: "none" }}
            className="mt-5 mr-5 ml-5 static bg-neutral-1000 rounded"
          >
            <input
              className="block w-11/12 text-sm text-gray-900 border border-purple-500 rounded-lg cursor-pointer bg-purple-500 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 ml-5 mt-3 mr-5"
              id="file_input"
              type="file"
              onChange={handleFileChange}
            />
            <button
              className=" bg-gray-600 hover:bg-gray-50 text-black font-bold py-2 px-4 rounded-md mt-3 mb-5 ml-5"
              onClick={handleFileSend}
            >
              Enviar
            </button>
          </div>
          <h1 className="bg-gradient-to-r from-orange-700 to-red-500 text-transparent bg-clip-text text-center py-3 font-bold text-3xl">
            Asistente INEGI
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
                      message.type === "user" ? "bg-neutral-700" : "bg-gray-800"
                    } rounded-3xl p-4 text-white max-w-sm`}
                  >
                    <TypeAnimation
                      sequence={message.message}
                      speed={50}
                      repeat={0}
                      cursor={false}
                    />
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
            <div className="flex rounded-full border border-gray-700 bg-gray-800">
              <button
                type="button"
                className=" bg-gray-600 rounded-full hover:bg-gray-50 transition-colors duration-300 ml-3 mt-1 mb-1"
                onClick={onClickShow}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5 content-center mt-2 mb-2 mr-2.5 ml-2.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <input
                type="text"
                className="flex-grow px-4 py-2 bg-transparent text-white focus:outline-none"
                placeholder="Envía tu mensaje al D&D chatbot"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                type="submit"
                className=" bg-gray-600 rounded-full hover:bg-gray-50 transition-colors duration-300 mr-3 mt-1 mb-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                  stroke="currentColor"
                  className="fill-current w-4 h-4 m-3 content-center"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function onClickShow() {
  const element = document.getElementById("uploadFile");
  if (element.style.display == "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}

async function UserResponse(_inputValue) {
  //Open "thinking" animation
  isWaiting = true;

  //Send message to assistant manager
  await assistantManager.add_message_to_thread("user", _inputValue);

  //Run thread
  await assistantManager.run_assistant();

  //Wait for completion
  await assistantManager.wait_for_completion();

  //Get last message
  let last_message = await assistantManager.process_message();
  UpdateChatLog(last_message);

  //Close "thinking" animation
  isWaiting = false;

  //Print run steps
  await assistantManager.run_steps();
}

async function main() {
  console.log("Starting Main");
  try {
    //Open "thinking" animation
    isWaiting = true;

    assistantManager = new AssistantManager();

    //Initialize Assistant
    await assistantManager.initialize("gpt-4o");
    console.log(assistantManager.assistant.id);

    //Create thread if null
    if (assistantManager.thread === null) {
      await assistantManager.create_thread();
      console.log(assistantManager.thread.id);
    }

    //Create first message for the context of the chat
    await assistantManager.add_message_to_thread(
      "user",
      "Dame la bienvenida de forma amable y explicame que puedes hacer."
    );

    //Run thread
    await assistantManager.run_assistant();

    //Wait for completion
    await assistantManager.wait_for_completion();

    //Get last message
    let last_message = await assistantManager.process_message();

    //Update chat message
    UpdateChatLog(last_message);

    //Close "thinking" animation
    isWaiting = false;

    //Print run steps
    await assistantManager.run_steps();
  } catch (error) {
    console.error(error);
  }
}

// Call the main function
main();
