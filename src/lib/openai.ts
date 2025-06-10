// import { openai } from '@/lib/openai';
import { AzureOpenAI } from "openai";

const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = "2024-04-01-preview";
const endpoint = "https://natth-mbg2ti2x-swedencentral.cognitiveservices.azure.com/";
const deployment = "gpt-4.1";
const options = { endpoint, apiKey, deployment, apiVersion }

const openai = new AzureOpenAI(options);

export default openai;