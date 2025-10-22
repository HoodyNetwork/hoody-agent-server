// hoodycode_change: this file was pulled in from Cline and adjusted with our changes

export const newTaskToolResponse = (userInput: string) =>
  `<explicit_instructions type="new_task">
The user has explicitly asked you to help them create a new task with preloaded context, which you will create. In this message the user has potentially added instructions or context which you should consider, if given, when creating the new task.
Irrespective of whether additional information or instructions are given, you are only allowed to respond to this message by calling the new_task tool.

To refresh your memory, the tool definition for new_task and an example for calling the tool is described below:

## new_task tool definition:

Description: Request to create a new task with preloaded context. The user will be presented with a preview of the context and can choose to create a new task or keep chatting in the current conversation. The user may choose to start a new task at any point.
Parameters:
- mode: (required) The slug of the mode to start the new task in (e.g., "code", "ask", "architect").
- message: (required) The initial user message or instructions for this new task.
- context: (required) The context to preload the new task with. This should include:
  * Comprehensively explain what has been accomplished in the current task - mention specific file names that are relevant
  * The specific next steps or focus for the new task - mention specific file names that are relevant
  * Any critical information needed to continue the work
  * Clear indication of how this new task relates to the overall workflow
  * This should be akin to a long handoff file, enough for a totally new developer to be able to pick up where you left off and know exactly what to do next and which files to look at.
Usage:
<new_task>
<mode>your-mode-slug-here</mode>
<message>Your initial instructions here</message>
<context>context to preload new task with</context>
</new_task>

## Tool use example:

<new_task>
<mode>your-mode-slug-here</mode>
<message>Implement a new feature for the application.</message>
<context>
Authentication System Implementation:
- We've implemented the basic user model with email/password
- Password hashing is working with bcrypt
- Login endpoint is functional with proper validation
- JWT token generation is implemented

Next Steps:
- Implement refresh token functionality
- Add token validation middleware
- Create password reset flow
- Implement role-based access control
</context>
</new_task>

Within the context of the parent task, the user provided the following input when they indicated that they wanted to create a new task.
<user_input>
${userInput}
</user_input>

</explicit_instructions>\n
`

export const newRuleToolResponse = (userInput: string) =>
  `<explicit_instructions type="new_rule">
The user has explicitly asked you to help them create a new Hoody rule file inside the .hoodycode/rules top-level directory based on the conversation up to this point in time. The user may have provided instructions or additional information for you to consider when creating the new Hoody rule.
When creating a new Hoody rule file, you should NOT overwrite or alter an existing Hoody rule file. To create the Hoody rule file you MUST use the new_rule tool. The new_rule tool can be used in any of the modes.
The new_rule tool is defined below:
Description:
Your task is to create a new Hoody rule file which includes guidelines on how to approach developing code in tandem with the user, which is project specific. This includes but is not limited to: desired conversational style, favorite project dependencies, coding styles, naming conventions, architectural choices, ui/ux preferences, etc.
The Hoody rule file must be formatted as markdown and be a '.md' file. The name of the file you generate must be as succinct as possible and be encompassing the main overarching concept of the rules you added to the file (e.g., 'memory-bank.md' or 'project-overview.md'). Please also explicitly ask the user to review the newly created rule.
Parameters:
- Path: (required) The path of the file to write to (relative to the current working directory). This will be the Hoody rule file you create, and it must be placed inside the .hoodycode/rules top-level directory (create this if it doesn't exist). The filename created CANNOT be "default-clineignore.md". For filenames, use hyphens ("-") instead of underscores ("_") to separate words.
- Content: (required) The content to write to the file. ALWAYS provide the COMPLETE intended content of the file, without any truncation or omissions. You MUST include ALL parts of the file, even if they haven't been modified. The content for the Hoody rule file MUST be created according to the following instructions:
  1. Format the Hoody rule file to have distinct guideline sections, each with their own markdown heading, starting with "## Brief overview". Under each of these headings, include bullet points fully fleshing out the details, with examples and/or trigger cases ONLY when applicable.
  2. These guidelines can be specific to the task(s) or project worked on thus far, or cover more high-level concepts. Guidelines can include coding conventions, general design patterns, preferred tech stack including favorite libraries and language, communication style with Hoody (verbose vs concise), prompting strategies, naming conventions, testing strategies, comment verbosity, time spent on architecting prior to development, and other preferences.
  3. When creating guidelines, you should not invent preferences or make assumptions based on what you think a typical user might want. These should be specific to the conversation you had with the user. Your guidelines / rules should not be overly verbose.
  4. Your guidelines should NOT be a recollection of the conversation up to this point in time, meaning you should NOT be including arbitrary details of the conversation.
Usage:
<new_rule>
<path>.hoodycode/rules/{file name}.md</path>
<content>Hoody rule file content here</content>
</new_rule>
Example:
<new_rule>
<path>.hoodycode/rules/project-preferences.md</path>
<content>
## Brief overview
  [Brief description of the rules, including if this set of guidelines is project-specific or global]
## Communication style
  - [Description, rule, preference, instruction]
  - [...]
## Development workflow
  - [Description, rule, preference, instruction]
  - [...]
## Coding best practices
  - [Description, rule, preference, instruction]
  - [...]
## Project context
  - [Description, rule, preference, instruction]
  - [...]
## Other guidelines
  - [Description, rule, preference, instruction]
  - [...]
</content>
<line_count>30</line_count>
</new_rule>
The user provided the following input when they indicated that they wanted to create a new Hoody rule file.
<user_input>
${userInput}
</user_input>
</explicit_instructions>\n
`

