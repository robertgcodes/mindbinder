import React, { useState } from 'react';
import { Code } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ block, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(block.config?.title || '');
  const [code, setCode] = useState(block.config?.code || '');
  const [language, setLanguage] = useState(block.config?.language || 'javascript');

  const handleSave = () => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        title,
        code,
        language
      }
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter code block title"
          className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="csharp">C#</option>
          <option value="php">PHP</option>
          <option value="ruby">Ruby</option>
          <option value="swift">Swift</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="sql">SQL</option>
          <option value="bash">Bash</option>
          <option value="plaintext">Plain Text</option>
        </select>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your code here"
          className="w-full p-2 mb-2 bg-gray-700 text-white rounded font-mono min-h-[200px]"
        />
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <div 
      className="p-4 bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-center gap-2 mb-2">
        <Code size={20} className="text-blue-400" />
        <h3 className="text-lg font-semibold text-white">{title || 'Untitled Code Block'}</h3>
      </div>
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: '0.375rem',
            background: '#1f2937'
          }}
        >
          {code || '// No code yet. Click to edit.'}
        </SyntaxHighlighter>
        <div className="absolute top-2 right-2 text-xs text-gray-400">
          {language}
        </div>
      </div>
    </div>
  );
};

export default CodeBlock; 