import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

const ShareButton = () => {
  const [copied, setCopied] = useState(false);
  const [podLink, setPodLink] = useState("");

  const generatePodLink = () => {
    // Replace with code that generates a unique pod link for the user
    const link = "https://example.com/pod/1234";
    setPodLink(link);
    setCopied(false);
  };

  return (
    <div className="relative">
      <button
        className="bg-white text-purple-500 font-bold py-2 px-4 rounded hover:bg-opacity-80 transition duration-150 ease-in-out"
        onClick={generatePodLink}
      >
        Generate Share Link
      </button>
      {podLink && (
        <div className="absolute top-full left-0 bg-white bg-opacity-90 rounded shadow-lg p-2 mt-2">
          <span className="text-gray-700 text-sm">{podLink}</span>
          <CopyToClipboard text={podLink} onCopy={() => setCopied(true)}>
            <button className="ml-2 bg-purple-500 text-white font-bold py-1 px-2 rounded hover:bg-opacity-80 transition duration-150 ease-in-out">
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </CopyToClipboard>
        </div>
      )}
    </div>
  );
};

export default ShareButton;