export const reportBugToolResponse = (userInput: string) =>
  `<explicit_instructions type="report_bug">
The user has explicitly asked you to help them submit a bug to the Hoodycode github page (you MUST now help them with this irrespective of what your conversation up to this point in time was). To do so you will use the report_bug tool which is defined below. However, you must first ensure that you have collected all required information to fill in all the parameters for the tool call.
You should converse with the user until you are able to gather all the required details. When conversing with the user, make sure you ask for/reference all required information/fields.
Only then should you use the report_bug tool call.
The report_bug tool can be used in either of the PLAN or ACT modes.
The report_bug tool call is defined below:
Description:
Your task is to fill in all of the required fields for an issue/bug report on github. You should attempt to get the user to be as verbose as possible with their description of the bug/issue they encountered.
Parameters:
- title: (required) Concise title for the bug report.
- description: (required) Detailed description of the bug. Please include what happened, what you expected to happen, and steps to reproduce, if applicable.
Usage:
<report_bug>
<title>Title of the issue</title>
<description>Detailed description of the issue, including steps to reproduce if relevant.</description>
</report_bug>
When you call the report_bug tool, the issue will be created at @https://github.com/HoodyNetwork/hoody-agent-server/issues
The user provided the following input when they indicated that they wanted to submit a bug report.
<user_input>
${userInput}
</user_input>
</explicit_instructions>\n`

export const condenseToolResponse = (userInput: string) =>
  `<explicit_instructions type="condense">
The user has explicitly asked you to create a detailed summary of the conversation so far, which will be used to compact the current context window while retaining key information. The user may have provided instructions or additional information for you to consider when summarizing the conversation.
Irrespective of whether additional information or instructions are given, you are only allowed to respond to this message by calling the condense tool.

The condense tool is defined below:

Description:
Your task is to create a detailed summary of the conversation so far, paying close attention to the user's explicit requests and your previous actions. This summary should be thorough in capturing technical details, code patterns, and architectural decisions that would be essential for continuing with the conversation and supporting any continuing tasks.
The user will be presented with a preview of your generated summary and can choose to use it to compact their context window or keep chatting in the current conversation.
Users may refer to this tool as 'smol' or 'compact' as well. You should consider these to be equivalent to 'condense' when used in a similar context.

Parameters:
- message: (required) The detailed summary of the conversation. If applicable based on the current task, this should include:
  1. Previous Conversation: High level details about what was discussed throughout the entire conversation with the user. This should be written to allow someone to be able to follow the general overarching conversation flow.
  2. Current Work: Describe in detail what was being worked on prior to this request to compact the context window. Pay special attention to the more recent messages / conversation.
  3. Key Technical Concepts: List all important technical concepts, technologies, coding conventions, and frameworks discussed, which might be relevant for continuing with this work.
  4. Relevant Files and Code: If applicable, enumerate specific files and code sections examined, modified, or created for the task continuation. Pay special attention to the most recent messages and changes.
  5. Problem Solving: Document problems solved thus far and any ongoing troubleshooting efforts.
  6. Pending Tasks and Next Steps: Outline all pending tasks that you have explicitly been asked to work on, as well as list the next steps you will take for all outstanding work, if applicable. Include code snippets where they add clarity. For any next steps, include direct quotes from the most recent conversation showing exactly what task you were working on and where you left off. This should be verbatim to ensure there's no information loss in context between tasks.

Usage:
<condense>
<message>Your detailed summary</message>
</condense>

Example:
<condense>
<message>
1. Previous Conversation:
  [Detailed description]

2. Current Work:
  [Detailed description]

3. Key Technical Concepts:
  - [Concept 1]
  - [Concept 2]
  - [...]

4. Relevant Files and Code:
  - [File Name 1]
    - [Summary of why this file is important]
    - [Summary of the changes made to this file, if any]
    - [Important Code Snippet]
  - [File Name 2]
    - [Important Code Snippet]
  - [...]

5. Problem Solving:
  [Detailed description]

6. Pending Tasks and Next Steps:
  - [Task 1 details & next steps]
  - [Task 2 details & next steps]
  - [...]
</message>
</condense>

<user_input>
${userInput}
</user_input>

</explicit_instructions>\n
`

