export const askAiQuestion = async (question) => {
  const response = await fetch("http://localhost:9090/api/qna", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error("AI server error");
  }

  return response.json();
};
