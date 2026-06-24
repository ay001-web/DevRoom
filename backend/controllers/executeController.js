const axios = require('axios');

// Multiple free Piston mirror instances — if one is rate-limited, try the next
const PISTON_ENDPOINTS = [
  'https://emkc.org/api/v2/piston/execute',
  'https://piston.rerun.im/api/v2/piston/execute',
];

const LANGUAGE_MAP = {
  javascript: 'javascript', python: 'python', java: 'java',
  cpp: 'cpp', c: 'c', typescript: 'typescript',
  go: 'go', rust: 'rust', php: 'php', ruby: 'ruby',
};

const FILE_NAMES = {
  javascript: 'main.js', python: 'main.py', java: 'Main.java',
  cpp: 'main.cpp', c: 'main.c', typescript: 'main.ts',
  go: 'main.go', rust: 'main.rs', php: 'main.php', ruby: 'main.rb',
};

const FALLBACK_VERSIONS = {
  javascript: '18.15.0', python: '3.10.0', java: '15.0.2',
  cpp: '10.2.0', c: '10.2.0', typescript: '5.0.3',
  go: '1.16.2', rust: '1.68.2', php: '8.2.3', ruby: '3.0.1',
};

// Try each endpoint, with retries on each, before giving up
async function executeWithFallback(payload) {
  let lastErr;
  for (const endpoint of PISTON_ENDPOINTS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await axios.post(endpoint, payload, {
          timeout: 12000,
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data; // success — stop here
      } catch (err) {
        lastErr = err;
        const status = err.response?.status;
        if (status === 401 || status === 429 || status === 503 || !status) {
          await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
          continue; // retry same endpoint once more
        }
        break; // non-retryable error on this endpoint — move to next endpoint
      }
    }
    // this endpoint failed after retries — try next endpoint in the list
  }
  throw lastErr;
}

// POST /api/execute
exports.executeCode = async (req, res) => {
  const { code, language, input = '' } = req.body;
  if (!code) return res.status(400).json({ message: 'Code required' });

  const pistonLang = LANGUAGE_MAP[language] || 'javascript';
  const fileName    = FILE_NAMES[language] || 'main.js';

  try {
    const result = await executeWithFallback({
      language: pistonLang,
      version:  FALLBACK_VERSIONS[pistonLang],
      files: [{ name: fileName, content: code }],
      stdin: input,
      compile_timeout: 10000,
      run_timeout: 5000,
    });

    if (result.message) throw new Error(result.message);

    const stdout     = result.run?.stdout || '';
    const stderr      = result.run?.stderr || '';
    const compileErr = result.compile?.stderr || '';
    const output      = (compileErr || stderr || stdout || '').trim();

    return res.json({
      success:  true,
      output:   output || 'Program executed with no output.',
      time:     '—',
      memory:   '—',
      status:   result.run?.code === 0 ? 'Success' : 'Runtime Error',
      exitCode: result.run?.code,
    });

  } catch (err) {
    const status = err.response?.status;
    console.error('❌ All execution endpoints failed:', status || '', err.response?.data || err.message);

    return res.json({
      success: true,
      mock: true,
      output: getMockOutput(language, code),
      time: '—', memory: '—',
      status: 'Simulated Output',
      note: 'Live code execution services are busy right now. Showing simulated output based on your code.'
    });
  }
};

function getMockOutput(language, code) {
  const patterns = {
    javascript: /console\.log\(["'`](.+?)["'`]\)/g,
    python:     /print\(["'](.+?)["']\)/g,
    java:       /System\.out\.println\(["'](.+?)["']\)/g,
    cpp:        /cout\s*<<\s*["'](.+?)["']/g,
  };
  const pattern = patterns[language] || patterns.javascript;
  const matches = [...code.matchAll(pattern)];
  if (matches.length > 0) return matches.map(m => m[1]).join('\n');
  return 'Program executed successfully.';
}
