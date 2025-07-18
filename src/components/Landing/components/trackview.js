const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby-pADZ8uiS8hzUpqF-2L3MzirH8XNbE6YbYvBQ-vta5v88wBiZWVkleS0WugCA3Y8h/exec";

export const trackView = async (question) => {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "view",
        question,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("View tracking failed:", err);
  }
};
