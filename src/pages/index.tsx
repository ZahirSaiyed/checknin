import { useState } from 'react';
import Head from 'next/head';
import { NextPage } from 'next';

const Home: NextPage = () => {
  const [textValue, setTextValue] = useState('');
  const [numberValue, setNumberValue] = useState<number | null>(null);
  const [output, setOutput] = useState('');
  const [apiOutput, setApiOutput] = useState<string>('');
  
  const callGenerateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Calling OpenAI...");
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput: textValue }),
    });
  
    const data = await response.json();
    const { output } = data;
    console.log("OpenAI replied...", output.text);
  
    setApiOutput(`${output.text}`);
  };
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOutput(`Description: ${textValue}, Rating: ${numberValue}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <Head>
        <title>Check-N-In</title>
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-white text-4xl font-bold">Check-N-In</h1>
        <p className="text-white mt-4">
          How was your day today? Rate your day out of 10
        </p>
        <form onSubmit={(e) => callGenerateEndpoint(e)} className="mt-8">
          <input
            className="block w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-20 rounded p-2 focus:outline-none focus:border-white"
            type="text"
            placeholder="Enter text here"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
          />
          <input
            className="block w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-20 rounded p-2 focus:outline-none focus:border-white mt-4"
            type="number"
            min="1"
            max="10"
            step="0.01"
            placeholder="Enter a number between 1 and 10"
            onChange={(e) => setNumberValue(parseFloat(e.target.value))}
          />
          <button
            className="mt-4 bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
            type="submit"
          >
            Submit
          </button>
        </form>
        {output && (
          <div className="mt-8 bg-white bg-opacity-20 text-white p-4 rounded">
            <p>{output}</p>
          </div>
        )}

{apiOutput && (
        <div className="output">
          <div className="output-header-container">
            <div className="output-header">
              <h3>Friend</h3>
            </div>
          </div>
          <div className="output-content">
            <p>{apiOutput}</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Home;