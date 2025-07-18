import React, { useState } from "react";
import { useUserSession } from "../../../../hooks/useUserSession";

const ResumeCommandInput = () => {
  const { user, setUser } = useUserSession();
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("");
  const [awaitingInputType, setAwaitingInputType] = useState(null);

  const handleCommandSubmit = async (e) => {
    e.preventDefault();

    if (!user?.selectedTemplate) {
      setOutput("⚠️ No template selected. Please choose one first.");
      return;
    }

    const template = user.selectedTemplate;
    const data = { ...template.data }; // shallow copy

    if (awaitingInputType) {
      // Parse user input based on type
      if (awaitingInputType === "experience" || awaitingInputType === "education") {
        // For multi-line inputs like paragraphs
        data[awaitingInputType] = command.split("\n").filter(Boolean);
      } else if (awaitingInputType === "skills") {
        // For comma-separated lists
        data.skills = command.split(",").map((s) => s.trim());
      } else if (awaitingInputType === "name") {
        // For single-line text
        data.name = command.trim();
      }

      // Update user object immutably, ensuring selectedTemplate is also updated
      setUser((prevUser) => ({
        ...prevUser,
        selectedTemplate: {
          ...prevUser.selectedTemplate,
          data: data, // Assign the modified data object
        },
      }));

      setOutput(await getStructuredData(awaitingInputType, command));
      setAwaitingInputType(null); // Reset awaiting state
      setCommand(""); // Clear command input
      return;
    }

    // Handle command triggers
    const lowerCmd = command.toLowerCase().trim();
    switch (lowerCmd) {
      case "./name":
        setAwaitingInputType("name");
        setOutput("Please enter your full name:");
        break;
      case "./education":
        setAwaitingInputType("education");
        setOutput("Please enter your education background (paragraph):");
        break;
      case "./experience":
        setAwaitingInputType("experience");
        setOutput("Please describe your professional experience (paragraph):");
        break;
      case "./skills":
        setAwaitingInputType("skills");
        setOutput("Please list your skills (comma-separated):");
        break;
      default:
        setOutput("❌ Unknown command. Try ./name, ./education, ./experience, or ./skills");
        break;
    }

    setCommand(""); // Clear command input after initial command is processed
  };

  const getStructuredData = async (type, input) => {
    switch (type) {
      case "name":
        return `👤 Name updated: ${input}`;
      case "skills":
        return `🛠️ Skills updated: ${input}`;
      case "education":
        return `🎓 Education updated:\n${input}`;
      case "experience":
        return `💼 Experience updated:\n${input}`;
      default:
        return "⚠️ Unrecognized input.";
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
        📂 Terminal-Style Resume Builder
      </h2>
      <form onSubmit={handleCommandSubmit} className="mb-4">
        <input
          type="text"
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg
                     bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition duration-200 ease-in-out placeholder-gray-500 dark:placeholder-gray-400"
          value={command}
          placeholder={awaitingInputType ? "Enter your input..." : "Type a command like ./education"}
          onChange={(e) => setCommand(e.target.value)}
          aria-label="Resume command input"
        />
      </form>
      {output && (
        <div
          className="bg-gray-100 dark:bg-gray-800 text-sm p-4 rounded-lg
                     text-gray-800 dark:text-gray-200 whitespace-pre-wrap
                     font-mono" // Using a monospace font for a terminal feel
          role="status"
          aria-live="polite"
        >
          {output}
        </div>
      )}
    </div>
  );
};

export default ResumeCommandInput;