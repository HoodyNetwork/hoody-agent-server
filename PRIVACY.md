# Hoody Code Privacy Policy

**Last Updated: July 22, 2025**

Hoody Code is built with a **privacy-first approach**. We believe your code, prompts, and development work should remain private by default. This policy explains exactly what data goes where—and more importantly, what doesn't.

## 🔒 Our Privacy Principles

1. **Privacy by Default** - Telemetry is **disabled by default**. No data collection unless you explicitly opt-in.
2. **Local-First** - Your code, files, and API keys stay on your machine
3. **Your Choice of AI** - You control which AI provider processes your data
4. **Full Transparency** - Clear documentation of what data flows where
5. **No Vendor Lock-in** - Use local models to avoid sending data anywhere

---

## 📊 Telemetry: Disabled by Default

**Telemetry Status: DISABLED BY DEFAULT**

When you first install Hoody Code, **no telemetry data is collected**. The `telemetrySetting` defaults to `"disabled"`.

**What This Means:**
- ✅ No anonymous usage statistics sent to Hoody
- ✅ No event tracking
- ✅ No analytics
- ✅ Complete privacy out of the box

**If You Choose to Opt-In:**
- Anonymous usage patterns (e.g., which tools are used most)
- Error reports (to help us fix bugs)
- **Never includes:** Your code, prompts, file contents, API keys, or any personally identifiable information

**How to Verify:**
```bash
# Start server with debug flag to see what's transmitted
node dist/index.js serve --debug
```

---

## 🌐 Where Your Data Goes (And Where It Doesn't)

### **To Your Chosen AI Provider** (Required for AI Features)

When you use AI-powered features, these data types are sent to your chosen provider:

- **Code & Files**: Relevant files from your local machine needed for context
- **Commands**: Code context from terminal commands when using AI features
- **Prompts**: Your questions and instructions to the AI

**AI Providers:** Anthropic, OpenAI, Google Gemini, OpenRouter, AWS Bedrock, Azure, Ollama, LM Studio, etc.

**Important:** We do not have access to this data. Each AI provider has their own privacy policy:
- [Anthropic Privacy Policy](https://www.anthropic.com/legal/privacy)
- [OpenAI Privacy Policy](https://openai.com/policies/privacy-policy)
- [Google Privacy Policy](https://policies.google.com/privacy)
- [OpenRouter Privacy](https://openrouter.ai/privacy)

### **API Keys & Credentials** (Stored Locally Only)

- ✅ Stored in your local configuration files
- ✅ Only transmitted to your chosen AI provider for authentication
- ❌ Never sent to Hoody or any third party
- ❌ Never logged or transmitted in telemetry

### **To Hoody** (Only If You Opt-In)

If you enable telemetry, only anonymous usage statistics are sent:
- Which tools/features are used (e.g., "user created a task")
- Error types and frequencies (to help us fix bugs)
- Performance metrics (response times, token usage)

**Never Included:**
- ❌ Your code or file contents
- ❌ Your prompts or AI conversations
- ❌ Your API keys or credentials
- ❌ File paths or project structure
- ❌ Any personally identifiable information

---

## 🏠 Run Completely Offline

**Want zero data transmission?** Use local AI models:

```json
{
  "apiProvider": "ollama",
  "ollamaModelId": "llama3.1:70b"
}
```

**Supported Local Providers:**
- **Ollama** - Easy local model hosting
- **LM Studio** - User-friendly local AI
- **Any OpenAI-compatible endpoint** - Full control over your infrastructure

When using local models, **no data ever leaves your machine**.

---

## 🔍 Transparency & Control

### **Your Choices & Control**

- ✅ Run models locally to prevent any external data transmission
- ✅ Enable `--debug` flag to see exactly what's being sent
- ✅ Opt-in or opt-out of telemetry at any time through settings
- ✅ Choose your AI provider based on their privacy policies
- ✅ Self-host on your own infrastructure for maximum control

### **Audit & Verification**

You can verify our privacy claims by:
1. **Inspecting the code** - We're fully open source
2. **Running with `--debug`** - See all network requests in real-time
3. **Network monitoring** - Use tools like Wireshark to verify data flows
4. **Local-only mode** - Use Ollama/LM Studio with no internet connection

---

## 🛡️ Security & Updates

We take reasonable measures to secure your data, but no system is 100% secure. If our privacy policy changes, we will notify you within the extension and update this document.

---

## 📧 Contact Us

For any privacy-related questions or concerns:
- **Email:** support@hoody.com
- **Discord:** [Join our community](https://discord.social.hoody.com)
- **GitHub:** [Open an issue](https://github.com/HoodyNetwork/hoody-agent-server/issues)

---

**By using Hoody Code, you agree to this Privacy Policy.**

---

<p align="center">
  <b>🔒 Privacy First. Always.</b>
  <br>
  <i>Your code is yours. We don't want it, need it, or collect it.</i>
</p>

### **Security & Updates**

We take reasonable measures to secure your data, but no system is 100% secure. If our privacy policy changes, we will notify you within the extension.

### **Contact Us**

For any privacy-related questions, soon you can reach out to us at support@hoody.com.

---

By using Hoody Code, you agree to this Privacy Policy.
