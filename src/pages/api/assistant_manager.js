import OpenAI from "openai";
import { GetTotalPopulation } from "./_inegi.js";

const secretKey = "";
const client = new OpenAI({
  apiKey: secretKey,
  dangerouslyAllowBrowser: true,
});

let thread_id = "";
let assistant_id = "asst_OnxH5K3YcN3eWa5w4HD1ldj1";
let vectorStore_id = "vs_EpkJumMK2P9UG2N3Z6jd2rSK";

async function get_total_population() {
  const response = await GetTotalPopulation();
  return response;
}

export class AssistantManager {
  async initialize(model) {
    this.client = client;
    this.model = model;
    this.assistant = null;
    this.thread = null;
    this.run = null;
    this.vectorStore = null;

    //Retrieve existing assistant and thread if ID are already
    if (assistant_id != "") {
      this.assistant = await this.client.beta.assistants.retrieve(assistant_id);
      assistant_id = this.assistant.id;
    }

    if (thread_id != "") {
      this.thread = await this.client.beta.threads.retrieve(thread_id);
      thread_id = this.thread.id;
    }

    if (vectorStore_id != "") {
      this.vectorStore = await this.client.beta.vectorStores.retrieve(
        vectorStore_id
      );
      vectorStore_id = this.vectorStore.id;
    }
  }

  async create_assistant(name, instructions, tools) {
    if (this.assistant === null) {
      let assistant_obj = await this.client.beta.assistants.create(
        name,
        instructions,
        tools,
        this.model
      );

      assistant_id = assistant_obj.id;
      this.assistant = assistant_obj;
      console.log("Created assistant with id: " + assistant_id);
    }
  }

  async create_thread() {
    if (this.thread === null) {
      let thread_obj = await this.client.beta.threads.create();
      thread_id = thread_obj.id;
      this.thread = thread_obj;
      console.log("Created thread with id: " + thread_id);
    }
  }

  async add_message_to_thread(_role, _content) {
    if (this.thread) {
      await this.client.beta.threads.messages.create(this.thread.id, {
        role: _role,
        content: _content,
      });
    }
  }

  async run_assistant(_instructions) {
    if (this.thread && this.assistant) {
      this.run = await this.client.beta.threads.runs.create(this.thread.id, {
        assistant_id: this.assistant.id,
        instructions: _instructions,
      });
    }
  }

  async process_message() {
    if (this.thread) {
      let messages = await this.client.beta.threads.messages.list(
        this.thread.id
      );
      let last_message = messages.data[0];
      let response = last_message.content[0].text.value;
      return response;
    }
  }

  async call_required_functions(required_actions) {
    let tool_outputs_body = {
      tool_outputs: [],
    };
    let functionName;
    let output;

    for (let i = 0; i < required_actions.length; i++) {
      functionName = required_actions[i].function.name;

      if (functionName == "get_total_population") {
        const output = await get_total_population();
        console.log(output);
        tool_outputs_body.tool_outputs.push({
          tool_call_id: required_actions[i].id,
          output: output,
        });
      } else {
        throw new Error("Unknown function: " + func_name);
      }
    }

    await this.client.beta.threads.runs.submitToolOutputs(
      this.thread.id,
      this.run.id,
      tool_outputs_body
    );
  }

  async wait_for_completion() {
    if (this.thread && this.run) {
      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        let run_status = await this.client.beta.threads.runs.retrieve(
          this.thread.id,
          this.run.id
        );
        console.log("Run status: " + { run_status });
        if (run_status.status === "completed") {
          await this.process_message();
          break;
        } else if (run_status.status === "requires_action") {
          console.log("FUNCTION CALLING NOW...");
          await this.call_required_functions(
            run_status.required_action.submit_tool_outputs.tool_calls
          );
        }
      }
    }
  }

  async run_steps() {
    let run_steps = this.client.beta.threads.runs.steps.list(
      this.thread.id,
      this.run.id
    );
    console.log("Run-Steps: " + { run_steps });
    return run_steps.data;
  }

  async handle_file_send(fileData) {
    const fileOpenAi = await this.client.files.create({
      file: fileData,
      purpose: "assistants",
    });

    await this.client.beta.vectorStores.files.create(this.vectorStore.id, {
      file_id: fileOpenAi.id,
    });

    await this.client.beta.assistants.update(assistant.id, {
      tool_resources: {
        file_search: { vector_store_ids: [this.vectorStore.id] },
      },
    });

    return fileData.name;
  }
}