export const rememberToolResponse = (userInput: string) =>
  `<explicit_instructions type="remember">
The user has explicitly asked you to save information to the memory bank using the /remember (or /mb) command. The memory bank is a persistent knowledge storage system that helps you remember project-specific patterns, solutions, and preferences across all tasks.

You MUST use the remember tool to save this information. The remember tool is defined below:

Description:
Create a new memory bank entry that will be automatically loaded in all future tasks. This allows you to remember important patterns, solutions, bug fixes, architectural decisions, and preferences that should persist across conversations.

The memory entry should be:
1. **Focused**: Cover a specific topic, pattern, or solution
2. **Actionable**: Include concrete guidelines, code examples, or steps
3. **Reusable**: Written so it can be applied to similar situations
4. **Well-structured**: Use markdown with clear sections

Parameters:
- title: (required) A concise, descriptive title for this memory entry (e.g., "API Error Handling Pattern", "Race Condition Fix")
- content: (required) The markdown content of the memory entry. Should include:
  * Brief description of what this covers
  * Specific guidelines or patterns
  * Code examples where helpful
  * Related files or context
- category: (optional) Category for organization (e.g., "memory-bank", "patterns", "fixes", "architecture")
- tags: (optional) Comma-separated tags for searchability (e.g., "api,errors,patterns")
- scope: (optional) Storage scope - "local" for this project only, "global" for all projects (default: "local")

Usage:
<remember>
<title>Memory entry title</title>
<content>
# Memory Entry Title

## Problem/Context
Brief description of what this addresses

## Solution/Pattern
Specific guidelines and patterns

## Example
\`\`\`typescript
// Code example if applicable
\`\`\`

## Related Files
- path/to/file.ts - Description
</content>
<category>memory-bank</category>
<tags>tag1,tag2,tag3</tags>
<scope>local</scope>
</remember>

Example:
<remember>
<title>CLI Race Condition Fix</title>
<content>
# CLI Race Condition Fix

## Problem
Tasks were being disposed immediately after creation in CLI mode, causing timeouts.

## Root Cause
The \`resolveWebviewView()\` method was called after task creation, unconditionally clearing the task stack.

## Solution
Skip task clearing when in CLI mode:

\`\`\`typescript
if (process.env.HOODY_CLI_MODE === "true") {
  this.log("CLI mode - skipping task clear")
} else {
  await this.removeClineFromStack()
}
\`\`\`

## Related Files
- src/core/webview/ClineProvider.ts:886-903 - Implementation
- cli/src/host/ExtensionHost.ts:325 - Sets HOODY_CLI_MODE env var
</content>
<category>memory-bank</category>
<tags>cli,race-condition,fix</tags>
<scope>local</scope>
</remember>

The user provided the following input when they used the /remember command:
<user_input>
${userInput}
</user_input>

</explicit_instructions>\n
`

export const reviseTodoToolResponse = (userInput: string) =>
  `<explicit_instructions type="revise_todo">
The user has explicitly asked you to help them revise a TODO item using the /revisetodo command. Your task is to improve the TODO description to make it clearer, more actionable, and more accurate based on the conversation context.

To complete this task, you must:

1. **Fetch the TODO List**: Get the current TODO list for this task to see all items
2. **Identify the Target TODO**:
   - If the argument is a number (e.g., "3"), select the TODO at that position (1-indexed)
   - If the argument is text (e.g., "auth bug"), find TODOs that partially match the text
   - If multiple matches are found, list them all and ask which one to revise
3. **Analyze Context**: Review the recent conversation to understand:
   - What work has been completed
   - What challenges were encountered
   - What the TODO actually refers to
4. **Revise the TODO**: Create an improved version that is:
   - Clear and specific (no vague descriptions)
   - Actionable (describes what needs to be done)
   - Accurate (reflects actual work needed based on conversation)
   - Concise but informative
5. **Return the Result**: Present the original and revised TODO side-by-side

Guidelines for revision:
- Make it specific: "Fix bug" → "Fix authentication timeout bug in login endpoint"
- Add context when helpful: "Update docs" → "Update API docs with new digest endpoints"
- Include file references if relevant: "Refactor" → "Refactor ProfilesController merge logic"
- Remove completed work: If the TODO is actually done, say so
- Split if too broad: If one TODO covers multiple distinct tasks, suggest splitting it

Example response format:
\`\`\`
Original TODO: Fix the bug
Status: [ ] (pending)

Revised TODO: Fix authentication timeout bug in src/api/auth.ts caused by expired JWT tokens

Reasoning: Based on the conversation, the bug is specifically about JWT token expiration, not a general authentication issue. This revision makes it clear what needs to be fixed and where.
\`\`\`

The user provided the following argument when they used the /revisetodo command:
<user_input>
${userInput}
</user_input>

IMPORTANT: After revising, ask the user if they want you to update the TODO item automatically using the PATCH endpoint, or if they prefer to do it manually.

</explicit_instructions>\n
`
