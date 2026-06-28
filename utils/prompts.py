SUMMARY_PROMPT = """
You are an expert study assistant. Summarize the following educational text into:
1. short_summary
2. detailed_summary
3. chapter_wise_summary
4. key_points
5. important_keywords
6. definitions
7. formulas
Return a JSON object with these keys.
Text:
{content}
"""

NOTES_PROMPT = """
Create a set of smart study notes from the following text.
Return a JSON object with keys: title, overview, section_notes, takeaways.
Text:
{content}
"""

FLASHCARD_PROMPT = """
Create flashcards from the text. Return a JSON object with a list of cards where each card has front and back.
Text:
{content}
"""

QUIZ_PROMPT = """
Create a quiz from the text. Return a JSON object with a list of questions. Each question should have id, type, question, options, correct_answer, explanation.
Text:
{content}
"""

INTERVIEW_PROMPT = """
Generate technical, conceptual, and HR-style interview questions from the text. Return JSON with arrays for each type.
Text:
{content}
"""

PLANNER_PROMPT = """
Create a personalized study plan based on the content, exam date, and hours per day. Return JSON with a title, study_days, and tips.
Text:
{content}
Exam date: {exam_date}
Hours/day: {hours_per_day}
"""

TRANSLATION_PROMPT = """
Translate the content into {target_language}. Return JSON with translated_text.
Content:
{content}
"""
